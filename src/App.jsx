import { useEffect, useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
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
import AlertsScreen from './screens/AlertsScreen'
import SettingsScreen from './screens/SettingsScreen'
import { isDemoMode, stopDemoMode } from './services/demo'

function Router() {
  const [screen, setScreen] = useState('splash')
  const { currentWorker, authReady, setCurrentWorker } = useApp()

  useEffect(() => {
    const out = () => {
      setCurrentWorker(null)
      setScreen('login')
    }

    window.addEventListener('sparsh:unauthorized', out)

    return () => {
      window.removeEventListener('sparsh:unauthorized', out)
    }
  }, [setCurrentWorker])

  if (
    !authReady &&
    !['splash', 'login', 'worker-registration'].includes(screen)
  ) {
    return (
      <div className="grid min-h-screen place-items-center">
        Loading SPARSH…
      </div>
    )
  }

  const login = (
    <LoginScreen
      onBack={() => setScreen('splash')}
      onLogin={() => setScreen('dashboard')}
      onRegister={() => setScreen('worker-registration')}
    />
  )

  if (screen === 'splash') {
    return (
      <SplashScreen
        onContinue={() => setScreen(currentWorker ? 'dashboard' : 'login')}
      />
    )
  }

  if (screen === 'login') return login

  if (screen === 'worker-registration') {
    return <WorkerRegistrationScreen onBack={() => setScreen('login')} />
  }

  if (!currentWorker) return login

  const props = { onNavigate: setScreen }

  const screens = {
    dashboard: <HomeScreen {...props} />,
    register: <RegistrationScreen {...props} />,
    screening: <ScreeningScreen {...props} />,
    'av-assessment': <AVAssessmentScreen {...props} />,
    analysis: <AnalysisScreen {...props} />,
    report: <ReportScreen {...props} />,
    referral: <ReferralScreen {...props} />,
    records: <RecordsScreen {...props} />,
    history: <HistoryScreen {...props} />,
    children: <ChildrenScreen {...props} />,
    alerts: <AlertsScreen {...props} />,
    settings: <SettingsScreen {...props} />,
    analytics: <HomeScreen {...props} />,
  }

  return (
    <>
      {isDemoMode() && (
        <div className="fixed inset-x-0 top-0 z-50 flex min-h-10 items-center justify-center gap-3 bg-amber-300 px-3 text-center text-xs font-bold text-amber-950">
          DEMO MODE — local sample data only
          <button
            type="button"
            className="underline"
            onClick={() => {
              stopDemoMode()
              setCurrentWorker(null)
              setScreen('login')
            }}
          >
            Exit demo
          </button>
        </div>
      )}

      {screens[screen] || screens.dashboard}
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}