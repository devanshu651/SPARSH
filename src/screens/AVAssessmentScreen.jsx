import { useState } from 'react'

const tests = [
  {
    title: 'Hearing Test',
    description: 'Plays tone at different frequencies. Child should respond.',
    icon: '🔊',
    color: 'teal',
    button: 'Start Hearing Test',
  },
  {
    title: 'Vision Screening',
    description: 'Age-appropriate eye chart assessment for distance vision.',
    icon: '👁',
    color: 'purple',
    button: 'Start Vision Test',
  },
  {
    title: 'Speech Recording',
    description: 'Record child repeating words for AI language analysis.',
    icon: '🎙',
    color: 'red',
    button: 'Start Recording',
  },
]

export default function AVAssessmentScreen({ onNavigate }) {
  const [activeTest, setActiveTest] = useState(null)

  return (
    <main className="min-h-screen bg-health-gradient px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <header className="mb-5 flex items-center gap-4 text-white">
          <button
            onClick={() => onNavigate?.('screening')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-lg ring-1 ring-white/20 hover:bg-white/20"
          >
            ←
          </button>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              SPARSH
            </p>
            <h1 className="text-lg font-bold sm:text-xl">
              Audio-Visual Assessment
            </h1>
          </div>
        </header>

        {/* Main Card */}
        <section className="rounded-[24px] bg-white p-4 shadow-floating sm:p-6">

          {/* AI Information */}
          <div className="mb-5 flex gap-3 rounded-2xl bg-primary-50 p-4 text-sm text-primary-800">
            <span className="text-lg">✧</span>

            <p>
              <span className="font-semibold">
                AI-assisted tests
              </span>{' '}
              use device sensors. Ensure a quiet environment for accurate
              results.
            </p>
          </div>

          {/* Tests */}
          <div className="space-y-4">
            {tests.map((test) => (
              <TestCard
                key={test.title}
                test={test}
                active={activeTest === test.title}
                onStart={() => setActiveTest(test.title)}
              />
            ))}
          </div>

          {/* AI Analysis */}
          <button
           onClick={() => onNavigate?.('ai-analysis')}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-health-gradient px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-95"
          >
            ✧ Run AI Risk Analysis →
          </button>

          {activeTest && (
            <p className="mt-3 text-center text-xs font-medium text-teal-700">
              {activeTest} selected. The test functionality will be connected
              later.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}

function TestCard({ test, active, onStart }) {
  const colors = {
    teal: {
      icon: 'bg-teal-50 text-teal-500',
      box: 'bg-teal-50',
      button:
        'border-teal-200 text-teal-600 hover:bg-teal-50',
    },
    purple: {
      icon: 'bg-purple-50 text-purple-500',
      box: 'bg-purple-50',
      button:
        'border-purple-200 text-purple-600 hover:bg-purple-50',
    },
    red: {
      icon: 'bg-red-50 text-red-500',
      box: 'bg-red-50',
      button:
        'border-red-200 text-red-500 hover:bg-red-50',
    },
  }

  const theme = colors[test.color]

  return (
    <article
      className={`rounded-2xl border bg-white p-4 transition ${
        active
          ? 'border-primary-300 shadow-md'
          : 'border-primary-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${theme.icon}`}
        >
          {test.icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-neutral-900">
            {test.title}
          </h2>

          <p className="mt-1 text-xs leading-4 text-neutral-500">
            {test.description}
          </p>
        </div>
      </div>

      {/* Visual test area */}
      <div
        className={`mt-4 flex h-12 items-center justify-center rounded-xl ${theme.box}`}
      >
        <div className="flex gap-1 opacity-40">
          {Array.from({ length: 24 }).map((_, index) => (
            <span
              key={index}
              className="h-1 w-1 rounded-full bg-current"
            />
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className={`mt-3 w-full rounded-xl border py-2.5 text-sm font-bold transition ${theme.button}`}
      >
        {active ? 'Test Selected' : test.button}
      </button>
    </article>
  )
}