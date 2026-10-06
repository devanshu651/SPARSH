import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import hi from './hi.json'
import screeningUi from './screeningUi.json'
import screeningQuestions from './screeningQuestions.json'
import govSupportUi from './govSupportUi.json'

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

i18n.addResourceBundle('en', 'translation', { govSupport: govSupportUi.en }, true, true)
i18n.addResourceBundle('hi', 'translation', { govSupport: govSupportUi.hi }, true, true)
i18n.addResourceBundle('mr', 'translation', { govSupport: govSupportUi.mr }, true, true)

export function registerMilestoneTranslations(milestones, i18nInstance = i18n) {
  if (!Array.isArray(milestones) || !i18nInstance) return
  const supported = ['en', 'hi', 'mr']
  milestones.forEach((item) => {
    const text = item?.question || item?.description
    if (!item?.id || typeof text !== 'string' || !text.trim()) return
    supported.forEach((lng) => {
      const current = i18nInstance.getResource(lng, 'translation', `screeningQuestions.${item.id}.${lng}`)
      if (typeof current !== 'string' || !current.trim()) {
        i18nInstance.addResource(lng, 'translation', `screeningQuestions.${item.id}.${lng}`, text)
      }
    })
  })
}

export default i18n

