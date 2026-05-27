'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Invalid email or password')
      }

      const user = json.data?.user
      const searchParams = new URLSearchParams(window.location.search)
      const redirect = searchParams.get('redirect')
      
      if (redirect) {
        router.push(redirect)
      } else if (user?.role === 'admin') {
        router.push('/admin')
      } else if (user?.role === 'trainer') {
        router.push('/trainer-portal')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-80px)]">
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-center">
          <h2 className="text-4xl font-bold mb-8">Welcome back to PhysiFit NG.</h2>
          <p className="text-blue-200 max-w-md">
            Login to manage your sessions, message your trainer, and continue your progress in one place.
          </p>
        </div>

        <div className="p-6 sm:p-10 md:p-12 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-2 inline-block">
            <div className="w-2 h-1 bg-blue-600 inline-block mr-2"></div>
            <span className="text-gray-600 text-sm">Login to your account</span>
          </div>

          <h1 className="text-4xl font-bold mb-8">Sign in</h1>

          <div className="space-y-6">
            <div>
              <label className="block font-bold mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded text-left">
                <p className="text-red-700 text-sm font-semibold">{error}</p>
              </div>
            )}

            <button
              type="button"
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg font-bold transition ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={handleLogin}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
