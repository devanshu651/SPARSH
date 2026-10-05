import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../Icon'

export default function ChatInput({ onSend, disabled = false }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-2.5 bg-white border-t border-[#E5EBE7]"
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('assistant.placeholder', 'Type your question...')}
        className="flex-1 min-w-0 bg-[#F8FAF9] border border-[#D5DDD7] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1A201E] placeholder-[#8E9C95] focus:outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] transition-all disabled:opacity-50"
        aria-label={t('assistant.placeholder', 'Type your question...')}
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153D31] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none shadow-sm"
        title={t('assistant.send', 'Send')}
        aria-label={t('assistant.send', 'Send')}
      >
        <Icon name="send" className="h-4 w-4" />
      </button>
    </form>
  )
}
