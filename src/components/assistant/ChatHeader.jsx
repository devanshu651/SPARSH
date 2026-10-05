import { useTranslation } from 'react-i18next'
import Icon from '../Icon'

export default function ChatHeader({ onClose, onClear }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between border-b border-[#E5EBE7] bg-[#1B4D3E] px-4 py-3 text-white select-none">
      {/* Left: Assistant icon + SPARSH Assistant + Subtitle */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-xs">
          <Icon name="leaf" className="h-4 w-4 text-emerald-200" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold tracking-wide text-white truncate">
              {t('assistant.title', 'SPARSH Assistant')}
            </h2>
            <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-400" title="Online" />
          </div>
          <p className="text-[11px] text-emerald-100/80 leading-tight truncate">
            {t('assistant.subtitle', 'Developmental & Platform Guide')}
          </p>
        </div>
      </div>

      {/* Right: Refresh button + Close (X) button */}
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-100/80 hover:bg-white/15 hover:text-white active:bg-white/20 transition-colors"
            title={t('assistant.clearChat', 'Clear chat')}
            aria-label={t('assistant.clearChat', 'Clear chat')}
          >
            <Icon name="refresh" className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white hover:bg-white/25 active:bg-white/30 transition-colors shadow-xs"
          title={t('assistant.close', 'Close assistant')}
          aria-label={t('assistant.close', 'Close assistant')}
        >
          <Icon name="cross" className="h-4 w-4 stroke-[2.2]" />
        </button>
      </div>
    </div>
  )
}
