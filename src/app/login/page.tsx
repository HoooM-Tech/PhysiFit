'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-80px)]">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex flex-col justify-center">
          <div className="mb-12">
            <div className="w-24 h-32 bg-pink-400 rounded-2xl mb-8"></div>
          </div>
          <h2 className="text-4xl font-bold mb-8">Welcome back to PhysiFit NG.</h2>
          <p className="text-blue-200 max-w-md">
            Login to manage your sessions, message your trainer, and continue your progress in one place.
          </p>
        </div>

        <div className="p-12 flex flex-col justify-center max-w-md mx-auto w-full">
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

            <button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
              onClick={() => {
                // Placeholder login action
                window.location.href = '/dashboard'
              }}
            >
              Login
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
