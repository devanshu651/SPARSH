import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../Icon'
import ChatHeader from './ChatHeader'
import ChatMessageList from './ChatMessageList'
import ChatSuggestions from './ChatSuggestions'
import ChatInput from './ChatInput'
import { sendChatMessage } from '../../services/assistant/chatApi'

export default function AssistantChat({ currentScreen = 'dashboard', onNavigate }) {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFailedMessage, setLastFailedMessage] = useState(null)

  // Current normalized language
  const currentLang = useMemo(() => {
    const lang = i18n.language || 'en'
    if (lang.startsWith('hi')) return 'hi'
    if (lang.startsWith('mr')) return 'mr'
    return 'en'
  }, [i18n.language])

  // Initial greeting based on language
  const initialGreeting = useMemo(() => {
    if (currentLang === 'hi') {
      return 'नमस्ते! मैं स्पर्श (SPARSH) सहायक हूँ। मैं बाल विकास स्क्रीनिंग, चेकपॉइंट्स, ऑडियो-विजुअल मूल्यांकन और रेफरल प्रक्रियाओं में आपकी सहायता कर सकता हूँ।'
    }
    if (currentLang === 'mr') {
      return 'नमस्ते! मी स्पर्श (SPARSH) सहाय्यक आहे. बाल विकास तपासणी, वयाचे टप्पे, ऑडिओ-व्हिज्युअल मूल्यांकन आणि रेफरल प्रक्रियेत मी आपल्याला मदत करू शकतो.'
    }
    return 'Hello! I am your SPARSH Assistant. I can help you understand developmental screening, age checkpoints, audio-visual assessments, and the referral workflow.'
  }, [currentLang])

  // Initial suggestions based on language
  const defaultSuggestions = useMemo(() => {
    if (currentLang === 'hi') {
      return [
        'स्क्रीनिंग कैसे शुरू करें?',
        'परिणाम और जोखिम स्तर',
        'बच्चे का पंजीकरण',
        'अलर्ट और रेफरल',
        'बोलने या भाषा में देरी',
        'शारीरिक या मोटर विकास',
      ]
    }
    if (currentLang === 'mr') {
      return [
        'स्क्रीनिंग कशी सुरू करावी?',
        'निकाल आणि जोखीम स्तर',
        'बालक नोंदणी',
        'अलर्ट्स आणि रेफरल',
        'बोलण्यात अडचण किंवा विलंब',
        'शारीरिक व हालचालींचा विकास',
      ]
    }
    return [
      'Start Screening',
      'Understand Results',
      'Child Registration',
      'Alerts & Referrals',
      'Speech & Language Concern',
      'Motor & Physical Development',
    ]
  }, [currentLang])

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: initialGreeting,
      follow_up_prompt: currentLang === 'hi' ? 'मैं आज आपकी किस प्रकार सहायता कर सकता हूँ?' : currentLang === 'mr' ? 'मी आज आपल्याला कशी मदत करू शकतो?' : 'How can I assist you with SPARSH today?',
    },
  ])
  const [suggestions, setSuggestions] = useState(defaultSuggestions)

  // Update greeting and suggestions when UI language changes if conversation hasn't diverged
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            role: 'assistant',
            content: initialGreeting,
            follow_up_prompt: currentLang === 'hi' ? 'मैं आज आपकी किस प्रकार सहायता कर सकता हूँ?' : currentLang === 'mr' ? 'मी आज आपल्याला कशी मदत करू शकतो?' : 'How can I assist you with SPARSH today?',
          },
        ]
      }
      return prev
    })
    setSuggestions((prev) => {
      // If suggestions are currently matching previous default set, update them
      return defaultSuggestions
    })
  }, [currentLang, initialGreeting, defaultSuggestions])

  // Close chat when user presses Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSend = useCallback(async (userText) => {
    if (!userText.trim() || loading) return

    const trimmed = userText.trim()
    setError(null)
    setLastFailedMessage(null)

    // Add user message to history
    const userMessage = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setLoading(true)

    // Check for quick workflow navigation shortcuts if requested
    const lower = trimmed.toLowerCase()
    if (onNavigate) {
      if (lower.includes('start screening') || lower.includes('स्क्रीनिंग शुरू') || lower.includes('तपासणी सुरू')) {
        onNavigate('screening')
      } else if (lower.includes('child registration') || lower.includes('register child') || lower.includes('पंजीकरण') || lower.includes('नोंदणी')) {
        onNavigate('register')
      } else if (lower.includes('alerts') || lower.includes('अलर्ट') || lower.includes('सूचना')) {
        onNavigate('alerts')
      }
    }

    try {
      // Build history payload from previous messages (excluding the new current message which is sent in `message`)
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await sendChatMessage({
        message: trimmed,
        history: historyPayload,
        language: currentLang,
        currentScreen,
      })

      const assistantMsg = {
        role: 'assistant',
        content: response.reply,
        follow_up_prompt: response.follow_up_prompt,
        provider: response.provider,
      }

      setMessages((prev) => [...prev, assistantMsg])

      // If backend returned follow-up suggestions, use them; otherwise offer contextual choices
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions)
      } else if (response.follow_up_prompt) {
        setSuggestions(
          currentLang === 'hi'
            ? ['हाँ, धन्यवाद', 'नहीं, और मदद चाहिए']
            : currentLang === 'mr'
            ? ['होय, धन्यवाद', 'नाही, आणखी मदत हवी']
            : ['Yes, thanks', 'No, I need more help']
        )
      } else {
        setSuggestions(defaultSuggestions.slice(0, 3))
      }
    } catch (err) {
      console.error('Chat error:', err)
      setLastFailedMessage(trimmed)
      setError(t('assistant.error', "I'm having trouble responding right now. Please try again."))
    } finally {
      setLoading(false)
    }
  }, [messages, loading, currentLang, currentScreen, onNavigate, defaultSuggestions, t])

  const handleRetry = useCallback(() => {
    if (lastFailedMessage) {
      handleSend(lastFailedMessage)
    }
  }, [lastFailedMessage, handleSend])

  const handleClear = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: initialGreeting,
        follow_up_prompt: currentLang === 'hi' ? 'मैं आज आपकी किस प्रकार सहायता कर सकता हूँ?' : currentLang === 'mr' ? 'मी आज आपल्याला कशी मदत करू शकतो?' : 'How can I assist you with SPARSH today?',
      },
    ])
    setSuggestions(defaultSuggestions)
    setError(null)
    setLastFailedMessage(null)
  }, [initialGreeting, currentLang, defaultSuggestions])

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4D3E] text-white shadow-xl hover:bg-[#153D31] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20 touch-manipulation focus:outline-none focus:ring-4 focus:ring-[#1B4D3E]/30"
          title={t('assistant.open', 'Open SPARSH Assistant')}
          aria-label={t('assistant.open', 'Open SPARSH Assistant')}
        >
          <div className="relative">
            <Icon name="chat" className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={t('assistant.title', 'SPARSH Assistant')}
          className="fixed inset-x-2 bottom-2 top-12 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[580px] z-50 flex flex-col rounded-2xl border border-[#D5DDD7] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <ChatHeader
            onClose={() => setIsOpen(false)}
            onClear={handleClear}
          />

          <ChatMessageList
            messages={messages}
            loading={loading}
            error={error}
            onRetry={lastFailedMessage ? handleRetry : undefined}
          />

          <ChatSuggestions
            suggestions={suggestions}
            onSelect={handleSend}
            disabled={loading}
          />

          <ChatInput
            onSend={handleSend}
            disabled={loading}
          />
        </div>
      )}
    </>
  )
}
