import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentWorker, setCurrentWorker] = useState(null)
  const [currentChild, setCurrentChild] = useState(null)
  return (
    <AppContext.Provider value={{ currentWorker, setCurrentWorker, currentChild, setCurrentChild }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
