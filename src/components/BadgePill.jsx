const tones = {
  normal: 'bg-[#E8F5EE] text-[#2D7A58] border border-[#C6E7D5]',
  moderate: 'bg-[#FDF0EB] text-[#C85A32] border border-[#F7D4C8]',
  high: 'bg-[#FDE8E8] text-[#D32F2F] border border-[#F8C4C4]',
  info: 'bg-[#EBF2EE] text-[#1B4D3E] border border-[#D5E3DB]',
  teal: 'bg-[#E8F5EE] text-[#1B4D3E] border border-[#C6E7D5]',
  terracotta: 'bg-[#FDF0EB] text-[#C85A32] border border-[#F7D4C8]',
  neutral: 'bg-[#F3F6F4] text-[#5A6660] border border-[#E5EBE7]',
  risk: 'bg-[#FDE8E8] text-[#D32F2F] border border-[#F8C4C4]',
  followup: 'bg-[#FDF0EB] text-[#C85A32] border border-[#F7D4C8]'
}

const dots = {
  normal: 'bg-[#2D7A58]',
  moderate: 'bg-[#D96B43]',
  high: 'bg-[#D32F2F]',
  info: 'bg-[#1B4D3E]',
  teal: 'bg-[#1B4D3E]',
  terracotta: 'bg-[#D96B43]',
  neutral: 'bg-[#8E9C95]',
  risk: 'bg-[#D32F2F]',
  followup: 'bg-[#D96B43]'
}

export default function BadgePill({
  tone = 'normal',
  dot = false,
  className = '',
  children
}) {
  const currentTone = tones[tone] || tones.normal
  const currentDot = dots[tone] || dots.normal

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentTone} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${currentDot}`} aria-hidden="true" />}
      {children}
    </span>
  )
}
