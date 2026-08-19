import { useState } from 'react'

const questions = [
  {
    category: 'Gross Motor Development',
    icon: '〽',
    color: 'blue',
    question: 'Can the child walk steadily?',
  },
  {
    category: 'Fine Motor Development',
    icon: '◎',
    color: 'purple',
    question: 'Can they hold a crayon/pencil?',
  },
  {
    category: 'Language Development',
    icon: '◖',
    color: 'green',
    question: 'Can they say 2–word sentences?',
  },
  {
    category: 'Social/Emotional Development',
    icon: '☺',
    color: 'orange',
    question: 'Do they play alongside other children?',
  },
]

export default function ScreeningScreen({ onNavigate }) {
  const [answers, setAnswers] = useState({})

  const answeredCount = Object.keys(answers).length

  const handleAnswer = (index, answer) => {
    setAnswers((previous) => ({
      ...previous,
      [index]: answer,
    }))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-teal-900 px-4 py-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Top navigation */}
        <header className="mb-5 flex items-center justify-between text-white">
          <button
            type="button"
            onClick={() => onNavigate?.('dashboard')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl ring-1 ring-white/20 transition hover:bg-white/20"
          >
            ←
          </button>

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              SPARSH
            </p>
            <h1 className="text-lg font-bold">Development Screening</h1>
          </div>

          <button
            type="button"
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-blue-800 shadow-lg transition hover:bg-blue-50"
          >
            Next
          </button>
        </header>

        {/* Screening card */}
        <section className="mx-auto max-w-2xl rounded-[28px] bg-white p-4 shadow-2xl sm:p-6">
          {/* Child + progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Priya Sharma
                  <span className="font-medium text-slate-500"> · Age 2y 4m</span>
                </p>
              </div>

              <span className="text-xs font-bold text-blue-700">
                {answeredCount}/12 answered
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-300"
                style={{ width: `${(answeredCount / 12) * 100}%` }}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {questions.map((item, index) => {
              const selected = answers[index]

              return (
                <article
                  key={item.category}
                  className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Category */}
                  <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                        item.color === 'blue'
                          ? 'bg-blue-50 text-blue-600'
                          : item.color === 'purple'
                            ? 'bg-purple-50 text-purple-600'
                            : item.color === 'green'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-orange-50 text-orange-600'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <h2 className="text-sm font-bold text-slate-900">
                      {item.category}
                    </h2>
                  </div>

                  {/* Question */}
                  <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-700">{item.question}</p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAnswer(index, 'yes')}
                        className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                          selected === 'yes'
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        Yes
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAnswer(index, 'no')}
                        className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                          selected === 'no'
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Continue button */}
          <button
            type="button"
            onClick={() => onNavigate?.('av-assessment')}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:from-blue-800 hover:to-teal-700"
          >
            Proceed to A/V Assessment
            <span>→</span>
          </button>
        </section>
      </div>
    </main>
  )
}