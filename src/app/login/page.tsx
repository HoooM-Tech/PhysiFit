'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import DotPattern from '@/components/DotPattern'
import CornerTriangle from '@/components/CornerTriangle'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
      } else if (user?.role === 'admin' || user?.role === 'super_admin') {
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-2 flex-1">
        <div className="relative hidden md:flex bg-gradient-to-br from-primary-dark to-primary-darker text-white p-12 flex-col justify-center overflow-hidden">
          <CornerTriangle corner="tr" size={56} color="bg-accent" />
          <CornerTriangle corner="bl" size={40} color="bg-accent" />
          <DotPattern className="absolute bottom-10 right-10 w-44 h-44 text-accent/30" />
          <div className="relative max-w-md">
            <div className="inline-flex items-center gap-3 mb-6">
              <span aria-hidden="true" className="h-[2px] w-10 bg-accent" />
              <span className="text-accent text-xs font-bold tracking-[0.25em] uppercase">SIGN IN</span>
            </div>
            <h2 className="font-display text-5xl sm:text-6xl uppercase tracking-condensed leading-[0.95] mb-8">
              Welcome back to <span className="text-accent">PhysiFit NG.</span>
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Login to manage your sessions, message your trainer, and continue your progress in one place.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10 md:p-12 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-3 inline-flex items-center">
            <span aria-hidden="true" className="w-3 h-[3px] bg-accent inline-block mr-3" />
            <span className="text-gray-600 text-xs uppercase tracking-[0.2em] font-semibold">Login to your account</span>
          </div>

          <h1 className="font-display text-5xl uppercase tracking-condensed leading-none text-primary-darker mb-10">Sign in</h1>

          <div className="space-y-6">
            <div>
              <label className="block font-bold mb-2 uppercase text-xs tracking-wider text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase text-xs tracking-wider text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-md p-3 pr-12 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-darker"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3 3m-3-3-3.671-3.671m0-3.671a3 3 0 0 0-3.671 3.671m-.339.339 3.671-3.671" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded text-left" role="alert">
                <p className="text-red-700 text-sm font-semibold">{error}</p>
              </div>
            )}
            <div className="text-right">
              <a href="/forgot-password" className="text-sm text-accent hover:underline">Forgot password?</a>
            </div>

            <button
              type="button"
              disabled={loading}
              className={`w-full text-white py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition ${
                loading ? 'bg-primary-darker/60 cursor-not-allowed' : 'bg-primary-darker hover:bg-primary-dark'
              }`}
              onClick={handleLogin}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-accent hover:text-accent-dark font-bold uppercase tracking-wider text-xs">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
