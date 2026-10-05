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


def request(message, language="en", history=None, current_screen=None, context=None):
    return ChatAssistantRequest(
        message=message,
        language=language,
        history=history or [],
        current_screen=current_screen,
        context=context,
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

    hindi_requests = ["मुझसे हिंदी में बात करो", "हिंदी में बताओ", "speak Hindi", "Hindi me baat karo", "hindi mai bolo"]
    for message in hindi_requests:
        response = _get_local_grounded_reply(request(message))
        assert response.intent == "language_change"
        assert response.language == "hi"
        assert "हिंदी" in response.reply

    english = _get_local_grounded_reply(request("English please", "mr"))
    assert english.language == "en"
    assert "English" in english.reply
    assert classify_intent("use English") == "language_change"
    assert classify_intent("I want English") == "language_change"
    assert classify_intent("अंग्रेज़ी") == "language_change"

    for message in (
        "change language to Marathi",
        "chnage language to marathi",
        "Marathi me baat karo",
        "mujhse Marathi mein baat karo",
        "marathi mai baat karo",
        "marathi mai bolo",
        "maraythi me bolo",
        "Marathi madhye bola",
        "माझ्याशी मराठीत बोला",
        "मराठीत उत्तर द्या",
        "मराठीत बोलायचं आहे",
    ):
        result = _get_local_grounded_reply(request(message))
        assert result.intent == "language_change"
        assert result.selected_language == "mr"
    assert classify_intent("मराठी") == "language_change"


def test_negative_english_comprehension_does_not_switch_language():
    selected_context = {"selected_language": "mr"}
    history = [
        ChatMessage(role="user", content="talk in marathi"),
        ChatMessage(role="assistant", content="नक्की. आता पुढे माझी उत्तरे मराठीत असतील."),
    ]
    for message in (
        "I don't understand English",
        "I dont understand english",
        "English samajh nahi aati",
        "mujhe English samajh nahi aati",
        "मला इंग्रजी समजत नाही",
        "English nahi samajhta",
        "English samjat nahi",
    ):
        result = _get_local_grounded_reply(request(message, language="en", history=history, context=selected_context))
        assert result.intent == "language_confusion"
        assert result.selected_language == "mr"
        assert "मराठीत" in result.reply
        assert "English" not in result.reply

    no_selection = _get_local_grounded_reply(request("I don't understand English"))
    assert no_selection.intent == "language_confusion"
    assert no_selection.selected_language == "en"
    assert "Which language" in no_selection.reply


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


def test_hinglish_and_marathi_roman_workflow_phrases_route_narrowly():
    app_phrases = (
        "app kse chalvaycha",
        "app kasa use karaycha",
        "app kasa vapraycha",
        "app kas use karu",
        "app kasa chalavaycha",
        "screening kasa karaycha",
        "screening kas karu",
        "result kasa baghaycha",
        "child add kasa karaycha",
        "mul register kasa karaycha",
        "baccha kaise add kare",
        "app kaise chalaye",
        "screening kaise kare",
    )
    for message in app_phrases:
        assert classify_intent(message) == "app_usage", message

    assert classify_intent("red ala tar kay") == "referral"
    assert classify_intent("referral kasa karaycha") == "referral"


def test_exact_marathi_language_memory_conversation_regression():
    history = []
    context = {"selected_language": "en"}

    selected = _get_local_grounded_reply(request("chnage language to marathi", history=history, context=context))
    assert selected.selected_language == "mr"
    history.extend([
        ChatMessage(role="user", content="chnage language to marathi"),
        ChatMessage(role="assistant", content=selected.reply),
    ])
    context = {"selected_language": selected.selected_language}

    for message, expected_intent in (
        ("app kse chalvaycha", "app_usage"),
        ("how to use this app", "app_usage"),
        ("i dont understand english", "language_confusion"),
    ):
        result = _get_local_grounded_reply(request(message, language="en", history=history, context=context))
        assert result.intent == expected_intent
        assert result.selected_language == "mr"
        assert "अंगणवाडी" in result.reply or "मराठीत" in result.reply
        if expected_intent == "app_usage":
            assert all(any("\u0900" <= char <= "\u097f" for char in suggestion) for suggestion in result.suggestions)
        history.extend([ChatMessage(role="user", content=message), ChatMessage(role="assistant", content=result.reply)])


def test_hindi_language_command_and_hinglish_app_workflows():
    hindi = _get_local_grounded_reply(request("change language to Hindi"))
    assert hindi.selected_language == "hi"
    assert classify_intent("Hindi me baat karo") == "language_change"

    for message in (
        "app kaise chalaye",
        "app kaise chalana hai",
        "screening kaise kare",
        "screening kaise karu",
        "result kaise dekhe",
        "baccha kaise add kare",
        "bachcha kaise register kare",
    ):
        assert classify_intent(message) == "app_usage", message

    follow_up = _get_local_grounded_reply(request(
        "app kaise chalaye",
        language="en",
        history=[ChatMessage(role="user", content="change language to Hindi")],
    ))
    assert follow_up.selected_language == "hi"
    assert "आंगनवाड़ी" in follow_up.reply


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
    assert data["selected_language"] == "mr"
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
