import pytest
from unittest.mock import AsyncMock, Mock, patch
from fastapi.testclient import TestClient

from app.ai.chat_service import call_gemini_chat, _get_local_grounded_reply
from app.ai.safety import is_safe_text
from app.ai.schemas import ChatAssistantRequest, ChatMessage
from main import app

client = TestClient(app)


def test_safety_filter_catches_diagnostic_claims():
    assert is_safe_text("This observation indicates a developmental area to monitor.")
    assert not is_safe_text("The child has autism.")
    assert not is_safe_text("The patient is diagnosed with ADHD.")
    assert not is_safe_text("This is a confirmed disorder.")


def test_chat_endpoint_returns_local_grounded_response_when_no_api_key():
    with patch("app.core.config.settings.gemini_api_key", None):
        response = client.post(
            "/api/v1/assistant/chat",
            json={
                "message": "How do I start screening in SPARSH?",
                "language": "en",
                "current_screen": "dashboard",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "Screening" in data["reply"] or "screening" in data["reply"]
        assert len(data["suggestions"]) > 0
        assert data["provider"] == "local_grounded"


def test_chat_endpoint_multilingual_hindi():
    with patch("app.core.config.settings.gemini_api_key", None):
        response = client.post(
            "/api/v1/assistant/chat",
            json={
                "message": "?????????? ???? ???? ?????",
                "language": "hi",
                "current_screen": "screening",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["reply"]) > 0
        assert len(data["suggestions"]) > 0
        assert data["provider"] == "local_grounded"


def test_chat_endpoint_multilingual_marathi():
    with patch("app.core.config.settings.gemini_api_key", None):
        response = client.post(
            "/api/v1/assistant/chat",
            json={
                "message": "?????? ??? ???? ??????",
                "language": "mr",
                "current_screen": "screening",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["reply"]) > 0
        assert len(data["suggestions"]) > 0
        assert data["provider"] == "local_grounded"


def test_marathi_multi_turn_flow_no_loop():
    """Verify exact multi-turn progression from Section 8 does not loop in Marathi."""
    # Turn 1: General speech concern
    req1 = ChatAssistantRequest(
        message="??? ??????? ???????? ???? ??? ???. ?? ??????? ?????????? ?????????? ??????? ??? ?????",
        language="mr"
    )
    res1 = _get_local_grounded_reply(req1)
    assert "???? ??? ?????" in res1.reply
    assert "??? ??? ???? ?????" in res1.suggestions

    # Turn 2: Follow-up specific observation
    req2 = ChatAssistantRequest(
        message="??? ??? ???? ?????",
        language="mr",
        history=[
            ChatMessage(role="user", content=req1.message),
            ChatMessage(role="assistant", content=res1.reply)
        ]
    )
    res2 = _get_local_grounded_reply(req2)
    assert "12 ?? 18 ?????" in res2.reply
    assert "???????? ??? ????? ???????" in res2.suggestions
    assert res2.reply != res1.reply  # Distinct, no loop

    # Turn 3: Parent guidance
    req3 = ChatAssistantRequest(
        message="???????? ??? ????? ???????",
        language="mr",
        history=[
            ChatMessage(role="user", content=req2.message),
            ChatMessage(role="assistant", content=res2.reply)
        ]
    )
    res3 = _get_local_grounded_reply(req3)
    assert "?????????? ?????????? ?????" in res3.reply
    assert "???????" in res3.reply
    assert res3.reply != res2.reply  # Distinct, no loop

    # Turn 4: Referral criteria
    req4 = ChatAssistantRequest(
        message="????? ?????? ?????? ????",
        language="mr",
        history=[
            ChatMessage(role="user", content=req3.message),
            ChatMessage(role="assistant", content=res3.reply)
        ]
    )
    res4 = _get_local_grounded_reply(req4)
    assert "Red Flags" in res4.reply or "??????? ?????????? ????" in res4.reply
    assert "???, ???????" in res4.suggestions
    assert res4.reply != res3.reply  # Distinct, no loop

    # Turn 5: Affirmative "Did this answer your question?"
    req5 = ChatAssistantRequest(
        message="???, ???????",
        language="mr"
    )
    res5 = _get_local_grounded_reply(req5)
    assert "??? ??? ???????? ??? ???? ???" in res5.reply

    # Turn 5b: Negative "No, I need more help"
    req5b = ChatAssistantRequest(
        message="????, ???? ??? ???",
        language="mr"
    )
    res5b = _get_local_grounded_reply(req5b)
    assert "????? ??? ???????" in res5b.reply


def test_hindi_multi_turn_flow_no_loop():
    """Verify multi-turn progression in Hindi."""
    req1 = ChatAssistantRequest(
        message="????? ?? ????? ??? ??????? ?? ??? ??",
        language="hi"
    )
    res1 = _get_local_grounded_reply(req1)
    assert "???? ?? ?????" in res1.reply

    req2 = ChatAssistantRequest(
        message="???? ?? ???? ????? ??",
        language="hi"
    )
    res2 = _get_local_grounded_reply(req2)
    assert "12 ?? 18 ?????" in res2.reply
    assert res2.reply != res1.reply

    req3 = ChatAssistantRequest(
        message="????-???? ?? ???? ???? ????",
        language="hi"
    )
    res3 = _get_local_grounded_reply(req3)
    assert "????-???? ?? ??? ?????????? ??????????" in res3.reply

    req4 = ChatAssistantRequest(
        message="???, ???????",
        language="hi"
    )
    res4 = _get_local_grounded_reply(req4)
    assert "???? ??" in res4.reply

    req4b = ChatAssistantRequest(
        message="????, ?? ??? ?????",
        language="hi"
    )
    res4b = _get_local_grounded_reply(req4b)
    assert "??? ???? ?? ??? ???? ???" in res4b.reply


def test_english_multi_turn_flow_no_loop():
    """Verify multi-turn progression in English."""
    req1 = ChatAssistantRequest(
        message="A child is having difficulty speaking. What developmental area could this relate to?",
        language="en"
    )
    res1 = _get_local_grounded_reply(req1)
    assert "Language & Communication" in res1.reply
    assert any("words" in s.lower() for s in res1.suggestions)

    req2 = ChatAssistantRequest(
        message="Uses very few words",
        language="en"
    )
    res2 = _get_local_grounded_reply(req2)
    assert "Language & Communication" in res2.reply
    assert "12-18 months" in res2.reply
    assert res2.reply != res1.reply

    req3 = ChatAssistantRequest(
        message="What should I advise parents?",
        language="en"
    )
    res3 = _get_local_grounded_reply(req3)
    assert "Developmental Guidance for Parents" in res3.reply
    assert res3.reply != res2.reply

    req4 = ChatAssistantRequest(
        message="Yes, thanks",
        language="en"
    )
    res4 = _get_local_grounded_reply(req4)
    assert "glad" in res4.reply.lower()

    req4b = ChatAssistantRequest(
        message="No, I need more help",
        language="en"
    )
    res4b = _get_local_grounded_reply(req4b)
    assert "help further" in res4b.reply.lower()


def test_current_screen_awareness():
    req_screen = ChatAssistantRequest(
        message="What should I do here?",
        language="en",
        current_screen="screening"
    )
    res_screen = _get_local_grounded_reply(req_screen)
    assert "Screening screen" in res_screen.reply

    req_alerts = ChatAssistantRequest(
        message="alerts",
        language="en",
        current_screen="alerts"
    )
    res_alerts = _get_local_grounded_reply(req_alerts)
    assert "Alerts" in res_alerts.reply


def test_gemini_api_call_success_mock():
    import asyncio

    mock_gemini_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": '{"reply": "SPARSH provides 5 developmental milestone domains.", "suggestions": ["Gross Motor", "Fine Motor"], "follow_up_prompt": "Would you like to know more?"}'
                        }
                    ]
                }
            }
        ]
    }
    mock_post_response = Mock()
    mock_post_response.status_code = 200
    mock_post_response.json = Mock(return_value=mock_gemini_response)

    with patch("app.core.config.settings.gemini_api_key", "mock-gemini-key"), \
         patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_post_response
        req = ChatAssistantRequest(message="Tell me about milestone domains", language="en")
        res = asyncio.run(call_gemini_chat(req))
        assert res.reply == "SPARSH provides 5 developmental milestone domains."
        assert "Gross Motor" in res.suggestions
        assert res.provider in ["gemini-2.5-flash-lite", "gemini-3.5-flash-lite"]


def test_gemini_api_failure_falls_back_to_local_grounded():
    import asyncio

    with patch("app.core.config.settings.gemini_api_key", "mock-gemini-key"), \
         patch("httpx.AsyncClient.post", side_effect=Exception("Network error")):
        req = ChatAssistantRequest(message="How to start screening?", language="en")
        res = asyncio.run(call_gemini_chat(req))
        assert res.provider == "local_grounded"
        assert "Screening" in res.reply or "screening" in res.reply


def test_no_api_key_exposure_in_response():
    response = client.post(
        "/api/v1/assistant/chat",
        json={
            "message": "What is SPARSH?",
            "language": "en",
        },
    )
    assert response.status_code == 200
    content = response.text
    assert "AIza" not in content
    assert "api_key" not in content.lower() or content.lower().count("api_key") == 0
