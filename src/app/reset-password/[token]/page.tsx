'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams() as { token?: string }
  const token = params?.token ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error?.message || j.message || 'Reset failed')
      router.push('/login')
    } catch (err: any) {
      setError(err.message || 'Error resetting password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Set a new password</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" className="w-full border rounded-md p-3 mb-3" minLength={8} required />
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full border rounded-md p-3 mb-3" minLength={8} required />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <button type="submit" disabled={loading} className="w-full bg-primary-darker text-white py-3 rounded-md">{loading ? 'Saving...' : 'Set password'}</button>
      </form>
      <p className="mt-4 text-sm">Back to <Link href="/login" className="text-accent">Sign in</Link></p>
    </div>
  )
}
