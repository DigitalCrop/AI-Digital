import React from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export const Input: React.FC<InputProps> = ({ label, id, ...rest }) => {
  const inputId = id || Math.random().toString(36).slice(2, 9)
  return (
    <label className="hw-input-label" htmlFor={inputId}>
      {label ? <span className="hw-input-title">{label}</span> : null}
      <input id={inputId} className="hw-input" {...rest} />
    </label>
  )
}

export default Input
