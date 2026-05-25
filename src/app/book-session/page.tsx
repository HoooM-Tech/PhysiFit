'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState } from 'react'

export default function BookSession() {
  const [step, setStep] = useState<'service' | 'payment' | 'terms' | 'confirmed'>('service')
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [formData, setFormData] = useState({
    service: 'Senior Fitness',
    sessionType: 'One-on-One',
    sessions: 8,
    startDate: '02/10/2025',
    timeSlot: 'Afternoon (3:00 PM – 6:00 PM)',
    cardNumber: '1234 5678 9012 3456',
    expiryDate: 'MM/YY',
    cvv: '',
    cardholderName: 'Amaka Okonkwo',
  })

  const pricePerSession = 15000
  const totalPrice = formData.sessions * pricePerSession

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold my-6">Book a Session</h1>
        <p className="text-gray-600">Select your service and configure your training plan.</p>
      </div>

      {step === 'service' && (
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Service Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">1. CHOOSE YOUR SERVICE</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Postpartum Fitness', 'Senior Fitness', 'Corporate Wellness'].map((service) => (
                <div
                  key={service}
                  onClick={() => setFormData({ ...formData, service })}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition ${
                    formData.service === service
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-4">
                    {service === 'Postpartum Fitness'
                      ? '👶'
                      : service === 'Senior Fitness'
                      ? '😊'
                      : '🏢'}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{service}</h3>
                  <p className="text-gray-600 text-sm">
                    {service === 'Postpartum Fitness'
                      ? 'Safe recovery programs for new mothers'
                      : service === 'Senior Fitness'
                      ? 'Low-impact mobility & strength for seniors'
                      : 'Group programs for workplace teams'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Session Type */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">2. SESSION TYPE</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['One-on-One', 'Group Session'].map((type) => (
                <div
                  key={type}
                  onClick={() => setFormData({ ...formData, sessionType: type })}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition ${
                    formData.sessionType === type
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">{type}</h3>
                  <p className="text-gray-600 text-sm">
                    {type === 'One-on-One'
                      ? 'Personal, focused training with your dedicated trainer'
                      : 'Train with others — cost shared among participants'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div>
              <label className="block font-bold mb-2">Number of Sessions</label>
              <select
                value={formData.sessions}
                onChange={(e) => setFormData({ ...formData, sessions: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                {[4, 6, 8, 12].map((num) => (
                  <option key={num} value={num}>
                    {num} sessions
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Preferred Start Date</label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                placeholder="MM/DD/YYYY"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>
          </div>

          <div className="mb-12">
            <label className="block font-bold mb-2">Preferred Time Slot</label>
            <select
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3"
            >
              <option>Morning (6:00 AM – 9:00 AM)</option>
              <option>Midday (12:00 PM – 2:00 PM)</option>
              <option>Afternoon (3:00 PM – 6:00 PM)</option>
              <option>Evening (6:00 PM – 8:00 PM)</option>
            </select>
          </div>

          {/* Session Summary */}
          <div className="bg-gray-50 rounded-lg p-8 mb-12">
            <h3 className="text-2xl font-bold mb-6">Session Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Service</span>
                <span className="font-bold">{formData.service}</span>
              </div>
              <div className="flex justify-between">
                <span>Session type</span>
                <span className="font-bold">{formData.sessionType}</span>
              </div>
              <div className="flex justify-between">
                <span>Sessions</span>
                <span className="font-bold">{formData.sessions} sessions</span>
              </div>
              <div className="flex justify-between">
                <span>Per session</span>
                <span className="font-bold text-blue-600">₦{pricePerSession.toLocaleString()}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setStep('terms')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold transition"
            >
              Continue to Terms →
            </button>
          </div>
        </div>
      )}

      {step === 'terms' && (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">TERMS & CONDITIONS</h2>
            <p className="text-gray-600 mb-8">Please read carefully before proceeding</p>

            <div className="bg-gray-50 rounded-lg p-8 mb-8 space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">• Session Policy:</h3>
                <p className="text-gray-600">
                  Sessions are primarily one-on-one unless you specifically selected a group session.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">• Physical Assessment:</h3>
                <p className="text-gray-600">
                  Your first session will always be a Physical Assessment Session. Your trainer will evaluate your fitness level and create your personalized plan.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">• Rescheduling:</h3>
                <p className="text-gray-600">
                  You may reschedule a session, but must give at least 24 hours' notice before the scheduled time.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">• Missed Sessions:</h3>
                <p className="text-gray-600">
                  Sessions missed without 24-hour notice are automatically logged as completed and deducted from your total. No refunds or replacements.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">• Communication:</h3>
                <p className="text-gray-600">
                  All communication with your trainer must happen within the PhysiFit NG platform. No external contact is permitted.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <input
                type="checkbox"
                id="agree"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="agree" className="text-gray-900">
                I have read, understood, and agree to the above Terms & Conditions.
              </label>
            </div>

            {!termsAgreed && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
                <p className="text-red-700 font-semibold">⚠️ Please agree to the Terms & Conditions before proceeding.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setStep('service')}
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-900 py-3 rounded-full font-bold transition"
              >
                ← Back
              </button>
              <button
                disabled={!termsAgreed}
                onClick={() => setStep('payment')}
                className={`py-3 rounded-full font-bold transition ${
                  termsAgreed
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                Proceed to Payment →
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-8">PAYMENT DETAILS</h2>

          {/* Payment Form */}
          <div className="space-y-6 mb-12">
            <div>
              <label className="block font-bold mb-2">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-bold mb-2">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full border border-gray-300 rounded-lg p-3"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">CVV</label>
                <input
                  type="text"
                  placeholder="•••"
                  className="w-full border border-gray-300 rounded-lg p-3"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2">Cardholder Name</label>
              <input
                type="text"
                placeholder="Amaka Okonkwo"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>{formData.sessions} sessions ({formData.service}, 1-on-1)</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="border-t pt-4 flex justify-between text-2xl font-bold">
              <span>Total Charge</span>
              <span className="text-blue-600">₦{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setTermsAgreed(false)
                setStep('terms')
              }}
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-900 py-3 rounded-full font-bold transition"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep('confirmed')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold transition"
            >
              Pay ₦{totalPrice.toLocaleString()} →
            </button>
          </div>
        </div>
      )}

      {step === 'confirmed' && (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✓</span>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-2">Your payment of ₦{totalPrice.toLocaleString()} was successful.</p>
          <p className="text-gray-600 mb-12">{formData.sessions} {formData.service} sessions have been booked.</p>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-12 text-left">
            <p className="flex items-start gap-3">
              <span className="text-2xl">🔔</span>
              <span>
                A trainer will be assigned to you within 24–48 hours. You'll receive a push notification as soon as they're matched to your profile.
              </span>
            </p>
          </div>

          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition inline-block"
          >
            Go to Dashboard →
          </Link>
        </div>
      )}
    </div>
  )
}
