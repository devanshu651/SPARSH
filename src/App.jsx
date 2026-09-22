import { useState, useEffect, useCallback, useRef } from 'react'
import { AppProvider } from './context/AppContext'
import ErrorBoundary from './components/ErrorBoundary'

import SplashScreen from './screens/SplashScreen'
import LoginScreen from './screens/LoginScreen'
import WorkerRegistrationScreen from './screens/WorkerRegistrationScreen'

import HomeScreen from './screens/HomeScreen'
import RegistrationScreen from './screens/RegistrationScreen'
import ScreeningScreen from './screens/ScreeningScreen'
import AVAssessmentScreen from './screens/AVAssessmentScreen'

import AnalysisScreen from './screens/AnalysisScreen'
import ReportScreen from './screens/ReportScreen'
import ReferralScreen from './screens/ReferralScreen'
import HistoryScreen from './screens/HistoryScreen'
import RecordsScreen from './screens/RecordsScreen'

import ChildrenScreen from './screens/ChildrenScreen'
import AnalyticsScreen from './screens/AnalyticsScreen'
import AlertsScreen from './screens/AlertsScreen'
import SettingsScreen from './screens/SettingsScreen'
import AdminConsoleScreen from './screens/AdminConsoleScreen'

const getInitialScreen = () => {
  if (typeof window !== 'undefined' && window.history.state && window.history.state.screen) {
    return window.history.state.screen
  }
  return 'splash'
}

export default function App() {
  const [screen, setScreen] = useState(getInitialScreen)
  const currentScreenRef = useRef(screen)

  useEffect(() => {
    currentScreenRef.current = screen
  }, [screen])

  useEffect(() => {
    const currentState = window.history.state
    if (!currentState || !currentState.screen) {
      window.history.replaceState({ screen, stack: [screen], index: 0 }, '')
    }

    const handlePopState = (event) => {
      if (event.state && event.state.screen) {
        currentScreenRef.current = event.state.screen
        setScreen(event.state.screen)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((nextScreen, { replace = false, isBack = false } = {}) => {
    if (!nextScreen) return
    if (nextScreen === currentScreenRef.current) return

    const currentState = window.history.state || {}
    const stack = Array.isArray(currentState.stack) ? currentState.stack : [currentScreenRef.current]
    const currentIndex = typeof currentState.index === 'number' ? currentState.index : stack.length - 1

    // Check if target screen exists earlier in history stack
    let targetIndex = -1
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (stack[i] === nextScreen) {
        targetIndex = i
        break
      }
    }

    // In-app back navigation: return to previous screen without creating duplicate history entries
    if (targetIndex !== -1 && !replace && (isBack || targetIndex === currentIndex - 1)) {
      const delta = targetIndex - currentIndex
      currentScreenRef.current = nextScreen
      setScreen(nextScreen)
      window.history.go(delta)
      return
    }

    currentScreenRef.current = nextScreen
    if (replace) {
      const newStack = [...stack.slice(0, currentIndex), nextScreen]
      window.history.replaceState({ screen: nextScreen, stack: newStack, index: currentIndex }, '')
      setScreen(nextScreen)
    } else {
      const newStack = [...stack.slice(0, currentIndex + 1), nextScreen]
      const newIndex = currentIndex + 1
      window.history.pushState({ screen: nextScreen, stack: newStack, index: newIndex }, '')
      setScreen(nextScreen)
    }
  }, [])

  return (
    <ErrorBoundary>
      <AppProvider>

      {screen === 'splash' && (
        <SplashScreen
          onContinue={() => navigate('login')}
        />
      )}

      {screen === 'login' && (
        <LoginScreen
          onBack={() => navigate('splash', { isBack: true })}
          onLogin={() => navigate('dashboard', { replace: true })}
          onRegister={() => navigate('worker-registration')}
        />
      )}

      {screen === 'worker-registration' && (
        <WorkerRegistrationScreen
          onBack={() => navigate('login', { isBack: true })}
          onNavigate={navigate}
        />
      )}

      {screen === 'dashboard' && (
        <HomeScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'register' && (
        <RegistrationScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'screening' && (
        <ScreeningScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'av-assessment' && (
        <AVAssessmentScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'analysis' && (
        <AnalysisScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'report' && (
        <ReportScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'referral' && (
        <ReferralScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'history' && (
        <HistoryScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'records' && (
        <RecordsScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'children' && (
        <ChildrenScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'analytics' && (
        <AnalyticsScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'alerts' && (
        <AlertsScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          onNavigate={navigate}
        />
      )}

      {screen === 'admin-console' && (
        <AdminConsoleScreen
          onNavigate={navigate}
        />
      )}

      </AppProvider>
    </ErrorBoundary>
  )
}