import React from 'react'
import { Button } from '@healthcare/ui'

export const ClaimCard: React.FC<{ claim: any }> = ({ claim }) => {
  return (
    <div style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8, marginBottom: 8 }}>
      <h3 style={{ margin: 0 }}>{claim.claimNumber}</h3>
      <p style={{ margin: '4px 0' }}>{claim.claimant}</p>
      <p style={{ margin: '4px 0', color: '#6b7280' }}>{claim.status}</p>
      <Button onClick={() => alert(`Open claim ${claim.claimNumber}`)}>Open</Button>
    </div>
  )
}

export default ClaimCard
