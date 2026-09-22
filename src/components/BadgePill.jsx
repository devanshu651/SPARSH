const tones = {
  normal: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  moderate: 'bg-amber-50 text-amber-800 border border-amber-200',
  high: 'bg-red-50 text-red-800 border border-red-200',
  info: 'bg-primary-50 text-primary-800 border border-primary-200',
  teal: 'bg-teal-50 text-teal-800 border border-teal-200',
  neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200'
}

const dots = {
  normal: 'bg-emerald-500',
  moderate: 'bg-amber-500',
  high: 'bg-red-500',
  info: 'bg-primary-500',
  teal: 'bg-teal-500',
  neutral: 'bg-neutral-400'
}

export default function BadgePill({
  tone = 'info',
  dot = false,
  className = '',
  children
}) {
  const currentTone = tones[tone] || tones.info
  const currentDot = dots[tone] || dots.info

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentTone} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${currentDot}`} aria-hidden="true" />}
      {children}
    </span>
  )
}
