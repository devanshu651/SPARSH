import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../locales/i18n'

export default function LanguageSelector({
  size = 'md',
  className = '',
  onChange
}) {
  const { i18n } = useTranslation()
  const currentLang = ((i18n.language || 'en').split('-')[0]).toLowerCase()

  const handleSelect = (code) => {
    i18n.changeLanguage(code)
    onChange?.(code)
  }

  const isSmall = size === 'sm'

  return (
    <div
      role="group"
      aria-label="UI Language"
      className={`inline-flex items-center rounded-xl bg-[#F5F8F6] p-1 border border-[#E5EBE7] gap-1 ${className}`}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = currentLang === lang.code

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleSelect(lang.code)}
            aria-pressed={isActive}
            className={`rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 cursor-pointer ${
              isSmall
                ? 'px-2.5 py-1 text-xs'
                : 'px-3 py-1.5 text-xs sm:text-sm'
            } ${
              isActive
                ? 'bg-[#1B4D3E] text-white shadow-2xs'
                : 'text-[#5A6660] hover:text-[#1A201E] hover:bg-white/80'
            }`}
          >
            {lang.nativeLabel}
          </button>
        )
      })}
    </div>
  )
}
