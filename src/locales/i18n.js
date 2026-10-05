import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import hi from './hi.json'
import mr from './mr.json'

export const STORAGE_KEY = 'sparsh_ui_language'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' }
]

// Retrieve initial UI language from localStorage, strictly defaulting to 'en'
const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en'
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('i18nextLng')
    if (saved) {
      // Normalize e.g. 'en-US' -> 'en'
      const base = saved.split('-')[0].toLowerCase()
      if (['en', 'hi', 'mr'].includes(base)) {
        return base
      }
    }
  } catch {
    // localStorage might be unavailable or restricted
  }
  return 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'mr'],
    interpolation: {
      escapeValue: false
    }
  })

// Listen for language changes and persist directly to localStorage
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    try {
      const base = (lng || 'en').split('-')[0].toLowerCase()
      localStorage.setItem(STORAGE_KEY, base)
      localStorage.setItem('i18nextLng', base)
    } catch (e) {
      console.warn('Unable to persist UI language preference in localStorage:', e)
    }
  }
})

export default i18n
