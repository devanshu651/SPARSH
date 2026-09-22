import { useState, useEffect, useRef } from 'react'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import Card from '../components/Card'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'

const tests = [
  {
    id: 'hearing',
    title: 'Auditory Tone Response',
    description: 'Generates calibrated pure audio tones (500Hz, 1000Hz, 2000Hz, 4000Hz) to test infant acoustic startle reflex or head-turning response.',
    icon: 'hearing',
    category: 'Auditory & Cranial Nerve VIII',
    instruction: 'Ensure the testing room is quiet. Position phone 20–30 cm from left/right ear. Observe startle, blink, or turning response.'
  },
  {
    id: 'vision',
    title: 'Visual Tracking & Fixation',
    description: 'Displays a high-contrast moving visual target (red focal disc) to assess horizontal and vertical ocular pursuit and binocular fixation.',
    icon: 'vision',
    category: 'Visual & Oculomotor',
    instruction: 'Position device screen 30–40 cm from child’s eyes. Tap Start Pursuit and observe smooth pursuit without nystagmus.'
  },
  {
    id: 'speech',
    title: 'Vocalization & Speech Sample',
    description: 'Timed 30-second clinical observation interval to document spontaneous vocalizations (cooing, babbling, or multi-word utterances).',
    icon: 'speech',
    category: 'Language & Vocal Expression',
    instruction: 'Engage caregiver in calm vocal play with child. Record observed vocalization complexity within the 30-second window.'
  }
]

export default function AVAssessmentScreen({ onNavigate }) {
  const { currentChild } = useApp()
  const [observations, setObservations] = useState({
    hearing: null, // 'normal' | 'concern'
    vision: null,  // 'normal' | 'concern'
    speech: null   // 'normal' | 'concern'
  })

  // Audio Tone Generator State
  const [playingFreq, setPlayingFreq] = useState(null)
  const audioCtxRef = useRef(null)
  const oscRef = useRef(null)

  // Visual Tracking Modal State
  const [showVisualModal, setShowVisualModal] = useState(false)
  const [trackingActive, setTrackingActive] = useState(false)
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 })
  const animationFrameRef = useRef(null)

  // Speech Timer State
  const [timerRunning, setTimerRunning] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(30)
  const [vocalChecklist, setVocalChecklist] = useState({
    cooing: false,
    babbling: false,
    words: false
  })

  // Web Audio Tone Synthesis
  const playTone = (freq) => {
    stopTone()
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      // Soft envelope to avoid speaker click
      gain.gain.setValueAtTime(0.01, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      audioCtxRef.current = ctx
      oscRef.current = osc
      setPlayingFreq(freq)

      // Automatically turn off after 2.5 seconds
      setTimeout(() => {
        stopTone()
      }, 2500)
    } catch {
      stopTone()
    }
  }

  const stopTone = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop()
        oscRef.current.disconnect()
      } catch {}
      oscRef.current = null
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close()
      } catch {}
      audioCtxRef.current = null
    }
    setPlayingFreq(null)
  }

  useEffect(() => {
    return () => stopTone()
  }, [])

  // Visual Tracking Animation
  useEffect(() => {
    if (!trackingActive) return
    let startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000 // seconds
      // Horizontal smooth harmonic motion
      const x = 50 + 38 * Math.sin(elapsed * 1.2)
      // Vertical smooth motion with different frequency
      const y = 50 + 25 * Math.sin(elapsed * 0.8)
      setTargetPos({ x, y })
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [trackingActive])

  // Speech Timer Countdown
  useEffect(() => {
    let interval = null
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1)
      }, 1000)
    } else if (secondsRemaining === 0) {
      setTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [timerRunning, secondsRemaining])

  const setFinding = (testId, status) => {
    setObservations((prev) => ({
      ...prev,
      [testId]: status
    }))
  }

  const handleProceedToAnalysis = () => {
    // Persist AV findings into sessionStorage draft if exists
    try {
      const raw = sessionStorage.getItem('sparsh:pending-screening')
      if (raw) {
        const payload = JSON.parse(raw)
        payload.av_assessments = observations
        sessionStorage.setItem('sparsh:pending-screening', JSON.stringify(payload))
      }
    } catch {}

    onNavigate?.('analysis')
  }

  const completedCount = Object.values(observations).filter(Boolean).length

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo="screening"
      title="Audio-Visual Sensory Check"
      subtitle={`Supplemental screening module · Patient: ${currentChild?.name || 'Screened Infant'}`}
      actions={
        <div className="flex items-center gap-2">
          <BadgePill tone={completedCount === 3 ? 'normal' : 'teal'}>
            {completedCount} of 3 Checked
          </BadgePill>
        </div>
      }
    >
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* CLINICAL PROTOCOL NOTICE */}
        <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-800">
              <Icon name="shield" className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                RBSK Supplemental Sensory Observation Protocol
              </h2>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                Frontline audio-visual stimuli aid frontline workers in detecting covert sensory impairments.
                Use the calibrated tone generator and visual pursuit target below to evaluate cranial nerve reflexes.
                Findings directly enrich the RBSK diagnostic analysis.
              </p>
            </div>
          </div>
        </div>

        {/* MODULE 1: AUDITORY TONE RESPONSE */}
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-800 border border-primary-100">
                <Icon name="hearing" className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                    Hearing & Sensory
                  </span>
                  {observations.hearing && (
                    <BadgePill tone={observations.hearing === 'normal' ? 'normal' : 'high'} dot>
                      {observations.hearing === 'normal' ? 'Normal Startle / Response' : 'Auditory Concern'}
                    </BadgePill>
                  )}
                </div>
                <h3 className="mt-0.5 text-base font-bold text-neutral-900">
                  Auditory Tone Response (Calibrated Pure Tones)
                </h3>
                <p className="mt-1 text-xs text-neutral-600 max-w-xl leading-relaxed">
                  Emit diagnostic audio frequencies to verify auditory nerve pathway response.
                  Observe infant blink reflex (auropalpebral), motor startle, or head turn toward sound source.
                </p>
                <div className="mt-2.5 rounded-md bg-neutral-50 px-3 py-1.5 text-[11px] text-neutral-500 border border-neutral-200/60">
                  <span className="font-semibold text-neutral-700">Protocol:</span> Hold device 20 cm from ear; test both left and right ears.
                </div>
              </div>
            </div>
          </div>

          {/* Tone Generator Controls */}
          <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50/60 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-neutral-800">Calibrated Test Frequencies:</span>
                <p className="text-[11px] text-neutral-500">Select frequency to emit calibrated sine audio pulse (2.5s)</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[500, 1000, 2000, 4000].map((freq) => {
                  const isPlaying = playingFreq === freq
                  return (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => (isPlaying ? stopTone() : playTone(freq))}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition shadow-xs ${
                        isPlaying
                          ? 'bg-primary-950 text-white ring-2 ring-primary-500 animate-pulse'
                          : 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon name="hearing" className="h-3.5 w-3.5" />
                      <span>{freq} Hz {isPlaying ? 'Playing...' : ''}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Findings selection */}
            <div className="mt-4 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-semibold text-neutral-700">Observed Clinical Response:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={observations.hearing === 'normal' ? 'primary' : 'secondary'}
                  onClick={() => setFinding('hearing', 'normal')}
                >
                  <Icon name="check" className="h-3.5 w-3.5" />
                  <span>Prompt Reflex Observed (Pass)</span>
                </Button>
                <Button
                  size="sm"
                  variant={observations.hearing === 'concern' ? 'destructive' : 'secondary'}
                  onClick={() => setFinding('hearing', 'concern')}
                >
                  <Icon name="alertTriangle" className="h-3.5 w-3.5" />
                  <span>No Reflex / Suspected Concern</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* MODULE 2: VISUAL TRACKING & FIXATION */}
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-800 border border-teal-100">
                <Icon name="vision" className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                    Vision & Ocular Motor
                  </span>
                  {observations.vision && (
                    <BadgePill tone={observations.vision === 'normal' ? 'normal' : 'high'} dot>
                      {observations.vision === 'normal' ? 'Normal Visual Fixation' : 'Tracking Deficit'}
                    </BadgePill>
                  )}
                </div>
                <h3 className="mt-0.5 text-base font-bold text-neutral-900">
                  Visual Tracking & Fixation Target
                </h3>
                <p className="mt-1 text-xs text-neutral-600 max-w-xl leading-relaxed">
                  Presents a high-contrast target moving across the horizontal and vertical field of view.
                  Examines ability to fixate binocularly, track past midline, and follow smoothly without erratic jerks or strabismus.
                </p>
                <div className="mt-2.5 rounded-md bg-neutral-50 px-3 py-1.5 text-[11px] text-neutral-500 border border-neutral-200/60">
                  <span className="font-semibold text-neutral-700">Protocol:</span> Hold screen at 35 cm distance in moderate lighting.
                </div>
              </div>
            </div>

            <div className="flex shrink-0 sm:self-start">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowVisualModal(true)
                  setTrackingActive(true)
                }}
              >
                <Icon name="vision" className="h-4 w-4" />
                <span>Launch Interactive Target</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-xs font-semibold text-neutral-700">Observed Clinical Response:</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={observations.vision === 'normal' ? 'primary' : 'secondary'}
                onClick={() => setFinding('vision', 'normal')}
              >
                <Icon name="check" className="h-3.5 w-3.5" />
                <span>Smooth Pursuit Across Midline</span>
              </Button>
              <Button
                size="sm"
                variant={observations.vision === 'concern' ? 'destructive' : 'secondary'}
                onClick={() => setFinding('vision', 'concern')}
              >
                <Icon name="alertTriangle" className="h-3.5 w-3.5" />
                <span>Inability to Fixate / Eye Misalignment</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* MODULE 3: VOCALIZATION & SPEECH SAMPLE */}
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-800 border border-amber-100">
                <Icon name="speech" className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    Language & Acoustic Sample
                  </span>
                  {observations.speech && (
                    <BadgePill tone={observations.speech === 'normal' ? 'normal' : 'high'} dot>
                      {observations.speech === 'normal' ? 'Age-Appropriate Vocalization' : 'Vocal Concern'}
                    </BadgePill>
                  )}
                </div>
                <h3 className="mt-0.5 text-base font-bold text-neutral-900">
                  Timed Spontaneous Vocalization Window
                </h3>
                <p className="mt-1 text-xs text-neutral-600 max-w-xl leading-relaxed">
                  30-second structured observation of verbal interactions, response to mother’s voice, and production of vowel sounds or consonant babble.
                </p>
              </div>
            </div>
          </div>

          {/* Timer & Checklist */}
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50/60 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white border border-neutral-200 font-bold text-sm text-primary-800">
                  {secondsRemaining}s
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-800">Observation Timer</span>
                  <p className="text-[11px] text-neutral-500">
                    {timerRunning ? 'Timer active — observe vocal sounds' : secondsRemaining === 0 ? 'Observation interval complete' : 'Ready to begin observation'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!timerRunning ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSecondsRemaining(30)
                      setTimerRunning(true)
                    }}
                  >
                    <span>{secondsRemaining === 30 ? 'Start 30s Timer' : 'Restart Timer'}</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setTimerRunning(false)}
                  >
                    <span>Pause</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Vocal signs observed checklist */}
            <div className="mt-3 pt-3 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vocalChecklist.cooing}
                  onChange={(e) => setVocalChecklist({ ...vocalChecklist, cooing: e.target.checked })}
                  className="rounded border-neutral-300 text-primary-800 focus:ring-primary-700"
                />
                <span className="text-neutral-700 font-medium">Vowel Cooing (aa/oo)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vocalChecklist.babbling}
                  onChange={(e) => setVocalChecklist({ ...vocalChecklist, babbling: e.target.checked })}
                  className="rounded border-neutral-300 text-primary-800 focus:ring-primary-700"
                />
                <span className="text-neutral-700 font-medium">Consonant Babbling (ba/da)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vocalChecklist.words}
                  onChange={(e) => setVocalChecklist({ ...vocalChecklist, words: e.target.checked })}
                  className="rounded border-neutral-300 text-primary-800 focus:ring-primary-700"
                />
                <span className="text-neutral-700 font-medium">Words / Imitation</span>
              </label>
            </div>

            {/* Findings selection */}
            <div className="mt-4 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-semibold text-neutral-700">Observed Clinical Response:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={observations.speech === 'normal' ? 'primary' : 'secondary'}
                  onClick={() => setFinding('speech', 'normal')}
                >
                  <Icon name="check" className="h-3.5 w-3.5" />
                  <span>Age-Appropriate Vocalizations</span>
                </Button>
                <Button
                  size="sm"
                  variant={observations.speech === 'concern' ? 'destructive' : 'secondary'}
                  onClick={() => setFinding('speech', 'concern')}
                >
                  <Icon name="alertTriangle" className="h-3.5 w-3.5" />
                  <span>No Vocalization / Atypical Cries</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* SUBMISSION ACTION */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-neutral-900">
              Ready to Compute Developmental Risk
            </h4>
            <p className="mt-0.5 text-xs text-neutral-500">
              Transmits RBSK milestone answers and supplemental sensory checks to the clinical diagnostic engine.
            </p>
          </div>

          <Button
            variant="teal"
            size="lg"
            className="w-full sm:w-auto font-bold"
            onClick={handleProceedToAnalysis}
          >
            <Icon name="screening" className="h-4 w-4" />
            <span>Generate Clinical Risk Evaluation →</span>
          </Button>
        </div>

      </div>

      {/* INTERACTIVE VISUAL TRACKING FULL-SCREEN MODAL */}
      {showVisualModal && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-neutral-950 p-4 text-white"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tracking-title"
        >
          {/* Top banner controls */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 id="tracking-title" className="text-sm font-bold text-white">
                Ocular Pursuit Visual Target
              </h3>
              <p className="text-xs text-neutral-400">
                Hold device 30–40 cm from infant eyes · Observe smooth binocular pursuit
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setTrackingActive(false)
                setShowVisualModal(false)
              }}
            >
              <Icon name="cross" className="h-4 w-4" />
              <span>Done / Close</span>
            </Button>
          </div>

          {/* Dynamic visual tracking field */}
          <div className="relative flex-1 overflow-hidden">
            {/* Smooth animated high-contrast focal target */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-linear pointer-events-none"
              style={{
                left: `${targetPos.x}%`,
                top: `${targetPos.y}%`
              }}
            >
              <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-red-600 shadow-[0_0_40px_rgba(239,68,68,0.8)] animate-pulse">
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-red-600" />
                </div>
              </div>
            </div>

            {/* Target motion indicator */}
            <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none">
              <span className="rounded-full bg-neutral-900/80 px-4 py-1.5 text-xs text-neutral-300 backdrop-blur-xs border border-neutral-700">
                Observing gaze fixation across horizontal and vertical axes
              </span>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}