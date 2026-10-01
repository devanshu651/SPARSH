import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/auth'
import { screeningsApi, usersApi } from '../services/api'
import { syncQueuedScreenings } from '../services/offline'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentWorker, setCurrentWorker] = useState(null)
  const [currentChild, setCurrentChild] = useState(null)
  const [screeningResult, setScreeningResult] = useState(null)
  const [pendingScreening, setPendingScreening] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => authService.observeAuthState(async (user) => {
    if (!user) {
      setCurrentWorker(null)
      setAuthError(null)
      setAuthReady(true)
      return
    }

    try {
      const profile = await usersApi.getMe()
      setAuthError(null)
      setCurrentWorker({ ...profile, email: user.email })
    } catch (error) {
      setAuthError(error)
      setCurrentWorker(null)
    } finally {
      setAuthReady(true)
    }
  }), [])

  useEffect(() => {
    if (!currentWorker || !navigator.onLine) return undefined
    const sync = async () => {
      try {
        await syncQueuedScreenings((payload) => screeningsApi.submit(payload))
      } catch {
        // Queued items remain in IndexedDB when the authenticated server is unavailable.
      }
    }
    window.addEventListener('online', sync)
    sync()
    return () => window.removeEventListener('online', sync)
  }, [currentWorker?.uid])

  useEffect(() => {
    const unauthorized = () => {
      authService.signOut().catch(() => {})
      setCurrentWorker(null)
    }
    window.addEventListener('sparsh:unauthorized', unauthorized)
    return () => window.removeEventListener('sparsh:unauthorized', unauthorized)
  }, [])

  return (
    <AppContext.Provider value={{
      currentWorker, setCurrentWorker, currentChild, setCurrentChild,
      screeningResult, setScreeningResult, pendingScreening, setPendingScreening, authReady, authError,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
