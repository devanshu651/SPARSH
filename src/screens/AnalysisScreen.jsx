import { useEffect, useRef, useState } from 'react'
import { screeningsApi } from '../services/api'
import { enqueueScreening } from '../services/offline'
import { useApp } from '../context/AppContext'
import { ErrorState } from '../components/AsyncState'
import Button from '../components/Button'

export default function AnalysisScreen({onNavigate}) {
  const {setScreeningResult}=useApp();const [error,setError]=useState(null);const [step,setStep]=useState(0);const submitting=useRef(false)
  const run=async()=>{if(submitting.current)return;setError(null);const raw=sessionStorage.getItem('sparsh:pending-screening');if(!raw){setError(new Error('No completed screening was found.'));return}const payload=JSON.parse(raw);submitting.current=true;try{setStep(1);await new Promise(r=>setTimeout(r,350));setStep(2);const result=await screeningsApi.submit(payload);setStep(3);setScreeningResult(result);sessionStorage.removeItem('sparsh:pending-screening');onNavigate('report')}catch(e){if(!navigator.onLine){enqueueScreening(payload);sessionStorage.removeItem('sparsh:pending-screening');setError(new Error('You are offline. This screening was queued safely and will sync when connected.'))}else setError(e)}finally{submitting.current=false}}
  useEffect(()=>{run()},[])
  if(error)return <main className="grid min-h-screen place-items-center p-5"><div className="max-w-md"><ErrorState error={error} onRetry={run}/><Button className="mt-4 w-full" onClick={()=>onNavigate('dashboard')}>Return to dashboard</Button></div></main>
  const labels=['Preparing screening responses','Sending secure assessment','Applying rule-based risk analysis','Opening report']
  return <main className="grid min-h-screen place-items-center bg-primary-950 p-6 text-center text-white"><div><div className="mx-auto h-16 w-16 animate-pulse rounded-full border-4 border-teal-300 border-t-transparent"/><h1 className="mt-6 text-2xl font-extrabold">Developmental Risk Analysis</h1><div className="mt-6 space-y-3 text-left">{labels.map((x,i)=><p key={x} className={i<=step?'text-white':'text-white/40'}>{i<step?'✓':i===step?'●':'○'} {x}</p>)}</div></div></main>
}
