import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../Icon'

function formatMessageText(text) {
  if (!text) return null

  // Split into paragraphs by double newlines
  const paragraphs = text.split(/\n\s*\n/)

  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n')
    // Check if paragraph is a bullet or numbered list
    const isBulletList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '))
    const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()))

    if (isBulletList) {
      return (
        <ul key={pIdx} className="list-disc pl-4 space-y-1 my-1.5 text-xs sm:text-sm">
          {lines.map((line, lIdx) => (
            <li key={lIdx} dangerouslySetInnerHTML={{ __html: renderInlineFormatting(line.replace(/^[-*]\s+/, '')) }} />
          ))}
        </ul>
      )
    }

    if (isNumberedList) {
      return (
        <ol key={pIdx} className="list-decimal pl-4 space-y-1 my-1.5 text-xs sm:text-sm">
          {lines.map((line, lIdx) => (
            <li key={lIdx} dangerouslySetInnerHTML={{ __html: renderInlineFormatting(line.replace(/^\d+\.\s+/, '')) }} />
          ))}
        </ol>
      )
    }

    return (
      <p
        key={pIdx}
        className="my-1 text-xs sm:text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderInlineFormatting(para.replace(/\n/g, '<br/>')) }}
      />
    )
  })
}

function renderInlineFormatting(str) {
  // Bold **text**
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

export default function ChatMessageList({ messages = [], loading = false, error = null, onRetry }) {
  const { t } = useTranslation()
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, error])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 bg-[#F8FAF9]"
    >
      {messages.map((msg, index) => {
        const isUser = msg.role === 'user'

        return (
          <div
            key={index}
            className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!isUser && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1B4D3E] text-white shadow-xs">
                <Icon name="leaf" className="h-3.5 w-3.5 text-emerald-200" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                isUser
                  ? 'bg-[#1B4D3E] text-white rounded-br-xs'
                  : 'bg-white text-[#1A201E] border border-[#E5EBE7] rounded-bl-xs'
              }`}
            >
              {isUser ? (
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="text-[#1A201E]">
                  {formatMessageText(msg.content)}
                  {msg.follow_up_prompt && (
                    <p className="mt-2 pt-1.5 border-t border-[#F0F4F1] text-[11px] sm:text-xs font-semibold text-[#1B4D3E]">
                      {msg.follow_up_prompt}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {loading && (
        <div className="flex items-end gap-2 justify-start">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1B4D3E] text-white shadow-xs">
            <Icon name="leaf" className="h-3.5 w-3.5 text-emerald-200" />
          </div>
          <div className="rounded-2xl rounded-bl-xs bg-white border border-[#E5EBE7] px-4 py-3 shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#1B4D3E] animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-[#1B4D3E] animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-[#1B4D3E] animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 flex items-center justify-between gap-2">
          <span>{error}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="font-medium text-rose-700 hover:text-rose-900 underline shrink-0"
            >
              {t('common.retry', 'Retry')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
