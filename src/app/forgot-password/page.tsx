'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error?.message || j.message || 'Request failed')
      setMessage('If an account exists, a reset link has been sent to that email.')
    } catch (err: any) {
      setError(err.message || 'Error requesting password reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Forgot your password?</h1>
      <p className="text-sm text-gray-600 mb-6">Enter your account email and we'll send a reset link.</p>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="w-full border rounded-md p-3 mb-3" required />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {message && <div className="text-green-600 mb-2">{message}</div>}
        <button type="submit" disabled={loading} className="w-full bg-primary-darker text-white py-3 rounded-md">{loading ? 'Sending...' : 'Send reset link'}</button>
      </form>
      <p className="mt-4 text-sm">Back to <Link href="/login" className="text-accent">Sign in</Link></p>
    </div>
  )
}
