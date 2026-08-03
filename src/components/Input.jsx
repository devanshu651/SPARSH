export default function Input({ label, id, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</span>}
      <input id={id} className={`min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-700 focus:ring-2 focus:ring-primary-100 ${error ? 'border-risk-high' : 'border-neutral-200'}`} {...props} />
      {error && <span className="mt-1.5 block text-xs text-risk-high">{error}</span>}
    </label>
  )
}
