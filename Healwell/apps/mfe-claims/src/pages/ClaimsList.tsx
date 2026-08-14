import React, { useEffect, useState } from 'react'
import { ClaimCard } from '../components/ClaimCard'
import ClaimUpload from '../components/ClaimUpload'

type Claim = { id: string; claimNumber: string; claimant: string; status: string }

export default function ClaimsList() {
  const [claims, setClaims] = useState<Claim[]>([])
  useEffect(() => {
    fetch('/api/claims')
      .then((r) => r.json())
      .then((data) => setClaims(data || []))
      .catch(() => {
        setClaims([
          { id: 'c1', claimNumber: 'CLM-2001', claimant: 'Jane Doe', status: 'Submitted' },
          { id: 'c2', claimNumber: 'CLM-2002', claimant: 'John Smith', status: 'Processing' }
        ])
      })
  }, [])

  return (
    <div>
      <ClaimUpload onUpload={(c) => setClaims((s) => [c, ...s])} />
      <div style={{ marginTop: 12 }}>
        {claims.map((c) => (
          <ClaimCard key={c.id} claim={c} />
        ))}
      </div>
    </div>
  )
}
