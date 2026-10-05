import asyncio
from unittest.mock import AsyncMock, Mock, patch

from fastapi.testclient import TestClient

from app.ai.chat_service import (
    _get_local_grounded_reply,
    call_gemini_chat,
    classify_intent,
)
from app.ai.safety import is_safe_text
from app.ai.schemas import ChatAssistantRequest, ChatMessage
from main import app

client = TestClient(app)


def request(message, language="en", history=None, current_screen=None):
    return ChatAssistantRequest(
        message=message,
        language=language,
        history=history or [],
        current_screen=current_screen,
    )


def test_safety_filter_catches_diagnostic_claims():
    assert is_safe_text("This observation indicates an area to monitor.")
    assert not is_safe_text("The child has autism.")
    assert not is_safe_text("The patient is diagnosed with ADHD.")
    assert not is_safe_text("This is a confirmed disorder.")


def test_language_change_intents_and_responses():
    marathi_requests = [
        "talk in marathi",
        "मराठीत बोला",
        "मराठीमध्ये सांगा",
        "marathi madhe bol",
        "maray=thi?",
    ]
    for message in marathi_requests:
        response = _get_local_grounded_reply(request(message))
        assert classify_intent(message) == "language_change"
        assert response.intent == "language_change"
        assert response.language == "mr"
        assert "मराठीत" in response.reply

    hindi_requests = ["मुझसे हिंदी में बात करो", "हिंदी में बताओ", "speak Hindi"]
    for message in hindi_requests:
        response = _get_local_grounded_reply(request(message))
        assert response.intent == "language_change"
        assert response.language == "hi"
        assert "हिंदी" in response.reply

    english = _get_local_grounded_reply(request("English please", "mr"))
    assert english.language == "en"
    assert "English" in english.reply


def test_mojibake_language_request_is_repaired():
    message = "मराठीत बोला".encode("utf-8").decode("latin-1")
    response = _get_local_grounded_reply(request(message))
    assert response.language == "mr"
    assert "मराठीत" in response.reply


def test_language_persists_between_turns_until_switched():
    first = _get_local_grounded_reply(request("talk in marathi"))
    second = _get_local_grounded_reply(request("how to use this app", first.language))
    assert second.language == "mr"
    assert "अंगणवाडी" in second.reply

    switched = _get_local_grounded_reply(request("speak Hindi", second.language))
    follow_up = _get_local_grounded_reply(request("screening kya hai?", switched.language))
    assert switched.language == "hi"
    assert follow_up.language == "hi"
    assert "स्क्रीनिंग" in follow_up.reply
    assert "निदान नहीं" in follow_up.reply


def test_app_usage_is_not_a_developmental_intent():
    for message in ("how to use this app", "SPARSH kasa use karaycha?", "what can I do here?", "Hi, how to use this app?"):
        assert classify_intent(message) == "app_usage"
        response = _get_local_grounded_reply(request(message))
        assert response.intent == "app_usage"
        assert "1." in response.reply and "9." in response.reply
        assert "diagnos" not in response.reply.lower()

    marathi = _get_local_grounded_reply(request("SPARSH kasa use karaycha?", "mr"))
    assert "अंगणवाडी" in marathi.reply


def test_screening_result_and_referral_intents_are_grounded():
    assert classify_intent("screening kya hai?") == "screening_explanation"
    screening = _get_local_grounded_reply(request("screening kya hai?"))
    assert "age-appropriate" in screening.reply
    assert "not a diagnosis" in screening.reply

    assert classify_intent("what does yellow mean?") == "result_explanation"
    yellow = _get_local_grounded_reply(request("what does yellow mean?"))
    assert "one month" in yellow.reply

    assert classify_intent("red result ala tar kay") == "referral"
    red = _get_local_grounded_reply(request("red result ala tar kay", "mr"))
    assert red.language == "mr"
    assert "RED" in red.reply and "Primary Health Centre" in red.reply


def test_speech_question_is_developmental_not_unsupported():
    message = "speech delay ka question"
    assert classify_intent(message) == "developmental_question"
    response = _get_local_grounded_reply(request(message))
    assert "Language & Communication" in response.reply
    assert "diagnos" in response.reply.lower()


def test_non_greeting_turn_does_not_repeat_initial_introduction():
    greeting = _get_local_grounded_reply(request("hello"))
    answer = _get_local_grounded_reply(request("how to use this app", greeting.language))
    assert greeting.intent == "greeting"
    assert "SPARSH Assistant" not in answer.reply


def test_navigation_uses_current_screen_without_changing_app_behavior():
    response = _get_local_grounded_reply(request("What should I do here?", current_screen="screening"))
    assert response.intent == "navigation"
    assert "screening screen" in response.reply.lower()


def test_chat_endpoint_returns_local_response_with_intent_and_language():
    with patch("app.core.config.settings.gemini_api_key", None):
        response = client.post(
            "/api/v1/assistant/chat",
            json={"message": "talk in marathi", "language": "en"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "mr"
    assert data["intent"] == "language_change"
    assert "मराठीत" in data["reply"]
    assert data["provider"] == "local_grounded"


def test_gemini_receives_recent_history_intent_and_selected_language():
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": (
                                '{"reply":"This is a screening indication, not a diagnosis.",'
                                '"suggestions":["Review results","Referral process"],'
                                '"follow_up_prompt":"What did the result show?"}'
                            )
                        }
                    ]
                }
            }
        ]
    }

    with patch("app.core.config.settings.gemini_api_key", "mock-key"), patch(
        "httpx.AsyncClient.post", new_callable=AsyncMock
    ) as mock_post:
        mock_post.return_value = mock_response
        result = asyncio.run(call_gemini_chat(ChatAssistantRequest(
            message="speech delay ka question",
            language="mr",
            history=[
                ChatMessage(role="user", content="talk in marathi"),
                ChatMessage(role="assistant", content="I will reply in Marathi."),
                ChatMessage(role="user", content="speech delay ka question"),
            ],
            current_screen="dashboard",
            context={"selected_language": "mr"},
        )))

    assert result.language == "mr"
    assert result.intent == "developmental_question"
    assert result.reply == "This is a screening indication, not a diagnosis."
    payload = mock_post.call_args.kwargs["json"]
    serialized = str(payload)
    assert "talk in marathi" in serialized
    assert "Likely intent: developmental_question" in serialized
    assert "Selected response language: mr" in serialized


def test_provider_failure_uses_concise_local_developmental_fallback():
    with patch("app.core.config.settings.gemini_api_key", "mock-key"), patch(
        "httpx.AsyncClient.post", side_effect=Exception("Network error")
    ):
        result = asyncio.run(call_gemini_chat(request("speech delay ka question")))
    assert result.provider == "local_grounded"
    assert "Language & Communication" in result.reply


def test_gemini_is_bypassed_for_explicit_language_switch():
    with patch("app.core.config.settings.gemini_api_key", "mock-key"), patch(
        "httpx.AsyncClient.post", new_callable=AsyncMock
    ) as mock_post:
        result = asyncio.run(call_gemini_chat(request("talk in marathi")))
    mock_post.assert_not_called()
    assert result.language == "mr"
    assert result.intent == "language_change"
