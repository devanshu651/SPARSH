import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/auth'
import { screeningsApi } from '../services/api'
import { syncQueuedScreenings } from '../services/offline'
import { isDemoMode } from '../services/demo'
const AppContext=createContext(null)
const demoWorker={uid:'demo-worker',role:'worker',name:'Demo Anganwadi Worker',centre_ids:['demo-centre'],isDemo:true}
export function AppProvider({children}){
  const [currentWorker,setCurrentWorker]=useState(()=>isDemoMode()?demoWorker:null)
  const [currentChild,setCurrentChild]=useState(null)
  const [screeningResult,setScreeningResult]=useState(null)
  const [pendingScreening,setPendingScreening]=useState(null)
  const [authReady,setAuthReady]=useState(false)
  useEffect(()=>authService.observeAuthState(user=>{setAuthReady(true);if(!user&&!isDemoMode())setCurrentWorker(null)}),[])
  useEffect(()=>{
    const sync=async()=>{if(!navigator.onLine||isDemoMode())return;try{await syncQueuedScreenings(screeningsApi.submit)}catch{}}
    window.addEventListener('online',sync)
    sync()
    return()=>window.removeEventListener('online',sync)
  },[])
  return <AppContext.Provider value={{currentWorker,setCurrentWorker,currentChild,setCurrentChild,screeningResult,setScreeningResult,pendingScreening,setPendingScreening,authReady,demoWorker}}>{children}</AppContext.Provider>
}
export const useApp=()=>{const context=useContext(AppContext);if(!context)throw new Error('useApp must be used inside AppProvider');return context}