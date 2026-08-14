import React, { useEffect, useState } from 'react'
import { PolicyCard } from '../components/PolicyCard'

type Policy = { id: string; policyNumber: string; holderName: string; status: string }

export default function PoliciesList() {
  const [policies, setPolicies] = useState<Policy[]>([])
  useEffect(() => {
    fetch('/api/policies')
      .then((r) => r.json())
      .then((data) => setPolicies(data || []))
      .catch(() => {
        // fallback sample data for local development when backend is not present
        setPolicies([
          { id: '1', policyNumber: 'POL-1001', holderName: 'Jane Doe', status: 'Active' },
          { id: '2', policyNumber: 'POL-1002', holderName: 'John Smith', status: 'Lapsed' }
        ])
      })
  }, [])

  if (!policies.length) return <p>Loading policies...</p>

  return (
    <div>
      {policies.map((p) => (
        <PolicyCard key={p.id} policy={p} />
      ))}
    </div>
  )
}
