import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import LoginScreen from './screens/LoginScreen'
import SplashScreen from './screens/SplashScreen'
import HomeScreen from './screens/HomeScreen'
import RegistrationScreen from './screens/RegistrationScreen'

export default function App() {
  const [screen, setScreen] = useState('splash')
  return (
    <AppProvider>
      {screen === 'splash' && <SplashScreen onContinue={() => setScreen('login')} />}
      {screen === 'login' && <LoginScreen onBack={() => setScreen('splash')} onLogin={() => setScreen('dashboard')} />}
      {screen === 'dashboard' && <HomeScreen onNavigate={setScreen} />}
      {screen === 'register' && <RegistrationScreen onNavigate={setScreen} />}
    </AppProvider>
  )
}