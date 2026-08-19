import BottomNav from '../components/BottomNav'

const notifications = [
  {
    title: 'Urgent: Priya Sharma needs referral',
    time: '10 min ago',
    type: 'urgent',
    unread: true,
    icon: '⚠',
  },
  {
    title: 'AI detected 3 new at-risk patterns in Ward 4',
    time: '1 hour ago',
    type: 'ai',
    unread: true,
    icon: '✣',
  },
  {
    title: 'Scheduled screening: 8 children today',
    time: 'Today, 9:00 AM',
    type: 'schedule',
    unread: true,
    icon: '□',
  },
  {
    title: 'Referral accepted: Rohan Patil at PHC',
    time: 'Yesterday',
    type: 'success',
    unread: false,
    icon: '✓',
  },
  {
    title: 'Monthly report ready for download',
    time: 'Yesterday',
    type: 'report',
    unread: false,
    icon: '↗',
  },
  {
    title: 'Screening target achieved: 85/80 this month!',
    time: '2 days ago',
    type: 'target',
    unread: false,
    icon: '♙',
  },
  {
    title: 'App update available: v2.5.0',
    time: '3 days ago',
    type: 'info',
    unread: false,
    icon: 'ⓘ',
  },
]

const styles = {
  urgent: {
    border: 'border-red-400',
    icon: 'bg-red-50 text-red-500',
    dot: 'bg-red-500',
  },
  ai: {
    border: 'border-violet-500',
    icon: 'bg-violet-50 text-violet-500',
    dot: 'bg-violet-500',
  },
  schedule: {
    border: 'border-blue-500',
    icon: 'bg-blue-50 text-blue-500',
    dot: 'bg-blue-500',
  },
  success: {
    border: 'border-transparent',
    icon: 'bg-emerald-50 text-emerald-500',
    dot: '',
  },
  report: {
    border: 'border-transparent',
    icon: 'bg-teal-50 text-teal-500',
    dot: '',
  },
  target: {
    border: 'border-transparent',
    icon: 'bg-amber-50 text-amber-500',
    dot: '',
  },
  info: {
    border: 'border-transparent',
    icon: 'bg-slate-50 text-slate-500',
    dot: '',
  },
}

export default function AlertsScreen({ onNavigate }) {
  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length

  return (
    <main className="min-h-screen bg-neutral-50 pb-24 lg:pb-8">
      {/* Header */}
      <header className="bg-health-gradient text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.('dashboard')}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-lg ring-1 ring-white/25"
              aria-label="Go back"
            >
              ←
            </button>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                SPARSH
              </p>

              <h1 className="text-xl font-bold">
                Notifications
              </h1>
            </div>
          </div>

          <button
            type="button"
            className="text-xs font-semibold text-white/90 hover:text-white"
          >
            Mark all read
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 pt-5 lg:px-8 lg:pt-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />

          <p className="text-sm font-bold text-neutral-800">
            {unreadCount} unread notifications
          </p>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => {
            const style = styles[notification.type]

            return (
              <NotificationCard
                key={notification.title}
                notification={notification}
                style={style}
              />
            )
          })}
        </div>
      </div>

      <BottomNav
        active="alerts"
        onChange={onNavigate}
      />
    </main>
  )
}

function NotificationCard({ notification, style }) {
  return (
    <button
      type="button"
      className={`group relative flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md ${style.border}`}
    >
      {/* Icon */}
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-bold ${style.icon}`}
      >
        {notification.icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-5 text-neutral-900">
          {notification.title}
        </p>

        <p className="mt-0.5 text-xs font-medium text-neutral-400">
          {notification.time}
        </p>
      </div>

      {/* Unread indicator */}
      {notification.unread && (
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
          aria-label="Unread"
        />
      )}
    </button>
  )
}