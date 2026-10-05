import { authService } from '../auth'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '')

/**
 * Send chat message to SPARSH Assistant backend.
 *
 * @param {Object} params
 * @param {string} params.message
 * @param {Array<{role: string, content: string}>} [params.history]
 * @param {string} [params.language]
 * @param {string} [params.currentScreen]
 * @returns {Promise<{reply: string, suggestions: string[], follow_up_prompt?: string, provider?: string}>}
 */
export async function sendChatMessage({ message, history = [], language = 'en', currentScreen = 'dashboard', context = {} }) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  // Attach token if user is signed in, but allow guest navigation guidance
  try {
    const user = authService.getCurrentUser()
    if (user && typeof user.getIdToken === 'function') {
      const token = await user.getIdToken()
      if (token) headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // Non-fatal, continue with unauthenticated request
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: message.trim(),
        history: history.slice(-8),
        language,
        current_screen: currentScreen,
        context,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.detail || `Server returned ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    clearTimeout(timeoutId)
    console.warn('SPARSH Assistant chat request error:', err.message || err)
    throw err
  }
}
