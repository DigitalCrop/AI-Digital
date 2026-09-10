import React from 'react'

export type IconProps = {
  name: 'user' | 'lock' | 'email' | 'search'
  size?: number
  className?: string
}

export const Icon: React.FC<IconProps> = ({ name, size = 16, className }) => {
  const common = { width: size, height: size, className }
  switch (name) {
    case 'user':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5z" />
          <path d="M3 21c0-3 4-5 9-5s9 2 9 5" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    case 'email':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 8l9 6 9-6" />
          <path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
        </svg>
      )
    default:
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}

export default Icon
