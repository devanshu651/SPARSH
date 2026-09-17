import { useEffect, useState } from 'react'

const analysis = {
  childName: 'Priya Sharma',
  age: '2y 4m',
  date: '15 Aug, 2025',
  score: 62,
  risk: 'HIGH RISK',

  domains: [
    { name: 'Gross Motor', score: 72, status: 'Mild Delay', type: 'warning' },
    { name: 'Fine Motor', score: 88, status: 'Normal', type: 'normal' },
    { name: 'Language', score: 51, status: 'At Risk', type: 'danger' },
    { name: 'Social/Emotional', score: 79, status: 'Normal', type: 'normal' },
    { name: 'Hearing', score: 95, status: 'Normal', type: 'normal' },
    { name: 'Vision', score: 68, status: 'Mild Concern', type: 'warning' },
  ],

  recommendations: [
    'Refer to PHC for language therapy evaluation',
    'Schedule follow-up hearing test in 2 weeks',
    'Enroll in Early Stimulation Programme',
    'Counselling session for parents/guardians',
  ],
}

export default function AIRiskAnalysisScreen({ onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!loading) return

    const interval = setInterval(() => {
      setProgress((previous) => {
        if (previous >= 100) {
          clearInterval(interval)
          setTimeout(() => setLoading(false), 400)
          return 100
        }

        return Math.min(previous + 4, 100)
      })
    }, 120)

    return () => clearInterval(interval)
  }, [loading])

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-teal-900 text-neutral-900">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm rounded-[2rem] bg-slate-50 px-6 py-8 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate?.('av-assessment')}
                className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600"
              >
                ←
              </button>

              <h1 className="text-base font-bold">
                AI Risk Analysis
              </h1>
            </div>

            {/* AI animation */}
            <div className="flex flex-col items-center pt-36">
              <div className="relative grid h-32 w-32 place-items-center rounded-full border-2 border-blue-100">
                <div className="absolute inset-4 grid place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-4xl text-white shadow-lg">
                  🧠
                </div>

                <span className="absolute -left-1 top-12 h-2.5 w-2.5 rounded-full bg-violet-400" />
                <span className="absolute right-4 top-2 h-2.5 w-2.5 rounded-full bg-violet-400" />
                <span className="absolute bottom-0 left-7 h-2.5 w-2.5 rounded-full bg-blue-400" />
                <span className="absolute right-[-4px] top-14 h-2.5 w-2.5 rounded-full bg-blue-400" />
              </div>

              <div className="mt-8 w-full">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Analyzing developmental data...</span>
                  <span className="text-blue-600">{progress}%</span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-600 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-6 space-y-2.5">
                  <AnalysisStep
                    done={progress >= 20}
                    text="Loading assessment data"
                  />

                  <AnalysisStep
                    done={progress >= 40}
                    text="Applying WHO benchmarks"
                  />

                  <AnalysisStep
                    done={progress >= 60}
                    text="Running neural analysis"
                    active={progress >= 60 && progress < 80}
                  />

                  <AnalysisStep
                    done={progress >= 80}
                    text="Generating risk score"
                    active={progress >= 80 && progress < 92}
                  />

                  <AnalysisStep
                    done={progress >= 92}
                    text="Preparing recommendations"
                    active={progress >= 92}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-teal-900">
      <div className="mx-auto min-h-screen max-w-md bg-slate-50 px-4 pb-8">
        
        {/* Header */}
        <header className="flex items-center gap-3 py-5">
          <button
            type="button"
            onClick={() => onNavigate?.('av-assessment')}
            className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600"
          >
            ←
          </button>

          <h1 className="text-base font-bold">
            AI Risk Analysis
          </h1>
        </header>

        {/* Risk summary */}
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-4">
            
            {/* Score */}
            <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full border-[7px] border-red-400">
              <div className="text-center">
                <p className="text-xl font-extrabold text-red-500">
                  {analysis.score}
                </p>
                <p className="text-[9px] font-medium text-neutral-400">
                  /100
                </p>
              </div>
            </div>

            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white">
                ⚠ HIGH RISK
              </span>

              <h2 className="mt-1 text-sm font-extrabold">
                {analysis.childName}
              </h2>

              <p className="text-[10px] text-neutral-500">
                Age {analysis.age} · Screened {analysis.date}
              </p>

              <p className="mt-1 text-[10px] font-semibold text-red-500">
                Immediate referral recommended
              </p>
            </div>
          </div>
        </section>

        {/* Domain analysis */}
        <section className="mt-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold">
            Domain-wise Analysis
          </h2>

          <div className="mt-4 space-y-3">
            {analysis.domains.map((domain) => (
              <DomainRow
                key={domain.name}
                {...domain}
              />
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-violet-900">
            🧠 AI Recommendations
          </h2>

          <div className="mt-3 space-y-2.5">
            {analysis.recommendations.map((recommendation, index) => (
              <div
                key={recommendation}
                className="flex items-start gap-2"
              >
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-violet-500 text-[9px] font-bold text-white">
                  {index + 1}
                </span>

                <p className="text-[10px] leading-4 text-violet-900">
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Full report */}
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95"
        >
          ▣ &nbsp; View Full Report
        </button>
      </div>
    </main>
  )
}

function AnalysisStep({ done, active, text }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs transition ${
        done
          ? 'text-neutral-600'
          : active
            ? 'text-blue-600'
            : 'text-neutral-400'
      }`}
    >
      <span
        className={`grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold ${
          done
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-slate-200 text-slate-400'
        }`}
      >
        {done ? '✓' : '•'}
      </span>

      {text}
    </div>
  )
}

function DomainRow({ name, score, status, type }) {
  const styles = {
    normal: {
      bar: 'bg-emerald-500',
      text: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-600',
    },
    warning: {
      bar: 'bg-amber-500',
      text: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-600',
    },
    danger: {
      bar: 'bg-red-500',
      text: 'text-red-500',
      badge: 'bg-red-50 text-red-500',
    },
  }

  const style = styles[type]

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <span className="font-semibold">
          {name}
        </span>

        <div className="flex items-center gap-2">
          <span className={`font-bold ${style.text}`}>
            {score}%
          </span>

          <span className={`rounded-full px-2 py-0.5 text-[8px] font-semibold ${style.badge}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full ${style.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}