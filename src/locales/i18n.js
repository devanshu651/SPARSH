import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import hi from './hi.json'
import screeningUi from './screeningUi.json'
import screeningQuestions from './screeningQuestions.json'
import privacyNotice from './privacyNotice.json'

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    en: { translation: { ...en, screening: screeningUi.en, screeningQuestions } },
    hi: { translation: { ...hi, screening: screeningUi.hi, screeningQuestions } },
    mr: { translation: { ...en, screening: screeningUi.mr, screeningQuestions } },
  },
  supportedLngs: ['en', 'hi', 'mr'],
  fallbackLng: 'en',
  detection: { caches: ['localStorage'] },
  interpolation: { escapeValue: false }
})

for (const language of ['en', 'hi', 'mr']) {
  i18n.addResourceBundle(language, 'translation', { privacyNotice: privacyNotice[language] }, true, true)
}

export default i18n
