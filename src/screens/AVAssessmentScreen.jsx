import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function AVAssessmentScreen({ onNavigate }) {
  const { currentChild, pendingScreening, setPendingScreening } = useApp()

  const [hearingResponse, setHearingResponse] = useState(null) // 'responded' | 'no_response' | 'unsure'
  const [visualResponse, setVisualResponse] = useState(null)   // 'responded' | 'no_response' | 'unsure'
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [showVisualTarget, setShowVisualTarget] = useState(false)
  const [audioError, setAudioError] = useState(null)

  const audioCtxRef = useRef(null)

  // Web Audio API tone generator - plays audible tone locally without external files
  const playHearingTone = async () => {
    if (isPlayingAudio) return
    setIsPlayingAudio(true)
    setAudioError(null)

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported in this browser.')
      }

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContextClass()
      }

      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      const now = ctx.currentTime
      const duration = 1.8

      // Pleasant multi-tone chime (C5 -> E5 -> G5)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, now)
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.4)
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.9)
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 1.4)

      // Smooth gain envelope to prevent clicking
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.35, now + 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + duration)

      setTimeout(() => {
        setIsPlayingAudio(false)
      }, duration * 1000 + 100)
    } catch (err) {
      console.error('Audio playback error:', err)
      setAudioError('Unable to play sound. Ensure device audio is unmuted.')
      setIsPlayingAudio(false)
    }
  }

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  const hasConcerningObservation =
    hearingResponse === 'no_response' || visualResponse === 'no_response'

  const handleProceed = () => {
    // Preserve existing pendingScreening payload structure for backend submission
    if (pendingScreening) {
      setPendingScreening({
        ...pendingScreening,
        av_observation: {
          hearing: hearingResponse,
          visual: visualResponse,
          observed_at: new Date().toISOString(),
        },
      })
    }
    onNavigate?.('analysis')
  }

  return (
    <main className="min-h-screen bg-health-gradient px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <header className="mb-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.('screening')}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-lg ring-1 ring-white/20 hover:bg-white/20"
              aria-label="Back to screening"
            >
              ←
            </button>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                SPARSH
              </p>
              <h1 className="text-lg font-extrabold sm:text-xl">
                Audio-Visual Observation
              </h1>
            </div>
          </div>

          {currentChild && (
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              {currentChild.name}
            </span>
          )}
        </header>

        {/* Main Container */}
        <div className="space-y-5">

          {/* Non-Diagnostic Disclaimer Card */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/95 p-4 text-xs leading-relaxed text-amber-950 shadow-sm">
            <div className="flex items-start gap-2.5">
              <span className="text-base">ℹ️</span>
              <div>
                <p className="font-bold text-amber-900">
                  Screening Observation Aid — Not a Diagnostic Test
                </p>
                <p className="mt-0.5 text-amber-800">
                  SPARSH does not diagnose hearing loss, visual impairment, or medical conditions.
                  Use these observation aids to check the child&apos;s immediate behavioral responses during screening.
                </p>
              </div>
            </div>
          </div>

          {/* 1. HEARING OBSERVATION CARD */}
          <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-50 text-xl text-teal-600">
                🔊
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Hearing Observation
                </h2>
                <p className="text-xs text-neutral-500">
                  Play the sound and observe whether the child responds to it.
                </p>
              </div>
            </div>

            {/* Sound Action Area */}
            <div className="mt-5 rounded-2xl bg-teal-50/60 p-4 text-center">
              <p className="mb-3 text-xs font-medium text-teal-900">
                Ensure device volume is turned on. Hold the device near the child.
              </p>

              <button
                type="button"
                onClick={playHearingTone}
                disabled={isPlayingAudio}
                className={`inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-sm font-bold text-white transition shadow-sm ${
                  isPlayingAudio
                    ? 'bg-teal-400 cursor-not-allowed animate-pulse'
                    : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98]'
                }`}
              >
                <span>{isPlayingAudio ? '🔊' : '▶'}</span>
                <span>{isPlayingAudio ? 'Playing Sound…' : 'Play Sound'}</span>
              </button>

              {isPlayingAudio && (
                <div className="mt-3 flex items-center justify-center gap-1">
                  <span className="h-2 w-1 animate-bounce bg-teal-600 rounded-full" style={{ animationDelay: '0ms' }} />
                  <span className="h-3 w-1 animate-bounce bg-teal-600 rounded-full" style={{ animationDelay: '150ms' }} />
                  <span className="h-4 w-1 animate-bounce bg-teal-600 rounded-full" style={{ animationDelay: '300ms' }} />
                  <span className="h-3 w-1 animate-bounce bg-teal-600 rounded-full" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-1 animate-bounce bg-teal-600 rounded-full" style={{ animationDelay: '0ms' }} />
                </div>
              )}

              {audioError && (
                <p className="mt-2 text-xs font-semibold text-red-600">{audioError}</p>
              )}
            </div>

            {/* Hearing Response options */}
            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Child Response to Sound
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setHearingResponse('responded')}
                  className={`min-h-12 rounded-xl border px-2 text-xs font-bold transition ${
                    hearingResponse === 'responded'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-emerald-50'
                  }`}
                >
                  ✓ Responded
                </button>

                <button
                  type="button"
                  onClick={() => setHearingResponse('no_response')}
                  className={`min-h-12 rounded-xl border px-2 text-xs font-bold transition ${
                    hearingResponse === 'no_response'
                      ? 'border-red-600 bg-red-600 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-red-50'
                  }`}
                >
                  ✕ Did not respond
                </button>

                <button
                  type="button"
                  onClick={() => setHearingResponse('unsure')}
                  className={`min-h-12 rounded-xl border px-2 text-xs font-bold transition ${
                    hearingResponse === 'unsure'
                      ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-amber-50'
                  }`}
                >
                  ? Unsure
                </button>
              </div>
            </div>
          </section>

          {/* 2. VISUAL OBSERVATION CARD */}
          <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-purple-50 text-xl text-purple-600">
                👁
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Visual Observation
                </h2>
                <p className="text-xs text-neutral-500">
                  Display high-contrast visual target and observe the child&apos;s response.
                </p>
              </div>
            </div>

            {/* Target Display Toggle / Area */}
            <div className="mt-5">
              {!showVisualTarget ? (
                <div className="rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 p-6 text-center">
                  <p className="text-xs text-purple-900 mb-3">
                    Display a large high-contrast visual target to test eye tracking and focus.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowVisualTarget(true)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 text-xs font-bold text-white transition hover:bg-purple-800 shadow-sm"
                  >
                    <span>👁</span> Show Target
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-purple-200 bg-neutral-900 p-5 text-center shadow-inner">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-purple-300">
                      High-Contrast Tracking Target
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowVisualTarget(false)}
                      className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold text-white hover:bg-white/30"
                    >
                      Hide Target ✕
                    </button>
                  </div>

                  {/* High contrast SVG Target Animation */}
                  <div className="relative mx-auto my-4 flex h-44 w-full max-w-sm items-center justify-center overflow-hidden rounded-xl bg-black">
                    <div className="animate-pulse space-y-2 text-center">
                      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-yellow-400 bg-red-600 shadow-lg transition-transform duration-1000 transform hover:scale-110">
                        <div className="h-16 w-16 rounded-full border-4 border-white bg-yellow-400 flex items-center justify-center">
                          <div className="h-8 w-8 rounded-full bg-black" />
                        </div>
                      </div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-yellow-300">
                        Move device slowly to observe tracking
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300">
                    Observe if the child fixes gaze on the target or follows its movement.
                  </p>
                </div>
              )}
            </div>

            {/* Visual Response options */}
            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Child Response to Visual Target
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setVisualResponse('responded')}
                  className={`min-h-12 rounded-xl border px-2 text-xs font-bold transition ${
                    visualResponse === 'responded'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-emerald-50'
                  }`}
                >
                  ✓ Responded
                </button>

                <button
                  type="button"
                  onClick={() => setVisualResponse('no_response')}
                  className={`min-h-12 rounded-xl border px-2 text-xs font-bold transition ${
                    visualResponse === 'no_response'
                      ? 'border-red-600 bg-red-600 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-red-50'
                  }`}
                >
                  ✕ Did not respond
                </button>

                <button
                  type="button"
                  onClick={() => setVisualResponse('unsure')}
                  className={`min-h-12 rounded-xl border px-2 text-xs font-bold transition ${
                    visualResponse === 'unsure'
                      ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-amber-50'
                  }`}
                >
                  ? Unsure
                </button>
              </div>
            </div>
          </section>

          {/* Concerning Observation Banner */}
          {hasConcerningObservation && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-900 shadow-sm">
              ⚠️ Concerning screening observation — consider further professional evaluation.
            </div>
          )}

          {/* Action / Next Step */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleProceed}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-health-gradient px-5 py-4 text-sm font-extrabold text-white shadow-lg transition hover:opacity-95 active:scale-[0.99]"
            >
              <span>✧ Run rule-based risk analysis →</span>
            </button>
            <p className="mt-2 text-center text-[11px] text-white/70">
              Observation notes are attached to this screening session.
            </p>
          </div>

        </div>

      </div>
    </main>
  )
}