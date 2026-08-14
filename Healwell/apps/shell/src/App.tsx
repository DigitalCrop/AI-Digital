import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

const Home = React.lazy(() => import('./pages/Home'))
const RemoteLogin = React.lazy(() => import('mfe_auth/Login'))
const RemoteRegister = React.lazy(() => import('mfe_auth/Register'))
const RemotePolicies = React.lazy(() => import('mfe_policies/Policies'))
const RemoteClaims = React.lazy(() => import('mfe_claims/Claims'))

export default function App() {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Home</Link> | <Link to="/policies">Policies</Link> | <Link to="/claims">Claims</Link> | <Link to="/login">Login</Link>
        </nav>
      </header>
      <main>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<RemoteLogin />} />
            <Route path="/register" element={<RemoteRegister />} />
            <Route path="/policies" element={<RemotePolicies />} />
            <Route path="/claims" element={<RemoteClaims />} />
          </Routes>
        </React.Suspense>
      </main>
      <footer>© Healwell</footer>
    </div>
  )
}
