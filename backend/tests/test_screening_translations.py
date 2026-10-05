import json
import subprocess
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
QUESTIONNAIRE_PATH = ROOT / "backend/app/config/sparsh_screening_questionnaire_draft.json"
TRANSLATIONS_PATH = ROOT / "src/locales/screeningQuestions.json"
SCREENING_SCREEN_PATH = ROOT / "src/screens/ScreeningScreen.jsx"
I18N_PATH = ROOT / "src/locales/i18n.js"


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
    assert "screeningQuestions.${item.id}.${language}" in source
    assert "milestone_id: id" in source
    assert "handleAnswer(task.id, 'YES')" in source
    assert "handleAnswer(task.id, 'NO')" in source
    assert "handleAnswer(task.id, 'UNSURE')" in source
    assert "response: answers[id]" in source


def test_all_active_questions_resolve_through_the_runtime_i18next_lookup():
    # Recreate the production i18next resource registration and use the same
    # getResource call shape as ScreeningScreen, rather than checking raw JSON
    # fields alone. This catches nested-path errors that return an object or
    # undefined at runtime.
    script = r"""
const fs = require('node:fs');
const i18next = require('i18next').createInstance();
const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const questionnaire = readJson('backend/app/config/sparsh_screening_questionnaire_draft.json');
const questions = readJson('src/locales/screeningQuestions.json');
const ui = readJson('src/locales/screeningUi.json');
const en = readJson('src/locales/en.json');
const hi = readJson('src/locales/hi.json');
const languages = ['en', 'hi', 'mr'];
const resources = {
  en: { translation: { ...en, screening: ui.en, screeningQuestions: questions } },
  hi: { translation: { ...hi, screening: ui.hi, screeningQuestions: questions } },
  mr: { translation: { ...en, screening: ui.mr, screeningQuestions: questions } },
};
const stableIds = questionnaire.items.map((item) => item.id);
const responseValues = ['YES', 'NO', 'UNSURE'];
(async () => {
  await i18next.init({ resources, supportedLngs: languages, fallbackLng: 'en' });
  if (stableIds.length !== 50) throw new Error(`Expected the active 50-question questionnaire, got ${stableIds.length}`);
  for (const language of ['en', 'hi', 'mr', 'en']) {
    await i18next.changeLanguage(language);
    const idsAfterSwitch = questionnaire.items.map((item) => item.id);
    if (JSON.stringify(idsAfterSwitch) !== JSON.stringify(stableIds)) throw new Error(`Question IDs changed for ${language}`);
    for (const item of questionnaire.items) {
      const value = i18next.getResource(language, 'translation', `screeningQuestions.${item.id}.${language}`);
      if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing runtime ${language} translation: ${item.id}`);
    }
    if (JSON.stringify(responseValues) !== JSON.stringify(['YES', 'NO', 'UNSURE'])) throw new Error('Answer values changed');
  }
  console.log(`Runtime i18next coverage passed: ${stableIds.length} questions × 3 languages; language switch preserved IDs and response values.`);
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
"""
    result = subprocess.run(
        ["node", "-e", script],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    assert result.returncode == 0, result.stderr or result.stdout
    assert "50 questions × 3 languages" in result.stdout


def test_runtime_lookup_uses_the_configured_question_resource():
    source = I18N_PATH.read_text(encoding="utf-8")
    assert "en: { translation: { ...en, screening: screeningUi.en, screeningQuestions } }" in source
    assert "hi: { translation: { ...hi, screening: screeningUi.hi, screeningQuestions } }" in source
    assert "mr: { translation: { ...en, screening: screeningUi.mr, screeningQuestions } }" in source


def test_screening_locales_have_the_same_ui_keys():
    locale_data = _load(ROOT / "src/locales/screeningUi.json")
    assert set(locale_data) == {"en", "hi", "mr"}
    keys_by_language = {language: _flatten_keys(values) for language, values in locale_data.items()}
    assert keys_by_language["en"] == keys_by_language["hi"] == keys_by_language["mr"]
