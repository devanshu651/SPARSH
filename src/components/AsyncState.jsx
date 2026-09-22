import Button from './Button'
import Icon from './Icon'

export function LoadingState({ label = 'Loading data…', className = '' }) {
  return (
    <div role="status" className={`flex min-h-48 flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      <p className="mt-3 text-sm font-medium text-neutral-600">{label}</p>
    </div>
  )
}

export function ErrorState({ error, onRetry, className = '' }) {
  const message = error?.message || (typeof error === 'string' ? error : 'An unexpected error occurred.')

  return (
    <div role="alert" className={`rounded-xl border border-red-200 bg-red-50/70 p-6 text-center ${className}`}>
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-700">
        <Icon name="alertTriangle" className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-bold text-red-900">Unable to load data</h3>
      <p className="mt-1 text-xs text-red-700 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <Icon name="refresh" className="h-3.5 w-3.5 mr-1" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}

export function EmptyState({ title, detail, action, icon = 'search', className = '' }) {
  return (
    <div className={`rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center ${className}`}>
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-bold text-neutral-900">{title}</h3>
      {detail && <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">{detail}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}