const variants = {
  primary: 'bg-health-gradient text-white shadow-floating hover:brightness-110 focus:ring-primary-700',
  secondary: 'bg-white text-primary-800 ring-1 ring-inset ring-primary-100 hover:bg-primary-50 focus:ring-primary-700',
  danger: 'bg-risk-high text-white shadow-md hover:bg-red-700 focus:ring-red-700'
}

export default function Button({ variant = 'primary', className = '', type = 'button', children, ...props }) {
  return (
    <button type={type} className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
