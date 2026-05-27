'use client'

import Header from '@/components/Header'
import Link from 'next/link'

export default function ReservePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-primary-dark mb-4">Reserve Your Spot</h1>
        <p className="text-gray-600 mb-8">Quick reservation — we will hold your spot and send payment instructions to your email.</p>

        <form className="bg-gray-50 p-6 sm:p-8 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input className="p-3 rounded border border-gray-200" placeholder="Full name" />
            <input className="p-3 rounded border border-gray-200" placeholder="Number of attendees" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input className="p-3 rounded border border-gray-200" placeholder="Email address" />
            <input className="p-3 rounded border border-gray-200" placeholder="Phone number" />
          </div>

          <div className="mb-4">
            <textarea className="w-full p-3 rounded border border-gray-200" placeholder="Notes (optional)" rows={3} />
          </div>

          <div className="flex gap-4 items-center">
            <Link href="/payment" className="bg-primary-dark hover:bg-primary-darker text-white px-6 py-3 rounded font-semibold">Reserve Now</Link>
            <Link href="/event" className="text-primary-dark hover:underline">Back to event</Link>
          </div>
        </form>
      </main>
    </div>
  )
}
