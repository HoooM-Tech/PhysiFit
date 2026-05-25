'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState } from 'react'

export default function PaymentPage() {
  const [confirmed, setConfirmed] = useState(false)
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })

  const handlePay = () => {
    // placeholder: in real app submit to payment API
    setConfirmed(true)
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark mb-4">Payment Confirmed</h1>
          <p className="text-gray-600 mb-8">Thank you — we have received your payment. Venue details will be emailed to you shortly.</p>
          <Link href="/event" className="bg-accent hover:bg-accent-dark text-primary-dark px-6 py-3 rounded font-semibold">Back to event</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold text-primary-dark mb-4">Payment</h1>
        <p className="text-gray-600 mb-8">Enter your card details to complete the reservation.</p>

        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <div className="mb-6">
            <label className="block font-bold mb-2">Card Number</label>
            <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="1234 5678 9012 3456" className="w-full border border-gray-300 rounded-lg p-3" />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block font-bold mb-2">Expiry</label>
              <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" className="w-full border border-gray-300 rounded-lg p-3" />
            </div>
            <div>
              <label className="block font-bold mb-2">CVV</label>
              <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="•••" className="w-full border border-gray-300 rounded-lg p-3" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-bold mb-2">Cardholder Name</label>
            <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Full name" className="w-full border border-gray-300 rounded-lg p-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/event" className="border border-gray-300 rounded-lg py-3 text-center">← Back</Link>
            <button onClick={handlePay} className="bg-primary-dark hover:bg-primary-darker text-white py-3 rounded-lg font-semibold">Pay Now</button>
          </div>
        </div>
      </main>
    </div>
  )
}
