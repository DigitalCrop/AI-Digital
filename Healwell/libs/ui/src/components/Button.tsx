import React from 'react'
import './button.css'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...rest }) => {
  const cls = `hw-btn hw-btn-${variant}` + (className ? ` ${className}` : '')
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}

export default Button
