import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './index'

export const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
