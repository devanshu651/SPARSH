import { useState } from 'react'
import { AppProvider } from './context/AppContext'

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
import AdminConsoleScreen from './screens/AdminConsoleScreen'

export default function App() {
  const [screen, setScreen] = useState('splash')

  return (
    <AppProvider>

      {screen === 'splash' && (
        <SplashScreen
          onContinue={() => setScreen('login')}
        />
      )}

      {screen === 'login' && (
        <LoginScreen
          onBack={() => setScreen('splash')}
          onLogin={() => setScreen('dashboard')}
        />
      )}

      {screen === 'worker-registration' && (
        <WorkerRegistrationScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'dashboard' && (
        <HomeScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'register' && (
        <RegistrationScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'screening' && (
        <ScreeningScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'av-assessment' && (
        <AVAssessmentScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'analysis' && (
        <AnalysisScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'report' && (
        <ReportScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'referral' && (
        <ReferralScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'history' && (
        <HistoryScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'records' && (
        <RecordsScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'children' && (
        <ChildrenScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'alerts' && (
        <AlertsScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          onNavigate={setScreen}
        />
      )}

      {screen === 'admin-console' && (
        <AdminConsoleScreen
          onNavigate={setScreen}
        />
      )}

    </AppProvider>
  )
}