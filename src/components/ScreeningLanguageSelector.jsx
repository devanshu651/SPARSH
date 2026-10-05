import { useTranslation } from 'react-i18next'

const languages = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी' },
  { id: 'mr', label: 'मराठी' },
]

export default function ScreeningLanguageSelector() {
  const { t, i18n } = useTranslation()
  const selectedLanguage = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0]

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={t('screening.language')}>
      <span className="text-xs font-semibold text-neutral-700">{t('screening.language')}:</span>
      <div className="inline-flex max-w-full rounded-lg border border-neutral-200 bg-white p-1" role="group" aria-label={t('screening.language')}>
        {languages.map((language) => (
          <button
            key={language.id}
            type="button"
            aria-pressed={selectedLanguage === language.id}
            onClick={() => i18n.changeLanguage(language.id)}
            className={`min-h-9 rounded-md px-2.5 text-xs font-semibold transition sm:px-3 ${selectedLanguage === language.id ? 'bg-primary-800 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
          >
            {language.label}
          </button>
        ))}
      </div>
    </div>
  )
}
