import { useState, useEffect, useRef } from 'react'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'
import { useApp } from '../context/AppContext'

export default function AVAssessmentScreen({ onNavigate }) {
  const { currentChild } = useApp()

  // Hearing and Vision observation state only (production contract)
  // Speech observation is not part of the production A/V model
  const [observations, setObservations] = useState({
    hearing: null, // 'normal' | 'concern'
    vision: null   // 'normal' | 'concern'
  })

  // Audio tone generator
  const [playingFreq, setPlayingFreq] = useState(null)
  const audioCtxRef = useRef(null)

  // Visual tracking
  const [showVisualModal, setShowVisualModal] = useState(false)
  const [trackingActive, setTrackingActive] = useState(false)
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 })
  const animationFrameRef = useRef(null)



  const playTone = (freq) => {
    try {
      stopTone()
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return

      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      gain.gain.setValueAtTime(0.01, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      setPlayingFreq(freq)
    } catch (err) {
      console.error('Audio tone error:', err)
    }
  }

  const stopTone = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close()
      } catch {}
      audioCtxRef.current = null
    }
    setPlayingFreq(null)
  }

  useEffect(() => {
    return () => {
      stopTone()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Visual Tracking Animation Loop
  useEffect(() => {
    if (!trackingActive) return

    let startTime = performance.now()
    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000
      // Lissajous curve for natural fluid motion across screen
      const x = 50 + 35 * Math.sin(elapsed * 0.8)
      const y = 50 + 30 * Math.sin(elapsed * 1.3)
      setTargetPos({ x, y })
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [trackingActive])



  const setFinding = (test, status) => {
    setObservations((prev) => ({ ...prev, [test]: status }))
  }

  const hasConcerningObservation =
    observations.hearing === 'concern' ||
    observations.vision === 'concern'

  // Production behavior: navigate directly to analysis without enriching
  // the pending screening payload (device integration is pending / non-clinical)
  const handleProceedToAnalysis = () => {
    onNavigate('analysis')
  }

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo="screening"
      title="Sensory Checks"
      subtitle="Supplemental Audio-Visual and Speech Reflex Testing"
    >
      <div className="relative mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 space-y-6">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Patient header */}
        <div className="flex items-center justify-between rounded-2xl border border-[#E5EBE7] bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDF0EB] text-[#D96B43] font-bold text-sm">
              {currentChild?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1A201E]">{currentChild?.name || 'Child'}</h2>
              <p className="text-xs text-[#5A6660]">
                {currentChild?.age_months ? `${currentChild.age_months} months` : 'Screening in progress'} · Sensory Observation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleProceedToAnalysis}
            className="text-xs font-semibold text-[#1B4D3E] hover:underline"
          >
            Skip to Analysis →
          </button>
        </div>

        {/* Clinical Disclaimer — device integration pending (production behavior) */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs leading-relaxed text-amber-950 shadow-2xs">
          <p className="font-bold text-amber-900">Screening Observation Aid — Non-Diagnostic</p>
          <p className="mt-0.5 text-amber-800">
            <span className="font-semibold">Device integration pending.</span>{' '}
            Hearing and camera capture require validated native-device workflows before clinical use.
            These controls do not generate clinical results.
          </p>
        </div>

        {/* Module 1: Auditory Tone Response */}
        <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                <Icon name="hearing" className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#1A201E]">Auditory Tone Response</h3>
                <p className="text-xs text-[#5A6660]">Emit calibrated audio frequencies (500Hz - 4000Hz)</p>
              </div>
            </div>
            {observations.hearing && (
              <BadgePill tone={observations.hearing === 'normal' ? 'normal' : 'risk'}>
                {observations.hearing === 'normal' ? 'Pass' : 'Concern'}
              </BadgePill>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[500, 1000, 2000, 4000].map((freq) => {
              const isPlaying = playingFreq === freq
              return (
                <button
                  key={freq}
                  type="button"
                  onClick={() => (isPlaying ? stopTone() : playTone(freq))}
                  className={`rounded-xl border p-2.5 text-xs font-semibold transition ${
                    isPlaying
                      ? 'border-[#1B4D3E] bg-[#1B4D3E] text-white shadow-xs'
                      : 'border-[#E5EBE7] bg-white text-[#1A201E] hover:bg-[#F9FBFA]'
                  }`}
                >
                  {freq} Hz {isPlaying ? '🔊' : ''}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F4F2]">
            <Button
              size="sm"
              variant={observations.hearing === 'normal' ? 'primary' : 'outline'}
              onClick={() => setFinding('hearing', 'normal')}
            >
              Pass (Reflex Seen)
            </Button>
            <Button
              size="sm"
              variant={observations.hearing === 'concern' ? 'terracotta' : 'outline'}
              onClick={() => setFinding('hearing', 'concern')}
            >
              No Reflex
            </Button>
          </div>
        </div>

        {/* Module 2: Visual Tracking & Fixation */}
        <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                <Icon name="vision" className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#1A201E]">Visual Tracking & Fixation</h3>
                <p className="text-xs text-[#5A6660]">Assess ocular pursuit across horizontal & vertical field</p>
              </div>
            </div>
            {observations.vision && (
              <BadgePill tone={observations.vision === 'normal' ? 'normal' : 'risk'}>
                {observations.vision === 'normal' ? 'Pass' : 'Concern'}
              </BadgePill>
            )}
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowVisualModal(true)
                setTrackingActive(true)
              }}
              className="w-full"
            >
              Launch Interactive Visual Target
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F4F2]">
            <Button
              size="sm"
              variant={observations.vision === 'normal' ? 'primary' : 'outline'}
              onClick={() => setFinding('vision', 'normal')}
            >
              Smooth Pursuit
            </Button>
            <Button
              size="sm"
              variant={observations.vision === 'concern' ? 'terracotta' : 'outline'}
              onClick={() => setFinding('vision', 'concern')}
            >
              Tracking Deficit
            </Button>
          </div>
        </div>



        {/* Concerning Observation Notice */}
        {hasConcerningObservation && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-900 shadow-2xs">
            ⚠️ Concerning screening observation flagged — these findings will be highlighted in the diagnostic evaluation.
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={handleProceedToAnalysis}
            className="w-full text-sm font-semibold py-3"
          >
            Compute Developmental Analysis →
          </Button>
        </div>
      </div>

      {/* Visual Tracking Modal */}
      {showVisualModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#1A201E] p-4 text-white" role="dialog">
          <div className="flex items-center justify-between pb-3">
            <h3 className="text-sm font-bold">Ocular Pursuit Target</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setTrackingActive(false)
                setShowVisualModal(false)
              }}
            >
              Done / Close
            </Button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
            >
              <div className="h-20 w-20 rounded-full bg-[#D96B43] flex items-center justify-center shadow-lg">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-[#D96B43]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}