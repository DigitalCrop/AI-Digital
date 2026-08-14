import React from 'react'
import { Button } from '@healthcare/ui'

export const PolicyCard: React.FC<{ policy: any }> = ({ policy }) => {
  return (
    <div style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8, marginBottom: 8 }}>
      <h3 style={{ margin: 0 }}>{policy.policyNumber}</h3>
      <p style={{ margin: '4px 0' }}>{policy.holderName}</p>
      <p style={{ margin: '4px 0', color: '#6b7280' }}>{policy.status}</p>
      <Button onClick={() => alert(`Viewing ${policy.policyNumber}`)}>View</Button>
    </div>
  )
}

export default PolicyCard
