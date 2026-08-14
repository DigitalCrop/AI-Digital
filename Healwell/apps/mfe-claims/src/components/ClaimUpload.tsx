import React, { useState } from 'react'
import { Button, Input } from '@healthcare/ui'

export default function ClaimUpload({ onUpload }: { onUpload?: (c: any) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return alert('Select a file')
    const fakeClaim = { id: Math.random().toString(36).slice(2, 8), claimNumber: `CLM-${Math.floor(Math.random() * 10000)}`, claimant: title || 'Unknown', status: 'Submitted' }
    onUpload?.(fakeClaim)
    setTitle('')
    setFile(null)
    alert('Uploaded (simulated)')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Input label="Claim Title" value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} />
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button type="submit">Upload</Button>
    </form>
  )
}
