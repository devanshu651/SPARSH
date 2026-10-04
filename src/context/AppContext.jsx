import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
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
  const profileRequestRef = useRef(null)

  const loadCurrentWorker = useCallback((user) => {
    if (profileRequestRef.current?.uid === user.uid) return profileRequestRef.current.promise

    const promise = usersApi.getMe().then((profile) => {
      if (authService.getCurrentUser()?.uid !== user.uid) return profile
      setAuthError(null)
      setCurrentWorker({ ...profile, email: user.email })
      return profile
    }).catch((error) => {
      if (authService.getCurrentUser()?.uid === user.uid) {
        setAuthError(error)
        setCurrentWorker(null)
      }
      if (profileRequestRef.current?.uid === user.uid) profileRequestRef.current = null
      throw error
    })

    profileRequestRef.current = { uid: user.uid, promise }
    return promise
  }, [])

  useEffect(() => authService.observeAuthState(async (user) => {
    if (!user) {
      profileRequestRef.current = null
      setCurrentWorker(null)
      setAuthError(null)
      setAuthReady(true)
      return
    }

    setAuthReady(false)
    try {
      await loadCurrentWorker(user)
    } catch {
      // The login screen displays the profile error when sign-in is in progress.
    } finally {
      setAuthReady(true)
    }
  }), [loadCurrentWorker])

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
      loadCurrentWorker,
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
