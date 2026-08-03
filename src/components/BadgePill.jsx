const tones = {
  normal: 'bg-green-50 text-risk-normal ring-green-100',
  moderate: 'bg-amber-50 text-risk-moderate ring-amber-100',
  high: 'bg-red-50 text-risk-high ring-red-100',
  info: 'bg-primary-50 text-primary-800 ring-primary-100'
}

export default function BadgePill({ tone = 'info', children }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}>{children}</span>
}
