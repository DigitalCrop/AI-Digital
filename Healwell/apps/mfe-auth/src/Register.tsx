import React, { useState } from 'react'
import { useAuth } from '@healthcare/auth'

export default function Register() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ email, password, firstName, lastName })
      alert('Registration successful. Please check your email for verification (dev).')
    } catch (err: any) {
      alert(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h3>Register</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div>
          <label>Last name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </div>
      </form>
    </div>
  )
}
