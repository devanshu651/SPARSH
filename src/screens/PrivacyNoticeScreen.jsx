import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import BrandLogo from '../components/BrandLogo'

export default function PrivacyNoticeScreen({ onContinue }) {
  const { t, i18n } = useTranslation()
  const [checked, setChecked] = useState(false)
  const language = ['en', 'hi', 'mr'].includes(i18n.resolvedLanguage) ? i18n.resolvedLanguage : 'en'
  const sections = t('privacyNotice.sections', { returnObjects: true, lng: language })

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-4xl flex-col">
        <header className="mb-5 flex items-center justify-between gap-3">
          <BrandLogo className="h-10 w-10" showWordmark />
          <label className="sr-only" htmlFor="notice-language">Language</label>
          <select id="notice-language" value={language} onChange={(event) => i18n.changeLanguage(event.target.value)} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-600">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>
        </header>

        <section className="flex flex-1 flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-5 sm:px-8">
            <h1 className="font-heading text-xl font-bold tracking-tight text-primary-950 sm:text-2xl">{t('privacyNotice.title', { lng: language })}</h1>
            <p className="mt-1 text-sm text-neutral-600">{t('privacyNotice.intro', { lng: language })}</p>
          </div>

          <div className="grid gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2 sm:px-8">
            {sections.map((section) => (
              <article key={section.title}>
                <h2 className="text-sm font-bold text-primary-900">{section.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">{section.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-auto border-t border-neutral-200 bg-neutral-50 px-5 py-5 sm:px-8">
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-neutral-800">
              <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-teal-700" />
              <span>{t('privacyNotice.acknowledgement', { lng: language })}</span>
            </label>
            <button type="button" disabled={!checked} onClick={onContinue} className="mt-4 w-full rounded-xl bg-primary-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 sm:w-auto sm:min-w-56">
              {t('privacyNotice.continue', { lng: language })}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
