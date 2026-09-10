import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...rest }) => {
  const style = {
    padding: '8px 12px',
    borderRadius: 4,
    border: 'none',
    background: variant === 'primary' ? '#1976d2' : '#e0e0e0',
    color: variant === 'primary' ? '#fff' : '#000'
  }
  return (
    <button style={style} {...rest}>
      {children}
    </button>
  )
}

export default Button
