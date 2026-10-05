import json
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
QUESTIONNAIRE_PATH = ROOT / "backend/app/config/sparsh_screening_questionnaire_draft.json"
TRANSLATIONS_PATH = ROOT / "src/locales/screeningQuestions.json"
SCREENING_SCREEN_PATH = ROOT / "src/screens/ScreeningScreen.jsx"


def _load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _flatten_keys(value, prefix=""):
    keys = set()
    for key, child in value.items():
        dotted_key = f"{prefix}.{key}" if prefix else key
        keys.add(dotted_key)
        if isinstance(child, dict):
            keys.update(_flatten_keys(child, dotted_key))
    return keys


def _normalized_question(text: str) -> str:
    return unicodedata.normalize("NFKC", text).replace("’", "'").strip()


def _repair_source_quotes(text: str) -> str:
    # A few legacy English prompts contain question marks where quoted words
    # should be. Keep the final question mark and normalize those quote markers.
    if text.endswith("?"):
        return text[:-1].replace("?", "'") + "?"
    return text.replace("?", "'")


def test_every_question_has_complete_translations_and_stable_ids():
    questionnaire = _load(QUESTIONNAIRE_PATH)
    translations = _load(TRANSLATIONS_PATH)
    source_by_id = {item["id"]: item["question"] for item in questionnaire["items"]}

    assert set(translations) == set(source_by_id)
    for question_id, source_text in source_by_id.items():
        localized = translations[question_id]
        assert set(localized) == {"en", "hi", "mr"}
        assert all(isinstance(localized[language], str) and localized[language].strip() for language in ("en", "hi", "mr"))
        assert _normalized_question(localized["en"]) == _normalized_question(_repair_source_quotes(source_text))


def test_language_selection_is_presentation_only_and_answer_values_stay_stable():
    source = SCREENING_SCREEN_PATH.read_text(encoding="utf-8")

    # Localization resolves display text by the unchanged source ID; payload
    # construction and the internal YES/NO/UNSURE values stay language-neutral.
    assert "screeningQuestions.${item.id}" in source
    assert "milestone_id: id" in source
    assert "handleAnswer(task.id, 'YES')" in source
    assert "handleAnswer(task.id, 'NO')" in source
    assert "handleAnswer(task.id, 'UNSURE')" in source
    assert "response: answers[id]" in source


def test_screening_locales_have_the_same_ui_keys():
    locale_data = _load(ROOT / "src/locales/screeningUi.json")
    assert set(locale_data) == {"en", "hi", "mr"}
    keys_by_language = {language: _flatten_keys(values) for language, values in locale_data.items()}
    assert keys_by_language["en"] == keys_by_language["hi"] == keys_by_language["mr"]
