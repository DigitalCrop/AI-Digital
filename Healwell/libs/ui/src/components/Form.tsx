import React from 'react'

export type FormProps = React.FormHTMLAttributes<HTMLFormElement> & {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}

export const Form: React.FC<FormProps> = ({ children, onSubmit, ...rest }) => {
  const handle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit?.(e)
  }
  return (
    <form onSubmit={handle} {...rest}>
      {children}
    </form>
  )
}

export default Form
