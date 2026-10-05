"""SPARSH Chat Assistant Service.

Provides context-aware, safety-guarded conversational AI for Anganwadi workers,
supporting Gemini 2.5 Flash-Lite with robust local-grounded fallback across
English, Hindi, and Marathi.
"""
from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.ai.safety import is_safe_text
from app.ai.schemas import ChatAssistantRequest, ChatAssistantResponse, ChatMessage
from app.core.config import settings

logger = logging.getLogger(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

SYSTEM_INSTRUCTION = """You are the SPARSH Assistant, an integrated professional child-development screening and support assistant operating within the SPARSH (Screening, Prediction, and Referral System for Healthcare) platform.

SPARSH Platform Identity & Mission:
- SPARSH is a professional child-development screening and support platform designed to empower frontline workers (Anganwadi workers, ASHA workers, healthcare supervisors) and authorized clinical users with:
  1. Child registration and longitudinal tracking.
  2. Developmental milestone screening across standardized age checkpoints (12, 18, 24, 36, 48, 60 months).
  3. Age-appropriate developmental assessment across 5 core RBSK domains:
     - Gross Motor (sitting, standing, walking, balance, physical coordination)
     - Fine Motor (grasping, reaching, drawing, using fingers, hand-eye coordination)
     - Language & Communication (cooing, babbling, single words, phrases, understanding commands)
     - Cognitive (curiosity, problem solving, recognizing objects, shapes, attention)
     - Social & Emotional (smiling, eye contact, responding to name, peer play, emotional expression)
  4. Audio-Visual Assessments (observational hearing responsiveness and vision tracking tests).
  5. Automated screening result interpretation with risk stratification:
     - Green (On Track): Normal routine follow-up at the next milestone checkpoint.
     - Yellow (Monitor / Moderate Delay): Targeted home and centre stimulation activities; repeat screening in 1-3 months.
     - Red (At Risk / Red Flag): Critical milestone missed or red flag detected; prompt referral to DEIC (District Early Intervention Centre) or Medical Officer.
  6. Alerts management and referral slip generation to DEIC / PHC.
  7. Evidence-informed child-development guidance and platform navigation.

Strict Narrative & Professional Rules:
- NEVER describe SPARSH as a college project, college assignment, student project, hackathon project, prototype, demo, or academic project. Even if the user asks what SPARSH is, describe it professionally as a dedicated child-development screening and support platform.
- Do not mention internal development details, repositories, GitHub, developers, implementation teams, hackathons, college, or student status unless explicitly required for a technical administrator question.

Platform Knowledge vs. General Child-Development Knowledge:
- For SPARSH platform questions: Stay grounded strictly in the actual SPARSH functionality and known platform behavior. Never invent a feature, workflow, rule, referral policy, threshold, or capability that SPARSH does not actually have. If something is not known or supported by the platform context, clearly state that you cannot confirm it rather than inventing an answer.
- For general child-development questions: Provide useful educational, evidence-informed guidance while strictly adhering to clinical safety.

Clinical Safety Rules (Strict):
1. The assistant is NOT a diagnostic system. Screening is an early identification tool, NOT a medical diagnosis.
2. Never state or imply that a child definitely has autism, ADHD, intellectual disability, speech disorder, developmental delay, hearing loss, vision disorder, or any other clinical diagnosis.
3. Always use cautious, observational, supportive language such as:
   - "This observation may be an area worth observing."
   - "This can be associated with the speech and language developmental domain."
   - "Further developmental assessment may be appropriate."
   - "A qualified healthcare or developmental professional should assess the child."
4. Do not prescribe medication, provide dosages, or give unsafe medical instructions.
5. In case of acute medical emergencies (seizures, severe trauma, respiratory distress, high fever, sudden unresponsiveness), immediately advise seeking urgent in-person medical care at the nearest hospital or PHC.
6. Use DEIC (District Early Intervention Centre) terminology appropriately when discussing referral pathways supported by SPARSH.

Conversational Multi-Turn Behavior:
- Behave as a dynamic conversational assistant, NOT a static FAQ.
- Process every user message as the current conversational turn, using previous conversation turns strictly as context.
- Do not repeat the previous answer unless the user explicitly asks for it.
- If the user selects a suggested follow-up option (such as 'खूप कमी शब्द बोलतो' or 'पालकांना काय सल्ला द्यावा?'), treat that option as a new turn and respond specifically to it, deepening the conversation.
- Maintain conversational progression: general concern -> specific observation -> parent guidance / screening / referral -> referral criteria / next steps.
- When useful, provide 2–4 contextually relevant, non-repetitive follow-up options.
- If the user asks whether the answer solved their problem or needs more help, respond appropriately and continue without restarting the conversation.
- Always respond strictly in the requested language ({language}: en = English, hi = Hindi, mr = Marathi).

Output Format:
You MUST respond with a valid JSON object with the following fields:
{
  "reply": "Your clear, empathetic answer formatted in readable paragraphs or bullet points.",
  "suggestions": ["2 to 4 short, relevant follow-up options the user can select next"],
  "follow_up_prompt": "Did this answer your question? or a relevant next step question"
}
"""


def _get_local_grounded_reply(req: ChatAssistantRequest) -> ChatAssistantResponse:
    """Deterministic, high-quality grounded responses when Gemini is unavailable.
    
    Uses strict Intent Priority:
    1. "Did this answer your question?" (Yes / No)
    2. About SPARSH / Platform Identity
    3. Referral & DEIC (When to refer, how to refer, red flags)
    4. Parent Guidance & Stimulation Advice
    5. Specific Detailed Milestone Observations (Few words, stuttering, eye contact/name, motor, A/V)
    6. Broad Developmental Questions (General speech concern, domains overview)
    7. Platform Workflows & Screens (Screening, Registration, Results/Risk, Alerts, Current Screen)
    8. General Fallback
    """
    msg = req.message.strip().lower()
    lang = req.language
    screen = req.current_screen or ""

    # -------------------------------------------------------------
    # 1. "Did this answer your question?" flow
    # -------------------------------------------------------------
    affirmative_keys = [
        "yes", "yes, thanks", "yes thanks", "yes, thank you", "thank you", "thanks",
        "होय", "होय, धन्यवाद", "होय धन्यवाद", "धन्यवाद", "हो नक्कीच", "हो",
        "हाँ", "हाँ, धन्यवाद", "हाँ धन्यवाद", "शुक्रिया", "ठीक है", "haan", "ha"
    ]
    if msg in affirmative_keys or any(k in msg for k in ["होय, धन्यवाद", "हाँ, धन्यवाद", "yes, thanks", "होय धन्यवाद", "हाँ धन्यवाद"]) or (
        any(k in msg for k in ["होय", "हाँ", "yes", "धन्यवाद", "thanks"]) and not any(n in msg for n in ["नाही", "नहीं", "no", "not", "नको"])
    ):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="बहुत बढ़िया! मुझे खुशी है कि मैं आपकी सहायता कर सका। यदि आपको किसी बच्चे की स्क्रीनिंग, पंजीकरण या रेफरल के बारे में कुछ और पूछना हो, तो अवश्य बताएं।",
                suggestions=["स्क्रीनिंग कैसे शुरू करें?", "रेफरल प्रक्रिया क्या है?", "जोखिम स्तर (Green/Yellow/Red)", "नया विषय पूछें"],
                follow_up_prompt="क्या आप कुछ और जानना चाहते हैं?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="छान! आपल्याला मदत करू शकल्याचा मला आनंद आहे. आपल्याला बालकांची तपासणी, नोंदणी किंवा संदर्भ सेवा (Referral) बद्दल आणखी काही जाणून घ्यायचे असल्यास नक्की विचारा.",
                suggestions=["स्क्रीनिंग कशी सुरू करावी?", "रेफरल प्रक्रिया काय आहे?", "जोखीम पातळी (Green/Yellow/Red)", "नवीन प्रश्न विचारा"],
                follow_up_prompt="आपल्याला आणखी काही माहिती हवी आहे का?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="Great! I'm glad that helped. If you need any more guidance with child screenings, registrations, or referrals, I'm here to assist.",
                suggestions=["How to start screening?", "Referral process", "Risk levels (Green/Yellow/Red)", "Start a new topic"],
                follow_up_prompt="Is there anything else you would like help with?",
                provider="local_grounded",
            )

    negative_keys = [
        "no", "no, i need more help", "no i need more help", "need more help", "more help",
        "नाही", "नाही, आणखी मदत हवी", "नाही आणखी मदत हवी", "आणखी मदत", "मदत हवी", "मदत पाहिजे",
        "नहीं", "नहीं, और मदद चाहिए", "नहीं और मदद चाहिए", "और मदद चाहिए", "मदद चाहिए", "nahi", "nahin"
    ]
    if msg in negative_keys or any(k in msg for k in ["नाही, आणखी मदत हवी", "नहीं, और मदद चाहिए", "no, i need more help", "आणखी मदत", "और मदद"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="मैं आपकी पूरी मदद करने के लिए यहाँ हूँ। कृपया अपना प्रश्न विस्तार से लिखें या नीचे दिए गए विकल्पों में से चुनें:",
                suggestions=["स्क्रीनिंग सहायता", "रेफरल और DEIC", "बोलने या भाषा में देरी", "पर्यवेक्षक से संपर्क"],
                follow_up_prompt="आप किस विषय पर अधिक जानकारी चाहते हैं?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="मी आपल्याला पूर्ण मदत करण्यास येथे आहे. कृपया आपला प्रश्न विस्ताराने लिहा किंवा खालील पर्यायांमधून निवडा:",
                suggestions=["स्क्रीनिंग मदत", "रेफरल व DEIC", "बोलण्यात किंवा भाषेत अडचण", "पर्यवेक्षकांशी संपर्क"],
                follow_up_prompt="आपल्याला कोणत्या विषयावर अधिक माहिती हवी आहे?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="I'm here to help further. You can type your specific question or pick one of these common topics to continue:",
                suggestions=["Screening guidance", "Referral & DEIC process", "Speech or language concern", "Contact supervisor"],
                follow_up_prompt="Which area would you like more help with?",
                provider="local_grounded",
            )

    # -------------------------------------------------------------
    # 2. What is SPARSH? / About SPARSH (Strict professional description)
    # -------------------------------------------------------------
    if any(k in msg for k in ["what is sparsh", "about sparsh", "tell me about sparsh", "स्पर्श क्या है", "स्पर्श म्हणजे काय"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="**स्पर्श (SPARSH - Screening, Prediction, and Referral System for Healthcare)** 0 से 6 वर्ष के बच्चों में विकासात्मक देरी की शीघ्र पहचान और समय पर हस्तक्षेप हेतु एक समर्पित डिजिटल स्क्रीनिंग एवं सहायता प्लेटफॉर्म है।\n\n**मुख्य कार्यप्रणाली:**\n- **बालक पंजीकरण:** बच्चों का डिजिटल पंजीकरण और आयु-आधारित चेकपॉइंट निर्धारण।\n- **5 विकासात्मक क्षेत्र:** स्थूल गामक (Gross Motor), सूक्ष्म गामक (Fine Motor), भाषा एवं संचार, संज्ञानात्मक और सामाजिक-भावनात्मक।\n- **ऑडियो-विजुअल मूल्यांकन:** श्रवण और दृष्टि से संबंधित सरल अवलोकन।\n- **जोखिम स्तर निर्धारण:** Green (सामान्य), Yellow (निगरानी), और Red (उच्च जोखिम)।\n- **DEIC रेफरल:** उच्च जोखिम वाले बच्चों के लिए जिला शीघ्र हस्तक्षेप केंद्र हेतु त्वरित रेफरल।",
                suggestions=["स्क्रीनिंग कैसे शुरू करें?", "जोखिम स्तर समझें", "रेफरल प्रक्रिया क्या है?"],
                follow_up_prompt="क्या आप इनमें से किसी विषय पर अधिक जानना चाहते हैं?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="**स्पर्श (SPARSH - Screening, Prediction, and Referral System for Healthcare)** हे 0 ते 6 वर्षे वयोगटातील बालकांमधील विकासात्मक विलंब वेळेत ओळखण्यासाठी व योग्य सहाय्य मिळवून देण्यासाठी तयार केलेले अधिकृत डिजिटल व्यासपीठ आहे.\n\n**प्रमुख वैशिष्ट्ये व कार्यप्रवाह:**\n- **बालक नोंदणी:** जन्मतारखेनुसार योग्य वयाचा चेकपॉइंट (12, 18, 24, 36, 48, 60 महिने) निश्चित करणे.\n- **5 विकासात्मक क्षेत्रे:** स्थूल कारक (Gross Motor), सूक्ष्म कारक (Fine Motor), भाषा व संवाद, बौद्धिक आणि सामाजिक-भावनिक.\n- **श्राव्य-दृष्टी मूल्यांकन (Audio-Visual):** ऐकणे आणि पाहणे याविषयी प्रत्यक्ष निरीक्षण.\n- **जोखीम स्तर:** Green (योग्य विकास), Yellow (लक्ष ठेवा), Red (उच्च जोखीम/रेड फ्लॅग).\n- **DEIC संदर्भ सेवा:** आवश्यकतेनुसार जिल्हा शीघ्र हस्तक्षेप केंद्राकडे (DEIC) थेट रेफरल.",
                suggestions=["स्क्रीनिंग कशी सुरू करावी?", "जोखीम स्तर समजून घ्या", "रेफरल प्रक्रिया काय आहे?"],
                follow_up_prompt="आपल्याला यातील कोणत्या प्रक्रियेबद्दल जाणून घ्यायचे आहे?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="**SPARSH (Screening, Prediction, and Referral System for Healthcare)** is a dedicated child-development screening and support platform designed for frontline health workers and authorized clinical staff to identify developmental delays in children aged 0-6 years.\n\n**Core Capabilities:**\n- **Child Registration:** Enrolling children with birth dates to determine age-specific milestone checkpoints.\n- **5 RBSK Domains:** Gross Motor, Fine Motor, Language & Communication, Cognitive, and Social & Emotional.\n- **Audio-Visual Assessment:** Standardized observations for hearing responsiveness and visual tracking.\n- **Automated Risk Stratification:** Green (On Track), Yellow (Monitor / Moderate Delay), and Red (At Risk / Red Flag).\n- **DEIC Referral Pathway:** Generating formal referral slips to District Early Intervention Centres for clinical evaluation.",
                suggestions=["How to start screening?", "Understand Risk Levels", "Referral Process"],
                follow_up_prompt="Which area would you like to explore?",
                provider="local_grounded",
            )

    # -------------------------------------------------------------
    # 3. Referral & DEIC Guidance (Intent Priority 2)
    # -------------------------------------------------------------
    if any(k in msg for k in ["referral", "refer", "deic", "रेफरल", "संदर्भ"]):
        # 3a. When to refer / Clinical red flags & criteria
        if any(k in msg for k in ["when", "criteria", "flag", "sign", "need", "require", "कब", "केव्हा", "कधी", "निकष", "चिन्ह", "गरज", "आवश्यक"]):
            if lang == "hi":
                return ChatAssistantResponse(
                    reply="**रेफरल के मुख्य नैदानिक संकेत (Red Flags - DEIC Referral):**\n\n- **12 महीने:** कोई बड़बड़ाहट (babbling) या हाव-भाव न करना।\n- **18 महीने:** एक भी सार्थक शब्द न बोलना, स्वतंत्र रूप से न चल पाना।\n- **24 महीने:** 2 शब्दों के छोटे वाक्य न बोलना, निर्देशों को न समझना।\n- **किसी भी उम्र में:** पहले सीखे हुए शब्दों या कौशलों का अचानक खो जाना।\n- **श्रवण/दृष्टि:** नाम पुकारने पर बिल्कुल ध्यान न देना या आँखों का संपर्क न बनाना।\n\n**स्पर्श कार्यप्रणाली:** अलर्ट्स या रेफरल टैब से जिला प्रारंभिक हस्तक्षेप केंद्र (DEIC) हेतु रेफरल पर्ची तैयार करें। याद रखें, स्क्रीनिंग कोई अंतिम निदान नहीं है।",
                    suggestions=["रेफरल कैसे बनाएं?", "माता-पिता को क्या सलाह दें?", "हाँ, धन्यवाद"],
                    follow_up_prompt="क्या आप रेफरल बनाने का तरीका जानना चाहते हैं?",
                    provider="local_grounded",
                )
            elif lang == "mr":
                return ChatAssistantResponse(
                    reply="**रेफरलचे महत्त्वाचे निकष (Red Flags - DEIC Referral):**\n\n- **12 महिने:** आवाजाचे अनुकरण किंवा इशारे न करणे, आवाजाकडे लक्ष न देणे.\n- **18 महिने:** एकही अर्थपूर्ण शब्द न बोलणे, आधाराशिवाय न चालणे.\n- **24 महिने:** 2 शब्दांची लहान वाक्ये न बोलणे किंवा साध्या सूचना न समजणे.\n- **कोणत्याही वयात:** आधी शिकलेले शब्द किंवा कौशल्ये अचानक बंद होणे.\n- **श्राव्य/दृष्टी:** नाव हाक मारल्यावर अजिबात प्रतिसाद न देणे किंवा डोळ्यांत संपर्क न ठेवणे.\n\n**स्पर्श मधील कृती:** Alerts किंवा Referral मेनूमध्ये जाऊन जिल्हा शीघ्र हस्तक्षेप केंद्र (DEIC) कडे त्वरित रेफरल नोंदवा. स्क्रीनिंग हे अंतिम निदान नाही.",
                    suggestions=["रेफरल कसे तयार करावे?", "पालकांना काय सल्ला द्यावा?", "होय, धन्यवाद"],
                    follow_up_prompt="आपल्याला रेफरल तयार करण्याबद्दल अधिक जाणून घ्यायचे आहे का?",
                    provider="local_grounded",
                )
            else:
                return ChatAssistantResponse(
                    reply="**Key Referral Criteria (Red Flags - DEIC Referral):**\n\n- **By 12 months:** No babbling, communicative gestures, or response to sounds.\n- **By 18 months:** No meaningful single words; inability to walk independently.\n- **By 24 months:** No spontaneous 2-word combinations; inability to follow simple commands.\n- **Any age:** Any regression or loss of previously acquired speech, motor, or social skills.\n- **Sensory:** Persistent lack of response to spoken name, lack of eye contact, or visual tracking difficulty.\n\n**Action in SPARSH:** Open the Alerts or Referrals tab to generate a referral slip to the District Early Intervention Centre (DEIC). Remember that screening identifies areas needing evaluation, not clinical diagnoses.",
                    suggestions=["How to create a referral", "What should I advise parents?", "Yes, thanks"],
                    follow_up_prompt="Would you like guidance on creating the referral slip?",
                    provider="local_grounded",
                )
        # 3b. How to refer / Referral process
        else:
            if lang == "hi":
                return ChatAssistantResponse(
                    reply="**स्पर्श (SPARSH) में रेफरल प्रक्रिया:**\n\n1. **अलर्ट्स या रेफरल स्क्रीन:** नेविगेशन में **Referrals** या **Alerts** पर जाएं।\n2. **बच्चा चुनें:** जिस बच्चे का स्तर Red आया है या जिसमें रेड फ्लैग चिन्हित हुआ है, उसे चुनें।\n3. **रेफरल कारण दर्ज करें:** छूटे हुए मील के पत्थर और ऑडियो-विजुअल अवलोकन स्वतः शामिल होते हैं।\n4. **DEIC चयन:** निकटतम जिला प्रारंभिक हस्तक्षेप केंद्र (DEIC) या PHC का चयन करें।\n5. **रेफरल पर्ची जारी करें:** पर्ची जनरेट करें और अभिभावक को DEIC में बाल रोग विशेषज्ञ से मिलने की सलाह दें।",
                    suggestions=["रेफरल कब आवश्यक है?", "माता-पिता को क्या सलाह दें?", "हाँ, धन्यवाद"],
                    follow_up_prompt="क्या इससे आपको रेफरल प्रक्रिया समझ आई?",
                    provider="local_grounded",
                )
            elif lang == "mr":
                return ChatAssistantResponse(
                    reply="**स्पर्श (SPARSH) मध्ये रेफरल प्रक्रिया:**\n\n1. **रेफरल स्क्रीनवर जा:** मुख्य मेनू किंवा तळातील **Referrals** किंवा **Alerts** निवडा.\n2. **बालक निवडा:** ज्या बालकाचा निकाल Red आला आहे किंवा रेड फ्लॅग आढळला आहे, ते बालक निवडा.\n3. **कारणांची नोंद:** राहिलेले विकासात्मक टप्पे व A/V निरीक्षणे आपोआप जोडली जातात.\n4. **DEIC केंद्र निवडा:** जवळचे जिल्हा शीघ्र हस्तक्षेप केंद्र (DEIC) किंवा PHC निवडा.\n5. **रेफरल पावती द्या:** रेफरल नोंदवून पालकांना DEIC मधील तज्ज्ञ डॉक्टरांकडे जाण्याचा सल्ला द्या.",
                    suggestions=["रेफरल केव्हा आवश्यक आहे?", "पालकांना काय सल्ला द्यावा?", "होय, धन्यवाद"],
                    follow_up_prompt="आपल्याला रेफरल प्रक्रियेबद्दल अधिक माहिती हवी आहे का?",
                    provider="local_grounded",
                )
            else:
                return ChatAssistantResponse(
                    reply="**Referral Process in SPARSH:**\n\n1. **Navigate:** Open the **Referrals** or **Alerts** section from the navigation menu.\n2. **Select Child:** Choose the child identified with a Red tier or specific critical red flag.\n3. **Review Findings:** Missed milestone checkpoints and audio-visual notes are automatically compiled.\n4. **Select Facility:** Designate the appropriate District Early Intervention Centre (DEIC) or primary health center.\n5. **Issue Referral:** Generate the referral slip and counsel the caregiver to attend the DEIC for specialized assessment.",
                    suggestions=["When is referral required?", "What should I advise parents?", "Yes, thanks"],
                    follow_up_prompt="Did this explain the referral workflow?",
                    provider="local_grounded",
                )

    # -------------------------------------------------------------
    # 4. Parent Guidance & Stimulation Advice (Intent Priority 3)
    # -------------------------------------------------------------
    if any(k in msg for k in ["advise", "advice", "parents", "parent", "home stimulation", "screen time", "सल्ला", "पालक", "माता-पिता", "पालकांना", "मार्गदर्शन", "पुढे काय"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="**माता-पिता के लिए विकासात्मक मार्गदर्शन (भाषा व संचार):**\n\n1. **नियमित बातचीत:** बच्चे से दैनिक कार्यों के दौरान लगातार बात करें और वस्तुओं, रंगों और क्रियाओं के नाम स्पष्ट रूप से बताएं।\n2. **सचित्र पुस्तकें व कहानियाँ:** रंगीन चित्रों वाली किताबें दिखाएं और सरल कहानियाँ सुनाएं।\n3. **स्क्रीन समय पूरी तरह सीमित करें:** 2 वर्ष से कम उम्र के बच्चों के लिए मोबाइल/टीवी स्क्रीन से बचें; स्क्रीन का अत्यधिक उपयोग भाषा विकास को धीमा कर सकता है।\n4. **बालगीत और तुकांत कविताएँ:** बच्चे के साथ सरल कविताएँ और गीत गाएं जिससे ध्वनियों का अनुकरण बढ़े।\n5. **धैर्यपूर्वक सुनें:** बच्चे को अपनी बात पूरी करने का समय दें, बीच में न टोकें।",
                suggestions=["स्पर्श में स्क्रीनिंग कैसे करें?", "रेफरल कब आवश्यक है?", "हाँ, धन्यवाद"],
                follow_up_prompt="क्या इससे आपको आवश्यक जानकारी मिली?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="**पालकांसाठी विकासात्मक सल्ला (भाषा व संवाद):**\n\n1. **नियमित संवाद:** बालकाशी दररोज बोलताना घरातील वस्तू, प्राणी, रंग व क्रियांना स्पष्ट नावाने संबोधून बोला.\n2. **चित्रांची पुस्तके व गोष्टी:** रंगीबेरंगी चित्रांची पुस्तके दाखवून लहान गोष्टी सांगा व चित्रांवर बोट ठेवून बोला.\n3. **मोबाईल/टीव्ही स्क्रीन पूर्णपणे टाळा:** 2 वर्षांखालील बालकांसाठी स्क्रीनचा वापर टाळावा; स्क्रीनमुळे भाषा व संवादात मोठा अडथळा येतो.\n4. **बालगीते व गाणी:** बालकासोबत साधी गाणी व कविता म्हणा, ज्यामुळे आवाजांचे अनुकरण वाढते.\n5. **बोलण्यास पूर्ण वेळ द्या:** बालकाला त्याचे म्हणणे मांडण्यासाठी पुरेसा वेळ द्या, मध्येच घाई करू नका.",
                suggestions=["स्पर्श मध्ये तपासणी कशी करावी?", "रेफरल केव्हा आवश्यक आहे?", "होय, धन्यवाद"],
                follow_up_prompt="या माहितीने आपल्याला मदत झाली का?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="**Developmental Guidance for Parents (Language & Speech):**\n\n1. **Interactive Talk:** Talk continuously during daily routines, naming objects, colors, and actions clearly.\n2. **Picture Books & Storytelling:** Point to colorful illustrations in simple books and describe what is happening.\n3. **Eliminate Screen Time:** Avoid smartphone/TV screens for children under 2 years; passive screen exposure is strongly correlated with language delays.\n4. **Sing Rhymes:** Sing simple nursery rhymes that encourage vocal repetition and sound imitation.\n5. **Patient Listening:** Give the child plenty of time to formulate sounds and words without interrupting or anticipating their words.",
                suggestions=["How does SPARSH screen this?", "When to create a referral?", "Yes, thanks"],
                follow_up_prompt="Did this advice help answer your question?",
                provider="local_grounded",
            )

    # -------------------------------------------------------------
    # 5. Specific Detailed Milestone Observations (Intent Priority 4)
    # -------------------------------------------------------------
    # 5a. Few words / doesn't speak words
    speech_detail_keywords = [
        "doesn't use words", "does not use words", "uses very few words", "few words",
        "difficulty understanding", "hard to understand", "not talking", "not speaking",
        "शब्द नहीं", "बहुत कम शब्द", "बिल्कुल नहीं बोलता", "कम शब्द बोलता", "शब्द नहीं बोलता",
        "शब्द वापरत नाही", "खूप कमी शब्द", "अजिबात बोलत नाही", "कमी शब्द", "फार कमी शब्द",
        "शब्द बोलतो", "बोलत नाही"
    ]
    if any(k in msg for k in speech_detail_keywords):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="यह अवलोकन बच्चे के **भाषा और संचार विकास (Language & Communication)** क्षेत्र से संबंधित हो सकता है।\n\n- **12 से 18 महीने:** बच्चे आमतौर पर 2-3 सरल एकल शब्द (जैसे 'माँ', 'पापा', 'पानी') बोलना शुरू करते हैं।\n- **24 महीने:** वे 2 शब्दों वाले छोटे संयोजन (जैसे 'दूध दो', 'जाना है') बोलने लगते हैं।\n\n**स्पर्श (SPARSH) में क्या करें:**\n1. बच्चे की आयु के अनुसार भाषा स्क्रीनिंग चेकपॉइंट पूर्ण करें।\n2. माता-पिता को स्क्रीन समय बंद करने और दैनिक बातचीत बढ़ाने के लिए कहें।\n3. महत्वपूर्ण देरी होने पर DEIC में बाल रोग विशेषज्ञ या स्पीच थेरेपिस्ट से परामर्श हेतु रेफरल करें। ध्यान रखें, स्क्रीनिंग कोई अंतिम रोगनिदान नहीं है।",
                suggestions=["माता-पिता को क्या सलाह दें?", "स्पर्श में स्क्रीनिंग कैसे करें?", "रेफरल कब आवश्यक है?"],
                follow_up_prompt="क्या इससे आपके प्रश्न का उत्तर मिला?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="हे निरीक्षण बालकाच्या **भाषा आणि संवाद विकास (Language & Communication)** क्षेत्राशी संबंधित असू शकते.\n\n- **12 ते 18 महिने:** बालक सामान्यतः 2-3 सोपे सुटे शब्द (उदा. 'आई', 'बाबा', 'पाणी') बोलण्यास सुरुवात करते.\n- **24 महिने:** ते 2 शब्दांची लहान वाक्ये (उदा. 'दूध दे', 'बाहेर जायचं') बोलू लागते.\n\n**स्पर्श (SPARSH) मधील पुढील पावले:**\n1. बालकाच्या वयानुसार भाषा तपासणी (Screening) पूर्ण करा.\n2. पालकांना मोबाईल स्क्रीन बंद करून घरात संवाद व गोष्टी सांगण्यास सांगा.\n3. लक्षणीय विलंब आढळल्यास DEIC कडे संदर्भाची शिफारस करा. ही तपासणी अंतिम रोगनिदान नाही.",
                suggestions=["पालकांना काय सल्ला द्यावा?", "स्पर्श मध्ये तपासणी कशी करावी?", "रेफरल केव्हा आवश्यक आहे?"],
                follow_up_prompt="या माहितीने आपल्या प्रश्नाचे निरसन झाले का?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="This observation relates to the child's **Language & Communication** developmental domain.\n\n- **By 12-18 months:** Children typically begin using 2-3 recognizable single words (e.g., 'mama', 'water').\n- **By 24 months:** Children commonly combine 2 words spontaneously (e.g., 'more milk', 'go car').\n\n**What to do in SPARSH:**\n1. Complete the age-appropriate milestone screening checklist for the child.\n2. Advise parents to eliminate screen media and engage in daily interactive talking and reading.\n3. Persistent speech delays warrant an evaluation by a pediatrician or speech therapist at a DEIC. Remember, screening is an early identification tool, not a clinical diagnosis.",
                suggestions=["What should I advise parents?", "How does SPARSH screen this?", "When to create a referral?"],
                follow_up_prompt="Did this answer your question?",
                provider="local_grounded",
            )

    # 5b. Stuttering / Speech disfluency
    if any(k in msg for k in ["stutter", "stammer", "हकलाना", "अडखळणे"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="बोलने में हकलाना या शब्दों को दोहराना 2 से 5 वर्ष के बच्चों में भाषा सीखने के दौरान देखा जा सकता है:\n\n- इसे अक्सर 'विकासात्मक प्रवाहहीनता' (Developmental Disfluency) कहा जाता है।\n- बच्चे पर जल्दी बोलने का दबाव न डालें और न ही उनकी बात बीच में टोकें।\n- यदि यह स्थिति 6 महीने से अधिक बनी रहे या तनाव दिखे, तो DEIC में स्पीच थेरेपिस्ट से मूल्यांकन कराना उचित रहता है।",
                suggestions=["माता-पिता को क्या सलाह दें?", "स्पर्श में स्क्रीनिंग कैसे करें?", "हाँ, धन्यवाद"],
                follow_up_prompt="क्या इससे आपके प्रश्न का उत्तर मिला?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="बोलताना अडखळणे किंवा शब्द पुन्हा पुन्हा उच्चारणे हे 2 ते 5 वर्षे वयाच्या बालकांमध्ये भाषा शिकताना दिसू शकते:\n\n- याला 'विकासात्मक अडखळणे' (Developmental Disfluency) मानले जाते.\n- बालकावर वेगाने बोलण्याचा ताण आणू नका आणि मध्येच दुरुस्त करू नका.\n- जर ही अडचण 6 महिन्यांपेक्षा जास्त काळ टिकून राहिली, तर DEIC मधील स्पीच थेरपिस्टचा सल्ला घेणे योग्य ठरेल.",
                suggestions=["पालकांना काय सल्ला द्यावा?", "स्पर्श मध्ये तपासणी कशी करावी?", "होय, धन्यवाद"],
                follow_up_prompt="या माहितीने आपल्या प्रश्नाचे निरसन झाले का?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="Repeating sounds or hesitation when speaking is common between ages 2 and 5 as vocabulary rapidly expands:\n\n- Often recognized as developmental disfluency, many children outgrow this with patient support.\n- Avoid drawing negative attention or telling the child to 'slow down'.\n- If stuttering persists beyond 6 months, a speech-language pathologist evaluation at a DEIC is recommended.",
                suggestions=["What should I advise parents?", "How does SPARSH screen this?", "Yes, thanks"],
                follow_up_prompt="Did this answer your question?",
                provider="local_grounded",
            )

    # 5c. Name response, social interaction, eye contact
    if any(k in msg for k in ["name", "eye contact", "respond", "social", "ध्यान", "आँख", "नाव", "प्रतिसाद", "एकटेपणा", "हाक"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="नाम पुकारने पर न देखना या आँखों का संपर्क (Eye Contact) न बनाना **सामाजिक-भावनात्मक (Social & Emotional)** और **श्रवण/दृश्य अवलोकन (Audio-Visual)** क्षेत्र से जुड़ा हो सकता है।\n\n**महत्वपूर्ण बातें:**\n1. **सुनने की जाँच:** पहले सुनिश्चित करें कि बच्चा आवाजों पर ध्यान देता है या नहीं (Audio-Visual Assessment करें)।\n2. **नैदानिक सुरक्षा:** यह किसी विकार (जैसे ऑटिज्म) का पक्का प्रमाण नहीं है। बिना विशेषज्ञ के किसी विकार का नाम न लें।\n3. **मार्गदर्शन:** स्पर्श के ऑडियो-विजुअल मॉड्यूल में अवलोकन दर्ज करें और यदि चिंता बनी रहे, तो प्राथमिक स्वास्थ्य केंद्र (PHC) या DEIC में विशेषज्ञ परामर्श हेतु रेफरल बनाएं।",
                suggestions=["ऑडियो-विजुअल जाँच कैसे करें?", "रेफरल कैसे बनाएं?", "स्पर्श स्क्रीनिंग प्रक्रिया"],
                follow_up_prompt="क्या इससे आपके प्रश्न का उत्तर मिला?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="नाव हाक मारल्यावर न पाहणे किंवा डोळ्यांत संपर्क (Eye Contact) न ठेवणे हे **सामाजिक व भावनिक विकास (Social & Emotional)** तसेच **श्राव्य-दृष्टी मूल्यांकन (Audio-Visual)** याच्याशी संबंधित असू शकते.\n\n**महत्त्वाच्या बाबी:**\n1. **श्रवण तपासणी:** प्रथम बालक आवाजाला प्रतिसाद देतो का हे तपासा (A/V Assessment करा).\n2. **सुरक्षितता:** हे कोणत्याही आजाराचे अंतिम निदान नाही. बालकाला थेट कोणतेही लेबल लावू नये.\n3. **मार्गदर्शन:** स्पर्श मधील A/V मॉड्यूल पूर्ण करा व अडचण कायम राहिल्यास तज्ज्ञांच्या तपासणीसाठी DEIC कडे रेफरल करा.",
                suggestions=["ऑडिओ-व्हिज्युअल तपासणी कशी करावी?", "रेफरल कसे तयार करावे?", "स्क्रीनिंग प्रक्रिया"],
                follow_up_prompt="या माहितीने आपल्या प्रश्नाचे निरसन झाले का?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="Not responding to their name or avoiding eye contact relates to the **Social & Emotional** developmental domain as well as **Hearing / Audio-Visual** response.\n\n**Key Guidance:**\n1. **Hearing Check:** First verify if the child responds to clapping, music, or other sounds using the SPARSH Audio-Visual assessment.\n2. **Clinical Safety:** Observations like this are screening indicators, NOT a medical diagnosis (such as autism). Never provide a diagnostic label.\n3. **Action in SPARSH:** Complete the A/V screening and milestone questions. If concerns persist across multiple checkpoints, generate a referral to the District Early Intervention Centre (DEIC).",
                suggestions=["How to do A/V assessment?", "How to create a referral?", "Start screening"],
                follow_up_prompt="Did this answer your question?",
                provider="local_grounded",
            )

    # 5d. Motor development (walking, crawling, grasping)
    if any(k in msg for k in ["walk", "sit", "crawl", "motor", "grasp", "चलना", "बैठना", "मोटर", "चालणे", "बसणे", "हालचाल", "धावणे"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="चलना, बैठना और संतुलन **स्थूल गामक (Gross Motor)** विकास के अंतर्गत आते हैं:\n\n- सामान्यतः 9-10 महीने में बिना सहारे बैठना और 12-15 महीने में स्वतंत्र चलना शुरू होता है।\n- यदि बच्चा 18 महीने तक बिना सहारे चलने में असमर्थ है, तो यह एक महत्वपूर्ण अवलोकन है।\n\n**स्पर्श कार्यप्रणाली:**\n- बच्चे की आयु अनुसार ग्रॉस मोटर चेकलिस्ट भरें।\n- यदि रेड फ्लैग दिखाई दे, तो तुरंत DEIC बाल रोग विशेषज्ञ के पास रेफरल करें।",
                suggestions=["ग्रॉस मोटर चेकपॉइंट्स", "रेफरल कैसे दर्ज करें?", "स्क्रीनिंग सहायता"],
                follow_up_prompt="क्या इससे आपके प्रश्न का उत्तर मिला?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="चालणे, बसणे व तोल सांभाळणे हे **स्थूल कारक (Gross Motor)** विकासात येते:\n\n- साधारणपणे 9-10 महिन्यांत आधाराशिवाय बसणे व 12-15 महिन्यांत चालणे सुरू होते.\n- बालक 18 महिन्यांचे होऊनही चालत नसल्यास हे काळजीपूर्वक तपासले पाहिजे.\n\n**स्पर्श मधील पुढील पावले:**\n- बालकाच्या वयानुसार ग्रॉस मोटर प्रश्नांची उत्तरे नोंदवा.\n- गंभीर विलंब आढळल्यास DEIC च्या डॉक्टरांकडे त्वरित रेफरल करा.",
                suggestions=["ग्रॉस मोटर माइलस्टोन्स", "रेफरल कसे नोंदवावे?", "स्क्रीनिंग मदत"],
                follow_up_prompt="या माहितीने आपल्या प्रश्नाचे निरसन झाले का?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="Walking, sitting, and physical balance fall under the **Gross Motor** developmental domain:\n\n- Most children sit independently by 9 months and walk independently between 12-15 months.\n- If a child is not walking independently by 18 months, this is considered a significant milestone to monitor.\n\n**SPARSH Workflow:**\n- Conduct the age-matched Gross Motor screening in SPARSH.\n- If a red flag is present, initiate a referral to DEIC/pediatrician for motor assessment and physical therapy support.",
                suggestions=["Gross Motor checkpoints", "How to create a referral?", "Screening help"],
                follow_up_prompt="Did this answer your question?",
                provider="local_grounded",
            )

    # 5e. Audio-Visual Assessment (Hearing & Vision)
    if any(k in msg for k in ["audio", "visual", "hearing", "vision", "sound", "ऐकणे", "दिसणे", "दृष्टी", "श्रवण"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="**ऑडियो-विजुअल (Audio-Visual) मूल्यांकन:**\n\n- **श्रवण अवलोकन:** ताली बजाने या आवाज करने पर क्या बच्चा चौंकता है या सिर घुमाता है?\n- **दृष्टि अवलोकन:** क्या बच्चा चमकीली वस्तु या चेहरे को दोनों तरफ अपनी आँखों से ट्रैक करता है?\n- श्रवण या दृष्टि में कोई भी कठिनाई सीधे भाषा और सामाजिक विकास को प्रभावित कर सकती है।",
                suggestions=["स्क्रीनिंग कैसे शुरू करें?", "रेफरल प्रक्रिया क्या है?", "जोखिम स्तर समझें"],
                follow_up_prompt="क्या आप ऑडियो-विजुअल जाँच दर्ज करना चाहते हैं?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="**श्राव्य-दृष्टी (Audio-Visual) मूल्यांकन:**\n\n- **श्रवण निरीक्षण:** टाळी वाजवल्यावर किंवा आवाज केल्यावर बालक आवाजाच्या दिशेने मान वळवतो का?\n- **दृष्टी निरीक्षण:** बालक एखादी वस्तू किंवा चेहरा डोळ्यांनी डावीकडून उजवीकडे ट्रॅक करतो का?\n- ऐकण्यात किंवा पाहण्यात अडचण असल्यास त्याचा थेट परिणाम भाषा आणि सामाजिक संवादावर होतो.",
                suggestions=["स्क्रीनिंग कशी सुरू करावी?", "रेफरल प्रक्रिया काय आहे?", "जोखीम स्तर समजून घ्या"],
                follow_up_prompt="आपल्याला श्राव्य-दृष्टी तपासणीबद्दल अधिक माहिती हवी आहे का?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="**Audio-Visual Assessment in SPARSH:**\n\n- **Hearing Check:** Does the child startle or turn their head towards clapping, calling, or environmental sounds?\n- **Vision Tracking:** Does the child track moving objects or make sustained eye contact with familiar faces?\n- Sensory hearing and vision observations are vital, as undetected sensory deficits directly impact language and social development.",
                suggestions=["How to start screening?", "Referral process", "Understand Risk Levels"],
                follow_up_prompt="Would you like guidance on recording A/V observations?",
                provider="local_grounded",
            )

    # -------------------------------------------------------------
    # 6. Broad Developmental Questions (Intent Priority 5)
    # -------------------------------------------------------------
    # 6a. General speech concern (Initial question, broad)
    if any(k in msg for k in ["speak", "speech", "talk", "word", "language", "बोल", "भाषा", "शब्द"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="मैं बच्चे के बोलने या भाषा के विकास को समझने में आपकी मदद कर सकता हूँ। यह अवलोकन **भाषा और संचार विकास (Language & Communication)** क्षेत्र से संबंधित है।\n\nआप बच्चे में मुख्य रूप से क्या देख रहे हैं?",
                suggestions=["शब्द बिल्कुल नहीं बोलता", "बहुत कम शब्द बोलता है", "नाम पुकारने पर ध्यान नहीं देता", "बोलने में हकलाना"],
                follow_up_prompt="कृपया इनमें से एक विकल्प चुनें या अपनी बात लिखें।",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="मी बालकाच्या बोलण्याच्या किंवा भाषेच्या विकासाबाबत माहिती देण्यास मदत करू शकतो. हे निरीक्षण बालकाच्या **भाषा आणि संवाद विकास (Language & Communication)** क्षेत्राशी संबंधित आहे.\n\nआपल्याला प्रामुख्याने काय जाणवत आहे?",
                suggestions=["शब्द अजिबात बोलत नाही", "खूप कमी शब्द बोलतो", "नाव हाक मारल्यावर प्रतिसाद देत नाही", "बोलताना अडखळणे"],
                follow_up_prompt="कृपया यातील एक पर्याय निवडा किंवा आपला प्रश्न लिहा.",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="I can help you understand speech and language milestones. This observation relates to the **Language & Communication** developmental domain.\n\nWhat specific observation are you noticing in the child?",
                suggestions=["Doesn't use words", "Uses very few words", "Doesn't respond to name", "Difficulty understanding speech"],
                follow_up_prompt="Please select an option or describe what you notice.",
                provider="local_grounded",
            )

    # 6b. Developmental domains overview
    if any(k in msg for k in ["domain", "domains", "milestone", "milestones", "क्षेत्र", "टप्पे", "मील के पत्थर"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="**स्पर्श के 5 मुख्य विकासात्मक क्षेत्र (RBSK Domains):**\n\n1. **स्थूल गामक (Gross Motor):** बैठना, चलना, संतुलन।\n2. **सूक्ष्म गामक (Fine Motor):** हाथों और उंगलियों का उपयोग, पकड़ना।\n3. **भाषा एवं संचार (Language & Communication):** आवाज निकालना, शब्द बोलना, समझना।\n4. **संज्ञानात्मक (Cognitive):** समस्या सुलझाना, वस्तुओं को पहचानना, जिज्ञासा।\n5. **सामाजिक-भावनात्मक (Social & Emotional):** चेहरे के भाव, मुस्कान, साथियों के साथ खेलना।",
                suggestions=["स्क्रीनिंग कैसे शुरू करें?", "ऑडियो-विजुअल जाँच", "जोखिम स्तर समझें"],
                follow_up_prompt="आप किस डोमेन के बारे में अधिक जानना चाहते हैं?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="**स्पर्श मधील 5 प्रमुख विकासात्मक क्षेत्रे (RBSK Domains):**\n\n1. **स्थूल कारक (Gross Motor):** बसणे, चालणे, उभे राहणे, तोल सांभाळणे.\n2. **सूक्ष्म कारक (Fine Motor):** वस्तू पकडणे, बोटांचा वापर, रेखाटन.\n3. **भाषा व संवाद (Language & Communication):** आवाज काढणे, शब्द बोलणे, सूचना समजणे.\n4. **बौद्धिक विकास (Cognitive):** जिज्ञासा, वस्तूंची ओळख, समस्या सोडवणे.\n5. **सामाजिक व भावनिक (Social & Emotional):** हसणे, डोळ्यांत पाहणे, इतरांसोबत खेळणे.",
                suggestions=["स्क्रीनिंग कशी सुरू करावी?", "ऑडिओ-व्हिज्युअल चाचणी", "जोखीम स्तर समजून घ्या"],
                follow_up_prompt="आपल्याला यातील कोणत्या क्षेत्राबद्दल अधिक माहिती हवी आहे?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="**SPARSH evaluates 5 Core RBSK Developmental Domains:**\n\n1. **Gross Motor:** Sitting, walking, running, and physical balance.\n2. **Fine Motor:** Finger grasping, holding objects, and hand-eye coordination.\n3. **Language & Communication:** Vocalizing, single words, phrases, and understanding speech.\n4. **Cognitive:** Curiosity, problem-solving, and object identification.\n5. **Social & Emotional:** Eye contact, smiling, response to name, and interactive play.",
                suggestions=["How to start screening", "Audio-Visual Assessment", "Understand Risk Levels"],
                follow_up_prompt="Which developmental domain would you like to explore?",
                provider="local_grounded",
            )

    # -------------------------------------------------------------
    # 7. SPARSH Platform Workflows & Screens (Intent Priority 6)
    # -------------------------------------------------------------
    # 7a. Screening workflow
    if any(k in msg for k in ["start screening", "how to screen", "screening", "स्क्रीनिंग", "तपासणी"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="**स्पर्श (SPARSH) में स्क्रीनिंग कैसे करें:**\n\n1. **बच्चा चुनें:** होम या 'बच्चे' टैब से उस बच्चे को चुनें जिसकी जाँच करनी है।\n2. **चेकपॉइंट:** बच्चे की जन्मतिथि के अनुसार स्वचालित रूप से चेकपॉइंट (12, 18, 24, 36, 48, 60 माह) तय होता है।\n3. **प्रश्नों के उत्तर:** 5 डोमेन के प्रश्नों पर 'हाँ', 'नहीं' या 'अस्पष्ट' अंकित करें।\n4. **ऑडियो-विजुअल अवलोकन:** श्रवण और दृष्टि प्रतिक्रिया दर्ज करें।\n5. **परिणाम:** तुरंत Green, Yellow, या Red स्थिति प्रदर्शित होती है।",
                suggestions=["जोखिम स्तर (Green/Yellow/Red)", "ऑडियो-विजुअल जाँच", "रेफरल प्रक्रिया"],
                follow_up_prompt="क्या आप इनमें से किसी चरण के बारे में अधिक जानना चाहते हैं?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="**स्पर्श (SPARSH) मध्ये तपासणी कशी करावी:**\n\n1. **बालक निवडा:** मुख्यपृष्ठ किंवा 'बालके' यादीतून तपासणी करावयाचे बालक निवडा.\n2. **वयाचा टप्पा:** जन्मतारीखेनुसार योग्य चेकपॉइंट (12, 18, 24, 36, 48, 60 महिने) आपोआप निवडला जातो.\n3. **प्रश्नावली:** 5 क्षेत्रांतील प्रश्नांना 'होय', 'नाही' किंवा 'नक्की नाही' असे उत्तर नोंदवा.\n4. **श्राव्य-दृष्टी निरीक्षण:** ऐकणे व पाहणे यासंबंधी निरीक्षण नोंदवा.\n5. **निकालाचे विश्लेषण:** लगेच Green, Yellow, किंवा Red जोखीम स्तर दिसून येतो.",
                suggestions=["जोखीम स्तर समजून घ्या", "ऑडिओ-व्हिज्युअल चाचणी", "रेफरल प्रक्रिया"],
                follow_up_prompt="आपल्याला यातील कोणत्या टप्प्याबद्दल अधिक माहिती हवी आहे?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="**How to conduct a screening in SPARSH:**\n\n1. **Select Child:** Navigate to the Children screen or Home and select the child.\n2. **Age Checkpoint:** SPARSH automatically selects the milestone checkpoint (12m, 18m, 24m, 36m, 48m, 60m) based on date of birth.\n3. **Answer Milestones:** Answer Yes / No / Unsure across the 5 RBSK developmental domains.\n4. **Audio-Visual Assessment:** Record hearing and visual tracking observations.\n5. **Review Results:** Review the automated risk tier (Green, Yellow, or Red) and recommendations.",
                suggestions=["Understand Results (Green/Yellow/Red)", "Audio-Visual Assessment", "How to create a Referral"],
                follow_up_prompt="Which step would you like more information on?",
                provider="local_grounded",
            )

    # 7b. Risk levels / results
    if any(k in msg for k in ["result", "risk", "red", "yellow", "green", "नतीजा", "जोखिम", "लाल", "पीला", "निकाल", "धोका"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="**स्पर्श (SPARSH) परिणाम स्तर:**\n\n- 🟢 **Green (सामान्य / On Track):** विकास सही दिशा में है। अगले चेकपॉइंट पर सामान्य जाँच करें।\n- 🟡 **Yellow (निगरानी / Moderate Delay):** कुछ मील के पत्थर छूटे हैं। आंगनवाड़ी में प्रोत्साहन गतिविधियाँ कराएं और 1-3 महीने में पुनः स्क्रीनिंग करें।\n- 🔴 **Red (उच्च जोखिम / At Risk):** गंभीर देरी या रेड फ्लैग चिन्हित हुआ है। बच्चे को तुरंत DEIC / चिकित्सा अधिकारी के पास रेफरल करें।",
                suggestions=["रेफरल कैसे बनाएं?", "स्क्रीनिंग कैसे शुरू करें?", "ऑडियो-विजुअल अवलोकन"],
                follow_up_prompt="क्या इससे आपके प्रश्न का उत्तर मिला?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="**स्पर्श (SPARSH) जोखीम स्तर:**\n\n- 🟢 **Green (सामान्य / On Track):** विकास योग्य मार्गावर आहे. पुढील वयाच्या टप्प्यावर नियमित तपासणी करा.\n- 🟡 **Yellow (लक्ष ठेवा / Moderate Delay):** काही टप्पे मागे राहिले आहेत. अंगणवाडीत विकासपूरक खेळ घ्या व 1-3 महिन्यांत पुन्हा तपासणी करा.\n- 🔴 **Red (उच्च जोखीम / At Risk):** गंभीर विलंब किंवा रेड फ्लॅग आढळला आहे. त्वरित DEIC किंवा वैद्यकीय अधिकाऱ्यांकडे रेफरल करा.",
                suggestions=["रेफरल कसे करावे?", "तपासणी कशी सुरू करावी?", "ऑडिओ-व्हिज्युअल निरीक्षण"],
                follow_up_prompt="या माहितीने आपल्या प्रश्नाचे निरसन झाले का?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="**SPARSH Risk Stratification Guide:**\n\n- 🟢 **Green (On Track):** Developmental milestones are on target. Continue routine monitoring at the next scheduled checkpoint.\n- 🟡 **Yellow (Monitor / Moderate Delay):** Milestones missed in specific domains. Introduce targeted stimulation activities and repeat screening in 1-3 months.\n- 🔴 **Red (At Risk / Red Flag):** High risk identified or critical milestone failed. Promptly create a referral to the District Early Intervention Centre (DEIC).",
                suggestions=["How to create a Referral", "How to start screening", "Audio-Visual Assessment"],
                follow_up_prompt="Did this answer your question?",
                provider="local_grounded",
            )

    # 7c. Child Registration
    if any(k in msg for k in ["register", "enroll", "registration", "पंजीकरण", "नोंदणी"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="**बच्चे का पंजीकरण (Child Registration):**\n\n1. निचली नेविगेशन पट्टी में **More → Register Child** पर क्लिक करें।\n2. बच्चे का नाम, लिंग, जन्मतिथि और अभिभावक का नाम दर्ज करें।\n3. स्पर्श जन्मतिथि के आधार पर बच्चे की सटीक आयु की गणना करता है।\n4. पंजीकरण के बाद बच्चा तुरंत आपकी केंद्र सूची में जुड़ जाएगा और आप स्क्रीनिंग शुरू कर सकते हैं।",
                suggestions=["स्क्रीनिंग कैसे शुरू करें?", "बच्चे की सूची कहाँ दिखेगी?", "होम पेज पर वापस जाएं"],
                follow_up_prompt="क्या आपको पंजीकरण में कोई सहायता चाहिए?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="**बालक नोंदणी (Child Registration):**\n\n1. तळातील नेव्हिगेशन मेनूमध्ये **More → बालकाची नोंदणी करा** निवडा.\n2. बालकाचे नाव, लिंग, जन्मतारीख आणि पालकांचे नाव भरा.\n3. स्पर्श जन्मतारखेवरून बालकाचे अचूक वय आपोआप मोजतो.\n4. नोंदणी पूर्ण झाल्यावर बालक आपल्या केंद्र यादीत समाविष्ट होईल व आपण तपासणी सुरू करू शकता.",
                suggestions=["तपासणी कशी सुरू करावी?", "बालकांची यादी कुठे दिसेल?", "मुख्यपृष्ठावर जा"],
                follow_up_prompt="आपल्याला नोंदणीबद्दल अधिक काही विचारायचे आहे का?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="**Child Registration in SPARSH:**\n\n1. Open the navigation menu and select **Register Child**.\n2. Fill in the child's name, gender, date of birth, and guardian information.\n3. SPARSH automatically calculates the child's age in months to assign the correct RBSK milestone checkpoint.\n4. Once saved, the child appears in your centre roster ready for screening.",
                suggestions=["How to start screening", "Where to view children roster", "Go to Dashboard"],
                follow_up_prompt="Would you like help registering a child?",
                provider="local_grounded",
            )

    # 7d. Alerts Screen
    if any(k in msg for k in ["alert", "अलर्ट", "सूचना"]):
        if lang == "hi":
            return ChatAssistantResponse(
                reply="**अलर्ट्स (Alerts):** जिन बच्चों की स्क्रीनिंग में रेड फ्लैग या गंभीर देरी पाई जाती है, वे तुरंत 'अलर्ट्स' स्क्रीन पर दिखाई देते हैं। यहाँ से आप सीधे DEIC रेफरल तैयार कर सकते हैं ताकि बच्चे को समय पर विशेषज्ञ सुविधा मिल सके।",
                suggestions=["रेफरल कैसे बनाएं?", "जोखिम स्तर समझें", "स्क्रीनिंग सहायता"],
                follow_up_prompt="क्या आप रेफरल प्रक्रिया के बारे में अधिक जानना चाहते हैं?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="**अलर्ट्स (Alerts):** ज्या बालकांच्या तपासणीत उच्च जोखीम किंवा रेड फ्लॅग आढळतो, त्यांची यादी 'Alerts' स्क्रीनवर दिसते. येथून आपण बालकाला जिल्हा शीघ्र हस्तक्षेप केंद्र (DEIC) कडे पाठवण्यासाठी रेफरल तयार करू शकता.",
                suggestions=["रेफरल कसे तयार करावे?", "जोखीम स्तर समजून घ्या", "स्क्रीनिंग मदत"],
                follow_up_prompt="आपल्याला रेफरल प्रक्रियेबद्दल अधिक माहिती हवी आहे का?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="**Alerts in SPARSH:** Displays children identified as High Risk (Red) or with critical milestone flags that require urgent clinical attention. You can generate a direct DEIC referral from this view.",
                suggestions=["How to create a referral", "Understand Risk Levels", "Screening Workflow"],
                follow_up_prompt="Would you like to know more about handling alerts?",
                provider="local_grounded",
            )

    # 7e. Current Screen Context
    if screen == "screening":
        if lang == "hi":
            return ChatAssistantResponse(
                reply="आप वर्तमान में **स्क्रीनिंग पृष्ठ** पर हैं। यहाँ आप बच्चे के विकासात्मक मील के पत्थरों (Gross Motor, Fine Motor, Language, Cognitive, Social) का मूल्यांकन कर सकते हैं। प्रत्येक प्रश्न का अवलोकन करके 'हाँ', 'नहीं' या 'अस्पष्ट' चुनें।",
                suggestions=["ऑडियो-विजुअल जाँच", "परिणाम कैसे समझें?", "रेफरल कैसे बनाएं?"],
                follow_up_prompt="क्या आपको स्क्रीनिंग में कोई परेशानी आ रही है?",
                provider="local_grounded",
            )
        elif lang == "mr":
            return ChatAssistantResponse(
                reply="आपण सध्या **स्क्रीनिंग स्क्रीन** वर आहात. येथे आपण बालकाच्या विकासात्मक टप्प्यांचे (Gross Motor, Fine Motor, Language, Cognitive, Social) मूल्यांकन करू शकता. प्रत्येक प्रश्नाचे निरीक्षण करून योग्य उत्तर नोंदवा.",
                suggestions=["ऑडिओ-व्हिज्युअल चाचणी", "निकाल कसे समजून घ्यावेत?", "रेफरल प्रक्रिया"],
                follow_up_prompt="आपल्याला तपासणी करताना काही अडचण येत आहे का?",
                provider="local_grounded",
            )
        else:
            return ChatAssistantResponse(
                reply="You are currently on the **Screening screen**. Here you record milestone observations across Gross Motor, Fine Motor, Language, Cognitive, and Social domains. Answer Yes, No, or Unsure based on your observation of the child.",
                suggestions=["Audio-Visual Assessment", "Understand Results", "How to create a referral"],
                follow_up_prompt="Do you have questions about this screening?",
                provider="local_grounded",
            )

    # -------------------------------------------------------------
    # 8. General Default Greeting / Fallback
    # -------------------------------------------------------------
    if lang == "hi":
        return ChatAssistantResponse(
            reply="नमस्ते! मैं स्पर्श (SPARSH) सहायक हूँ। मैं बाल विकास स्क्रीनिंग, चेकपॉइंट्स, ऑडियो-विजुअल मूल्यांकन और रेफरल प्रक्रियाओं में आपकी सहायता कर सकता हूँ।\n\nआप नीचे दिए गए विकल्पों में से चुन सकते हैं या अपना प्रश्न टाइप कर सकते हैं:",
            suggestions=["स्क्रीनिंग कैसे शुरू करें?", "परिणाम और जोखिम स्तर", "बच्चे का पंजीकरण", "अलर्ट और रेफरल"],
            follow_up_prompt="मैं आज आपकी किस प्रकार सहायता कर सकता हूँ?",
            provider="local_grounded",
        )
    elif lang == "mr":
        return ChatAssistantResponse(
            reply="नमस्ते! मी स्पर्श (SPARSH) सहाय्यक आहे. बाल विकास तपासणी, वयाचे टप्पे, ऑडिओ-व्हिज्युअल मूल्यांकन आणि रेफरल प्रक्रियेत मी आपल्याला मदत करू शकतो.\n\nआपण खालील पर्यायांमधून निवडू शकता किंवा आपला प्रश्न टाईप करू शकता:",
            suggestions=["स्क्रीनिंग कशी सुरू करावी?", "निकाल आणि जोखीम स्तर", "बालक नोंदणी", "अलर्ट्स आणि रेफरल"],
            follow_up_prompt="मी आज आपल्याला कशी मदत करू शकतो?",
            provider="local_grounded",
        )
    else:
        return ChatAssistantResponse(
            reply="Hello! I am your SPARSH Assistant. I can help you understand developmental screening, age checkpoints, audio-visual assessments, and the referral workflow.\n\nYou can select a topic below or type your question freely:",
            suggestions=["Start Screening", "Understand Results", "Child Registration", "Alerts & Referrals"],
            follow_up_prompt="How can I assist you with SPARSH today?",
            provider="local_grounded",
        )


async def call_gemini_chat(req: ChatAssistantRequest) -> ChatAssistantResponse:
    """Call Google Generative AI API with safety and grounding."""
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
    context_prefix = ""
    if req.current_screen:
        context_prefix += f"[Context: User is on the '{req.current_screen}' screen in SPARSH. Language: {req.language}]\n"
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
                )
            except Exception:
                if is_safe_text(raw_text):
                    return ChatAssistantResponse(
                        reply=raw_text,
                        suggestions=[],
                        provider=model,
                    )
                return _get_local_grounded_reply(req)

    except Exception as exc:
        logger.warning("Gemini chat request failed: %s. Using local grounded fallback.", exc)
        return _get_local_grounded_reply(req)
