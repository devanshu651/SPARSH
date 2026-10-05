"""SPARSH Chat Assistant Service.

Provides context-aware, safety-guarded conversational AI for Anganwadi workers,
supporting Gemini 2.5 Flash-Lite with robust local-grounded fallback across
English, Hindi, and Marathi.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any

import httpx

from app.ai.safety import is_safe_text
from app.ai.schemas import ChatAssistantRequest, ChatAssistantResponse, ChatMessage
from app.core.config import settings

logger = logging.getLogger(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

SYSTEM_INSTRUCTION = """You are the conversational SPARSH Assistant for Anganwadi Workers.

SPARSH is a developmental screening and follow-up support platform. It records age-appropriate observations and shows a screening risk indication; it does not diagnose autism, ADHD, developmental disorders, speech disorders, neurological disorders, hearing loss, or vision disorders.

Use only these confirmed result follow-ups: GREEN: continue routine monitoring. YELLOW: monitor affected domains and re-screen after one month. RED: the configured recommendation is to generate a referral to the Primary Health Centre. The existing referral workflow accepts RED screenings only. Do not invent destinations, appointments, thresholds, clinical advice, or app features. Never override a result shown by SPARSH.

Answer the user's current intent directly. Use prior turns as conversation context, including the language the user requested. The selected response language is authoritative: the language used to type the latest message must not override it. A statement that the user does not understand a language is not a request to switch to that language; keep the selected language, or ask which language they prefer if none was selected. Do not restart with an introduction or repeat the previous answer. Treat informal Hinglish and mixed-language phrasing charitably. If the user requests a language, acknowledge it and keep using it until asked to switch. The required response language is {language} (en=English, hi=Hindi, mr=Marathi).

For child-development questions, give general, cautious screening guidance only. Do not diagnose or prescribe. Say when you cannot confirm a platform detail.

Return only a JSON object with: reply (string), suggestions (2-4 concise, relevant strings), and follow_up_prompt (string). Keep the tone friendly, practical, concise, and suitable for an Anganwadi Worker."""


def _repair_mojibake(text: str) -> str:
    """Recover common UTF-8-as-Latin-1 Devanagari input when possible."""
    if "à¤" not in text and "à¦" not in text:
        return text
    try:
        repaired = text.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return text
    return repaired if any("\u0900" <= char <= "\u097f" for char in repaired) else text


def _normalize_message(text: str) -> str:
    return " ".join(_repair_mojibake(text).casefold().replace("’", "'").replace("=", "").split())


def _is_negative_language_request(message: str) -> bool:
    text = _normalize_message(message)
    negative_phrases = (
        "i don't understand english", "i dont understand english", "i do not understand english",
        "english samajh nahi aati", "english samajh nahi aata", "mujhe english samajh nahi aati",
        "english nahi samajhta", "english nahi samajhti", "english samjat nahi",
        "मला इंग्रजी समजत नाही", "इंग्रजी समजत नाही", "मला इंग्रजी कळत नाही",
    )
    return any(phrase in text for phrase in negative_phrases)


def _has_language_cue(text: str, cues: tuple[str, ...]) -> bool:
    for cue in cues:
        if cue.isascii() and cue.replace(" ", "").isalpha():
            if re.search(rf"\b{re.escape(cue)}\b", text):
                return True
        elif cue in text:
            return True
    return False


def _requested_language(message: str) -> str | None:
    text = _normalize_message(message)
    compact = "".join(char for char in text if char.isalnum())
    plain = text.strip(" ?!.,")
    if _is_negative_language_request(text):
        return None

    if plain in {"मराठी", "मराठीत", "मराठीमध्ये"}:
        return "mr"
    if plain in {"हिंदी", "हिन्दी", "हिंदीमें"}:
        return "hi"
    if plain in {"इंग्रजी", "इंग्लिश", "अंग्रेज़ी", "अंग्रेजी"}:
        return "en"

    english_cues = ("change", "chnage", "switch", "set", "talk", "speak", "reply", "respond", "use", "want", "please", "me baat", "me bolo", "mein bolo", "mai bolo", "में बात", "में बोल")
    hindi_cues = ("change", "chnage", "switch", "set", "talk", "speak", "reply", "respond", "use", "want", "please", "baat", "bolo", "bol", "me", "mein", "mai", "में", "बात", "बोल", "बताओ", "मुझसे")
    marathi_cues = ("change", "chnage", "switch", "set", "talk", "speak", "reply", "respond", "use", "want", "please", "baat", "bolo", "bol", "me", "mein", "mai", "madhye", "madhe", "माझ्याशी", "मराठीत", "मध्ये", "बोला", "बोल", "उत्तर", "सांगा", "बोलायचं")

    has_english = any(token in text for token in ("english", "इंग्रजी", "इंग्लिश", "अंग्रेज़ी", "अंग्रेजी"))
    has_hindi = any(token in text for token in ("hindi", "हिंदी", "हिन्दी"))
    has_marathi = any(token in text for token in ("marathi", "maraythi", "marati", "मराठी"))

    if compact in {"mr", "marathi", "maraythi", "marati"} or (has_marathi and _has_language_cue(text, marathi_cues)):
        return "mr"
    if compact in {"hi", "hindi", "hindii"} or (has_hindi and _has_language_cue(text, hindi_cues)):
        return "hi"
    if compact in {"en", "english"} or (has_english and _has_language_cue(text, english_cues)):
        return "en"
    return None


def _selected_language(req: ChatAssistantRequest) -> str:
    explicit = _requested_language(req.message)
    if explicit:
        return explicit
    context_language = (req.context or {}).get("selected_language")
    if context_language in {"en", "hi", "mr"}:
        return context_language
    for message in reversed(req.history):
        if message.role == "user":
            previous_selection = _requested_language(message.content)
            if previous_selection:
                return previous_selection
    return req.language


def classify_intent(message: str) -> str:
    """Classify common conversational and SPARSH intents before topic routing."""
    text = _normalize_message(message)
    if _is_negative_language_request(text):
        return "language_confusion"
    language = _requested_language(text)
    if language:
        return "language_change"

    compact = "".join(char for char in text if char.isalnum())
    if text.strip("!., ") in {"hello", "hi", "hey", "namaste", "hi there", "hello there", "नमस्ते", "नमस्कार"}:
        return "greeting"
    if any(term in text for term in ("what is sparsh", "about sparsh", "tell me about sparsh", "sparsh kya hai", "स्पर्श क्या है")):
        return "sparsh_identity"
    if any(term in text for term in (
        "how to use", "how do i use", "how does sparsh work", "how sparsh works",
        "what can i do here", "use this app", "use the app", "app kasa use",
        "sparsh kasa vapraycha", "app kasa vapraycha", "app कैसे", "ऐप कैसे",
        "हे app कसे", "हे अॅप कसे", "इस ऐप को कैसे", "इस app को कैसे",
        "app kse chalvaycha", "app kas chalvaycha", "app kasa chalvaycha", "app kasa chalavaycha",
        "app kas use karu", "app kasa use karaycha", "app kasa vapraycha", "app kaise chalaye",
        "screening kasa karaycha", "screening kas karu", "screening kaise kare",
        "result kasa baghaycha", "child add kasa karaycha", "mul register kasa karaycha",
        "baccha kaise add kare", "app kaise chalana hai", "app kaise chalate hai",
        "screening kaise karu", "result kaise dekhe", "bacha kaise add kare",
        "bachcha kaise register kare", "ऐप कैसे चलाएं", "स्क्रीनिंग कैसे करें", "बच्चे को कैसे जोड़ें",
    )) or ("sparsh" in text and any(word in text for word in ("use", "work", "vapray", "वापर"))):
        return "app_usage"
    if any(term in text for term in ("screening kya", "what is screening", "what does screening", "screening kaise", "why screening", "developmental screening", "स्क्रीनिंग क्या", "स्क्रीनिंग म्हणजे काय")):
        return "screening_explanation"
    if any(term in text for term in ("referral", "deic", "doctor ko kab", "red result", "red ala", "red aala", "लाल निकाल", "रेफरल", "संदर्भ प्रक्रिया")):
        return "referral"
    if any(term in text for term in ("what does", "result", "meaning", "matlab", "ka matlab", "result samj", "निकाल", "परिणाम", "green", "yellow", "red", "हरा", "पीला", "लाल")):
        return "result_explanation"
    if any(term in text for term in ("audio visual", "audio-visual", "hearing", "vision", "ऐकू", "दृष्टी", "श्रवण")):
        return "audio_visual_assessment"
    if any(term in text for term in ("age", "checkpoint", "months old", "वय", "महिन्यांचा", "चेकपॉइंट")):
        return "age_checkpoint"
    if any(term in text for term in ("screening", "स्क्रीनिंग", "screen kar", "screening kasa")):
        return "screening_explanation"
    if any(term in text for term in ("speech", "language delay", "speech delay", "few words", "milestone", "developmental", "motor", "cognitive", "bol", "bhasha", "भाषा", "बोलण्यात", "वाणी")):
        return "developmental_question"
    if text in {"start screening", "open screening", "screening सुरु करा", "स्क्रीनिंग शुरू करें"}:
        return "navigation"
    if any(term in text for term in ("navigate", "where is", "open screen", "go to", "alerts", "what should i do here", "कुठे आहे", "कहां है")):
        return "navigation"
    if text:
        return "unsupported"
    return "greeting"


def _reply(req: ChatAssistantRequest, intent: str, language: str) -> ChatAssistantResponse:
    """Short, grounded replies for intents that must work without an LLM."""
    en = language == "en"
    hi = language == "hi"
    if intent == "language_confusion":
        replies = {
            "en": "Sorry about that. Which language would you prefer: Marathi, Hindi, or English? I’ll keep using it until you ask me to switch.",
            "hi": "समझ गया। मैं हिंदी में जवाब देता रहूँगा। अगर आप दूसरी भाषा चाहते हैं, तो उसका नाम बताइए।",
            "mr": "समजलं. मी मराठीतच उत्तर देत राहीन. तुम्हाला दुसरी भाषा हवी असल्यास तिचे नाव सांगा.",
        }
        suggestions = {
            "en": ["Marathi", "Hindi", "English"],
            "hi": ["मराठी", "हिंदी", "अंग्रेज़ी"],
            "mr": ["मराठी", "हिंदी", "इंग्रजी"],
        }
        prompt = "Which language should I use?" if en else ("कौन-सी भाषा इस्तेमाल करूँ?" if hi else "कोणती भाषा वापरू?")
        return ChatAssistantResponse(reply=replies[language], suggestions=suggestions[language], follow_up_prompt=prompt, provider="local_grounded", language=language, selected_language=language, intent=intent)

    if intent == "language_change":
        reply = {
            "en": "Sure. I’ll reply in English from now on. Ask me about using SPARSH, screening, results, or referrals.",
            "hi": "ज़रूर। अब से मेरे जवाब हिंदी में होंगे। आप SPARSH, स्क्रीनिंग, परिणाम या रेफ़रल के बारे में पूछ सकते हैं।",
            "mr": "नक्की. आता पुढे माझी उत्तरे मराठीत असतील. SPARSH वापरणे, स्क्रीनिंग, निकाल किंवा रेफरल याबद्दल विचारा.",
        }[language]
        suggestions = {
            "en": ["How to use SPARSH", "Start screening", "Understand results", "Referral process"],
            "hi": ["SPARSH कैसे इस्तेमाल करें", "स्क्रीनिंग शुरू करें", "परिणाम समझें", "रेफ़रल प्रक्रिया"],
            "mr": ["SPARSH कसे वापरायचे", "स्क्रीनिंग सुरू करा", "निकाल समजून घ्या", "रेफरल प्रक्रिया"],
        }[language]
        return ChatAssistantResponse(reply=reply, suggestions=suggestions, follow_up_prompt="What would you like help with?" if en else ("आपको किस बारे में मदद चाहिए?" if hi else "तुम्हाला कशाबद्दल मदत हवी आहे?"), provider="local_grounded", language=language, selected_language=language, intent=intent)

    if intent == "app_usage":
        reply = {
            "en": "SPARSH helps Anganwadi Workers record developmental screening and follow-up:\n1. Sign in.\n2. Open your Anganwadi Centre; select it if the app asks.\n3. Select a child, or register a new child.\n4. Enter the child and health details requested by the form.\n5. Open Screening to start an age-based screening.\n6. Record each observation as Yes, No, or Unsure.\n7. Review the screening result shown by SPARSH.\n8. If the result is RED, use the existing referral workflow and follow its prompts.\n9. Use History/Records to review past screenings and follow-up.",
            "hi": "SPARSH आंगनवाड़ी कार्यकर्ताओं को विकासात्मक स्क्रीनिंग और फॉलो-अप दर्ज करने में मदद करता है:\n1. साइन इन करें।\n2. अपना आंगनवाड़ी केंद्र खोलें; ऐप पूछे तो उसे चुनें।\n3. बच्चे को चुनें या नए बच्चे का पंजीकरण करें।\n4. फ़ॉर्म में मांगी गई बच्चे और स्वास्थ्य की जानकारी भरें।\n5. उम्र के अनुसार स्क्रीनिंग शुरू करने के लिए Screening खोलें।\n6. हर अवलोकन के लिए हाँ, नहीं या पता नहीं दर्ज करें।\n7. SPARSH में दिखाया गया स्क्रीनिंग परिणाम देखें।\n8. RED परिणाम हो तो मौजूदा रेफ़रल प्रक्रिया खोलकर उसके चरणों का पालन करें।\n9. पिछली स्क्रीनिंग और फॉलो-अप के लिए History/Records देखें।",
            "mr": "SPARSH अंगणवाडी सेविकांना विकासात्मक स्क्रीनिंग आणि फॉलो-अप नोंदवण्यास मदत करते:\n1. साइन इन करा.\n2. आपले अंगणवाडी केंद्र उघडा; अॅपने विचारल्यास ते निवडा.\n3. मुलाची नोंद निवडा किंवा नवीन मुलाची नोंदणी करा.\n4. फॉर्ममध्ये विचारलेली मुलाची आणि आरोग्याची माहिती भरा.\n5. वयानुसार स्क्रीनिंग सुरू करण्यासाठी Screening उघडा.\n6. प्रत्येक निरीक्षणासाठी होय, नाही किंवा खात्री नाही नोंदवा.\n7. SPARSH मध्ये दाखवलेला स्क्रीनिंग निकाल पाहा.\n8. RED निकाल असल्यास उपलब्ध रेफरल प्रक्रिया उघडून तिच्या सूचना पाळा.\n9. मागील स्क्रीनिंग आणि फॉलो-अपसाठी History/Records पाहा.",
        }[language]
        suggestions = {
            "en": ["Start screening", "Understand results", "Referral process"],
            "hi": ["स्क्रीनिंग शुरू करें", "परिणाम समझें", "रेफ़रल प्रक्रिया"],
            "mr": ["स्क्रीनिंग सुरू करा", "निकाल समजून घ्या", "रेफरल प्रक्रिया"],
        }[language]
        return ChatAssistantResponse(reply=reply, suggestions=suggestions, follow_up_prompt="Would you like help with a specific step?" if en else ("किसी चरण में मदद चाहिए?" if hi else "एखाद्या टप्प्यासाठी मदत हवी आहे का?"), provider="local_grounded", language=language, selected_language=language, intent=intent)

    content: dict[str, tuple[str, list[str], str]] = {
        "screening_explanation": (
            "SPARSH asks age-appropriate questions across its configured developmental domains and uses the recorded answers to show a screening risk indication. It is a screening tool, not a diagnosis.",
            ["How to use SPARSH", "Understand results", "Referral process"], "Would you like help with a screening step?"),
        "result_explanation": (
            "SPARSH shows a screening indication, not a diagnosis. GREEN: continue routine monitoring. YELLOW: monitor the affected domains and re-screen after one month. RED: the configured recommendation is to generate a referral to the Primary Health Centre using the existing referral workflow.",
            ["What does Green mean?", "What does Yellow mean?", "What happens after Red?"], "Which result would you like me to explain?"),
        "referral": (
            "In SPARSH, a referral can be generated for a RED screening result. Open the result/referral workflow and follow its prompts; the configured recommendation is referral to the Primary Health Centre. A screening result is not a diagnosis. For a result other than RED, follow the screening recommendation shown in SPARSH.",
            ["Understand results", "How to use SPARSH", "Explain screening"], "Would you like help understanding a result?"),
        "audio_visual_assessment": (
            "SPARSH includes an audio-visual assessment for recording observations. Follow the prompts shown in that assessment and record what you observe; it does not diagnose a hearing or vision condition.",
            ["Explain screening", "Understand results", "How to use SPARSH"], "Would you like help with another SPARSH step?"),
        "age_checkpoint": (
            "SPARSH uses the child's recorded age to show the configured age-appropriate screening questions. I can’t confirm a checkpoint for a child without the age and the screening content shown in the app. The screening indication is not a diagnosis.",
            ["Explain screening", "How to use SPARSH", "Understand results"], "What is the child's age in months?"),
        "developmental_question": (
            "A speech or communication concern relates to the Language & Communication area. SPARSH can record age-appropriate observations, but it cannot diagnose a condition. What have you observed, and how old is the child?",
            ["Explain screening", "Understand results", "Referral process"], "What observation would you like to discuss?"),
        "sparsh_identity": (
            "SPARSH is a developmental screening and follow-up support platform for Anganwadi Workers. It records age-appropriate observations and shows a screening indication; it does not diagnose a condition.",
            ["How to use SPARSH", "Explain screening", "Understand results"], "Would you like a quick guide to using the app?"),
        "greeting": (
            "Hi! What would you like help with in SPARSH?",
            ["How to use SPARSH", "Start screening", "Understand results", "Referral process"], "What would you like to do?"),
        "navigation": (
            (f"You're on the {req.current_screen} screen. Use the app navigation to open the relevant area. Screening records age-appropriate observations; History/Records shows earlier screening activity." if req.current_screen else "Use the app navigation to open the relevant area. Screening records age-appropriate observations; History/Records shows earlier screening activity.") + " I can explain a step if you tell me what you want to do.",
            ["How to use SPARSH", "Explain screening", "Understand results"], "Which screen are you trying to find?"),
        "unsupported": (
            "I can help with SPARSH navigation, screening, results, referrals, and general developmental screening questions. I can’t confirm or assist with that request. What would you like to do in SPARSH?",
            ["How to use SPARSH", "Explain screening", "Understand results"], "What SPARSH task can I help with?"),
    }
    localized: dict[str, dict[str, tuple[str, list[str], str]]] = {
        "hi": {
            "language_confusion": ("समझ गया। मैं हिंदी में जवाब देता रहूँगा। अगर आप दूसरी भाषा चाहते हैं, तो उसका नाम बताइए।", ["मराठी", "हिंदी", "अंग्रेज़ी"], "कौन-सी भाषा इस्तेमाल करूँ?"),
            "screening_explanation": ("SPARSH बच्चे की उम्र के अनुसार निर्धारित विकासात्मक क्षेत्रों के प्रश्न पूछता है और दर्ज उत्तरों से स्क्रीनिंग संकेत दिखाता है। यह स्क्रीनिंग है, निदान नहीं।", ["SPARSH कैसे इस्तेमाल करें", "परिणाम समझें", "रेफ़रल प्रक्रिया"], "क्या स्क्रीनिंग के किसी चरण में मदद चाहिए?"),
            "result_explanation": ("SPARSH स्क्रीनिंग संकेत दिखाता है, निदान नहीं। GREEN: नियमित निगरानी जारी रखें। YELLOW: प्रभावित क्षेत्रों पर नज़र रखें और एक महीने बाद फिर स्क्रीनिंग करें। RED: निर्धारित सुझाव के अनुसार मौजूदा प्रक्रिया से Primary Health Centre के लिए रेफ़रल बनाएँ।", ["GREEN का क्या अर्थ है?", "YELLOW का क्या अर्थ है?", "RED के बाद क्या करें?"], "किस रंग के परिणाम को समझना चाहेंगे?"),
            "referral": ("SPARSH में RED स्क्रीनिंग परिणाम पर रेफ़रल बनाया जा सकता है। परिणाम/रेफ़रल प्रक्रिया खोलकर दिए गए चरणों का पालन करें; निर्धारित सुझाव Primary Health Centre के लिए रेफ़रल है। स्क्रीनिंग निदान नहीं है।", ["परिणाम समझें", "SPARSH कैसे इस्तेमाल करें", "स्क्रीनिंग समझें"], "क्या किसी परिणाम को समझने में मदद चाहिए?"),
            "audio_visual_assessment": ("SPARSH में सुनने और देखने से जुड़े अवलोकन दर्ज करने के लिए ऑडियो-विज़ुअल आकलन है। उसमें दिए निर्देशों का पालन करें और अपना अवलोकन दर्ज करें; यह किसी स्थिति का निदान नहीं करता।", ["स्क्रीनिंग समझें", "परिणाम समझें", "SPARSH कैसे इस्तेमाल करें"], "क्या किसी और चरण में मदद चाहिए?"),
            "age_checkpoint": ("SPARSH बच्चे की दर्ज उम्र के आधार पर निर्धारित उम्र-अनुकूल स्क्रीनिंग प्रश्न दिखाता है। बच्चे की उम्र और ऐप में दिख रही स्क्रीनिंग सामग्री के बिना मैं किसी खास चेकपॉइंट की पुष्टि नहीं कर सकता। यह निदान नहीं है।", ["स्क्रीनिंग समझें", "SPARSH कैसे इस्तेमाल करें", "परिणाम समझें"], "बच्चे की उम्र महीनों में कितनी है?"),
            "developmental_question": ("बोलने या संवाद की चिंता Language & Communication क्षेत्र से जुड़ती है। SPARSH उम्र-अनुकूल अवलोकन दर्ज कर सकता है, लेकिन निदान नहीं करता। आपने क्या देखा है और बच्चे की उम्र कितनी है?", ["स्क्रीनिंग समझें", "परिणाम समझें", "रेफ़रल प्रक्रिया"], "आप किस अवलोकन पर बात करना चाहेंगे?"),
            "sparsh_identity": ("SPARSH आंगनवाड़ी कार्यकर्ताओं के लिए विकासात्मक स्क्रीनिंग और फॉलो-अप का प्लेटफ़ॉर्म है। यह उम्र-अनुकूल अवलोकन दर्ज करके स्क्रीनिंग संकेत दिखाता है; यह निदान नहीं करता।", ["SPARSH कैसे इस्तेमाल करें", "स्क्रीनिंग समझें", "परिणाम समझें"], "क्या ऐप इस्तेमाल करने की छोटी गाइड चाहिए?"),
            "greeting": ("नमस्ते! SPARSH में आपको किस काम में मदद चाहिए?", ["SPARSH कैसे इस्तेमाल करें", "स्क्रीनिंग शुरू करें", "परिणाम समझें", "रेफ़रल प्रक्रिया"], "आप क्या करना चाहेंगे?"),
            "navigation": ("संबंधित भाग खोलने के लिए ऐप के नेविगेशन का उपयोग करें। स्क्रीनिंग में उम्र-अनुकूल अवलोकन दर्ज होते हैं; History/Records में पिछली गतिविधि देखी जा सकती है। आप काम बताएँ, मैं चरण समझा दूँगा।", ["SPARSH कैसे इस्तेमाल करें", "स्क्रीनिंग समझें", "परिणाम समझें"], "आप कौन-सी स्क्रीन ढूँढ रहे हैं?"),
            "unsupported": ("मैं SPARSH नेविगेशन, स्क्रीनिंग, परिणाम, रेफ़रल और सामान्य विकासात्मक स्क्रीनिंग प्रश्नों में मदद कर सकता हूँ। इस अनुरोध की पुष्टि नहीं कर सकता। SPARSH में क्या करना है?", ["SPARSH कैसे इस्तेमाल करें", "स्क्रीनिंग समझें", "परिणाम समझें"], "SPARSH के किस काम में मदद चाहिए?"),
        },
        "mr": {
            "language_confusion": ("समजलं. मी मराठीतच उत्तर देत राहीन. तुम्हाला दुसरी भाषा हवी असल्यास तिचे नाव सांगा.", ["मराठी", "हिंदी", "इंग्रजी"], "कोणती भाषा वापरू?"),
            "screening_explanation": ("SPARSH मुलाच्या वयानुसार ठरवलेल्या विकास क्षेत्रांतील प्रश्न विचारते आणि नोंदवलेल्या उत्तरांवरून स्क्रीनिंगचा संकेत देते. ही स्क्रीनिंग आहे, निदान नाही.", ["SPARSH कसे वापरायचे", "निकाल समजून घ्या", "रेफरल प्रक्रिया"], "स्क्रीनिंगच्या कोणत्या टप्प्यात मदत हवी आहे?"),
            "result_explanation": ("SPARSH स्क्रीनिंगचा संकेत देते, निदान नाही. GREEN: नियमित निरीक्षण सुरू ठेवा. YELLOW: संबंधित विकास क्षेत्रांचे निरीक्षण करा आणि एका महिन्यानंतर पुन्हा स्क्रीनिंग करा. RED: ठरवलेल्या सूचनेनुसार उपलब्ध प्रक्रियेतून Primary Health Centre साठी रेफरल तयार करा.", ["GREEN चा अर्थ काय?", "YELLOW चा अर्थ काय?", "RED नंतर काय करावे?"], "कोणता रंगाचा निकाल समजावून सांगू?"),
            "referral": ("SPARSH मध्ये RED स्क्रीनिंग निकालासाठी रेफरल तयार करता येते. निकाल/रेफरल प्रक्रिया उघडून दिलेल्या पायऱ्या पाळा; ठरवलेली सूचना Primary Health Centre साठी रेफरलची आहे. स्क्रीनिंग म्हणजे निदान नाही.", ["निकाल समजून घ्या", "SPARSH कसे वापरायचे", "स्क्रीनिंग समजून घ्या"], "निकाल समजून घेण्यासाठी मदत हवी आहे का?"),
            "audio_visual_assessment": ("SPARSH मध्ये ऐकणे आणि पाहणे यासंबंधी निरीक्षणे नोंदवण्यासाठी ऑडिओ-व्हिज्युअल मूल्यांकन आहे. त्यातील सूचना पाळून निरीक्षण नोंदवा; यातून कोणत्याही स्थितीचे निदान होत नाही.", ["स्क्रीनिंग समजून घ्या", "निकाल समजून घ्या", "SPARSH कसे वापरायचे"], "दुसऱ्या टप्प्यासाठी मदत हवी आहे का?"),
            "age_checkpoint": ("SPARSH मुलाच्या नोंदवलेल्या वयानुसार ठरवलेले वय-योग्य स्क्रीनिंग प्रश्न दाखवते. मुलाचे वय आणि अॅपमधील प्रश्न पाहिल्याशिवाय मी विशिष्ट टप्प्याची खात्री देऊ शकत नाही. हा निदानाचा निकाल नाही.", ["स्क्रीनिंग समजून घ्या", "SPARSH कसे वापरायचे", "निकाल समजून घ्या"], "मुलाचे वय महिन्यांत किती आहे?"),
            "developmental_question": ("बोलणे किंवा संवादाबद्दलची चिंता Language & Communication या क्षेत्राशी संबंधित आहे. SPARSH वयानुसार निरीक्षणे नोंदवू शकते, पण निदान करत नाही. तुम्ही काय पाहिले आणि मुलाचे वय किती आहे?", ["स्क्रीनिंग समजून घ्या", "निकाल समजून घ्या", "रेफरल प्रक्रिया"], "कोणत्या निरीक्षणाबद्दल बोलायचे आहे?"),
            "sparsh_identity": ("SPARSH हे अंगणवाडी सेविकांसाठी विकासात्मक स्क्रीनिंग आणि फॉलो-अपचे व्यासपीठ आहे. ते वयानुसार निरीक्षणे नोंदवून स्क्रीनिंगचा संकेत देते; निदान करत नाही.", ["SPARSH कसे वापरायचे", "स्क्रीनिंग समजून घ्या", "निकाल समजून घ्या"], "अॅप वापरण्याची थोडक्यात माहिती हवी आहे का?"),
            "greeting": ("नमस्कार! SPARSH मध्ये कशासाठी मदत हवी आहे?", ["SPARSH कसे वापरायचे", "स्क्रीनिंग सुरू करा", "निकाल समजून घ्या", "रेफरल प्रक्रिया"], "तुम्हाला काय करायचे आहे?"),
            "navigation": ("योग्य भाग उघडण्यासाठी अॅपमधील नेव्हिगेशन वापरा. Screening मध्ये वयानुसार निरीक्षणे नोंदवता येतात; History/Records मध्ये मागील स्क्रीनिंग पाहता येते. तुम्हाला काय करायचे आहे ते सांगा, मी पायऱ्या समजावतो.", ["SPARSH कसे वापरायचे", "स्क्रीनिंग समजून घ्या", "निकाल समजून घ्या"], "कोणती स्क्रीन शोधत आहात?"),
            "unsupported": ("मी SPARSH नेव्हिगेशन, स्क्रीनिंग, निकाल, रेफरल आणि विकासात्मक स्क्रीनिंगविषयी सामान्य प्रश्नांत मदत करू शकतो. या विनंतीची खात्री देता येत नाही. SPARSH मध्ये काय करायचे आहे?", ["SPARSH कसे वापरायचे", "स्क्रीनिंग समजून घ्या", "निकाल समजून घ्या"], "SPARSH मधील कोणत्या कामासाठी मदत हवी आहे?"),
        },
    }
    reply, suggestions, follow_up = localized.get(language, {}).get(intent, content.get(intent, content["unsupported"]))
    return ChatAssistantResponse(reply=reply, suggestions=suggestions, follow_up_prompt=follow_up, provider="local_grounded", language=language, selected_language=language, intent=intent)


def _get_local_grounded_reply(req: ChatAssistantRequest) -> ChatAssistantResponse:
    message = _repair_mojibake(req.message.strip())
    intent = classify_intent(message)
    language = _selected_language(req)
    normalized = req.model_copy(update={"message": message, "language": language})
    return _reply(normalized, intent, language)


async def call_gemini_chat(req: ChatAssistantRequest) -> ChatAssistantResponse:
    """Call Google Generative AI API with safety and grounding."""
    message = _repair_mojibake(req.message.strip())
    intent = classify_intent(message)
    language = _selected_language(req)
    req = req.model_copy(update={"message": message, "language": language})

    # Obvious conversational and SPARSH intents are handled deterministically,
    # so a provider cannot turn a language request into a milestone answer.
    if intent != "developmental_question":
        return _reply(req, intent, language)

    api_key = settings.gemini_api_key
    model = settings.gemini_model or "gemini-2.5-flash-lite"

    if not api_key:
        logger.info("Gemini API key not configured. Using local grounded assistant.")
        return _get_local_grounded_reply(req)

    # Format history and current message
    contents: list[dict[str, Any]] = []

    # Map previous messages, avoiding duplicating current message if already in history
    history_items = req.history[-8:]
    if history_items and history_items[-1].role == "user" and history_items[-1].content.strip() == req.message.strip():
        history_items = history_items[:-1]

    for msg in history_items:
        role = "user" if msg.role == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg.content}]})

    # Add current user message with context hint
    context_prefix = f"[Likely intent: {intent}. Answer this request directly. Selected response language: {req.language}.]\n"
    if req.current_screen:
        context_prefix += f"[Current SPARSH screen: '{req.current_screen}'.]\n"
    if req.context:
        context_prefix += f"[Conversation context: {json.dumps(req.context, ensure_ascii=False)[:1200]}]\n"
    contents.append({"role": "user", "parts": [{"text": f"{context_prefix}{req.message}"}]})

    payload = {
        "system_instruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION.replace("{language}", req.language)}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 800,
            "responseMimeType": "application/json",
        },
    }

    url = f"{GEMINI_API_URL.format(model=model)}?key={api_key}"

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload, headers={"Content-Type": "application/json"})

            # Handle model retirement / unavailability by attempting verified fallback models
            if resp.status_code in [404, 503]:
                for candidate in ["gemini-3.5-flash-lite", "gemini-flash-lite-latest"]:
                    if candidate == model:
                        continue
                    logger.info("Model %s returned %s. Trying fallback model %s.", model, resp.status_code, candidate)
                    fallback_url = f"{GEMINI_API_URL.format(model=candidate)}?key={api_key}"
                    fallback_resp = await client.post(fallback_url, json=payload, headers={"Content-Type": "application/json"})
                    if fallback_resp.status_code == 200:
                        resp = fallback_resp
                        model = candidate
                        break

            if resp.status_code != 200:
                logger.warning("Gemini API returned status %s: %s", resp.status_code, resp.text[:200])
                return _get_local_grounded_reply(req)

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return _get_local_grounded_reply(req)

            content_parts = candidates[0].get("content", {}).get("parts", [])
            if not content_parts or "text" not in content_parts[0]:
                return _get_local_grounded_reply(req)

            raw_text = content_parts[0]["text"]
            try:
                parsed = json.loads(raw_text)
                reply = parsed.get("reply", "")
                suggestions = parsed.get("suggestions", [])
                follow_up = parsed.get("follow_up_prompt")

                # Verify clinical safety
                if not is_safe_text(reply):
                    logger.warning("Gemini reply triggered safety filter. Falling back to local grounded reply.")
                    return _get_local_grounded_reply(req)

                return ChatAssistantResponse(
                    reply=reply,
                    suggestions=suggestions if isinstance(suggestions, list) else [],
                    follow_up_prompt=follow_up,
                    provider=model,
                    language=language,
                    selected_language=language,
                    intent=intent,
                )
            except Exception:
                if is_safe_text(raw_text):
                    return ChatAssistantResponse(
                        reply=raw_text,
                        suggestions=[],
                        provider=model,
                        language=language,
                        selected_language=language,
                        intent=intent,
                    )
                return _get_local_grounded_reply(req)

    except Exception as exc:
        logger.warning("Gemini chat request failed: %s. Using local grounded fallback.", exc)
        return _get_local_grounded_reply(req)
