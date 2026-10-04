export function SparshBotanicalCorner({
  position = 'top-right',
  variant,
  className = '',
  opacity = 'opacity-25'
}) {
  return (
    <SparshBotanical
      variant={variant || position}
      className={className}
      opacity={opacity}
    />
  )
}

export function SparshBotanical({
  variant = 'top-right',
  position,
  className = '',
  opacity = 'opacity-25'
}) {
  const chosen = variant || position || 'top-right'

  if (chosen === 'top-right') {
    return (
      <div
        className={`pointer-events-none absolute -top-4 -right-4 z-0 ${opacity} ${className}`}
        aria-hidden="true"
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 130 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main sage leaf */}
          <path
            d="M130 0C100 10 70 35 60 70C90 75 120 50 130 0Z"
            fill="#729082"
          />
          {/* Secondary sage leaf */}
          <path
            d="M110 0C90 25 85 45 95 65C115 50 125 30 110 0Z"
            fill="#8FA89B"
          />
          {/* Stem curve */}
          <path
            d="M130 0C110 30 90 60 55 85"
            stroke="#52796F"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Terracotta fruit accent */}
          <circle cx="70" cy="50" r="3.5" fill="#D96B43" />
        </svg>
      </div>
    )
  }

  if (chosen === 'top-left') {
    return (
      <div
        className={`pointer-events-none absolute -top-4 -left-4 z-0 ${opacity} ${className}`}
        aria-hidden="true"
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0C30 10 60 35 70 70C40 75 10 50 0 0Z"
            fill="#729082"
          />
          <path
            d="M20 0C40 25 45 45 35 65C15 50 5 30 20 0Z"
            fill="#8FA89B"
          />
          <circle cx="50" cy="50" r="3" fill="#D96B43" />
        </svg>
      </div>
    )
  }

  if (chosen === 'bottom-right') {
    return (
      <div
        className={`pointer-events-none absolute -bottom-4 -right-4 z-0 ${opacity} ${className}`}
        aria-hidden="true"
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 130 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M130 130C100 120 70 95 60 60C90 55 120 80 130 130Z"
            fill="#729082"
          />
          <path
            d="M110 130C90 105 85 85 95 65C115 80 125 100 110 130Z"
            fill="#8FA89B"
          />
          <circle cx="70" cy="80" r="3" fill="#D96B43" />
        </svg>
      </div>
    )
  }

  if (chosen === 'bottom-left') {
    return (
      <div
        className={`pointer-events-none absolute -bottom-4 -left-4 z-0 ${opacity} ${className}`}
        aria-hidden="true"
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 120C30 110 60 85 70 50C40 45 10 70 0 120Z"
            fill="#729082"
          />
          <path
            d="M20 120C40 95 45 75 35 55C15 70 5 90 20 120Z"
            fill="#8FA89B"
          />
          <circle cx="50" cy="70" r="3" fill="#D96B43" />
        </svg>
      </div>
    )
  }

  return null
}

export default SparshBotanical
