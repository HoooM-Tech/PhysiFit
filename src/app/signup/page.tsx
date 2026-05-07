'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const router = useRouter()
  const [step, setStep] = useState<'personal' | 'health' | 'confirm'>('personal')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    weight: 65,
    bmi: 24.5,
    height: 165,
    dizziness: 'No',
    medicalConditions: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [consent, setConsent] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const passwordsMatch = formData.password === formData.confirmPassword
  const canContinue = consent && formData.password && formData.confirmPassword && passwordsMatch
  const canCreateAccount = termsAgreed

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-80px)]">
        {/* Left Side - Branding */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-8">
            "The journey of a thousand miles begins with a single step — and the right support."
          </h2>
          <p className="text-blue-200">— PhysiFit NG Philosophy</p>
        </div>

        {/* Right Side - Form */}
        <div className="p-12 flex flex-col justify-center max-w-md mx-auto w-full">
          {step === 'personal' && (
            <>
              <div className="mb-2 inline-block">
                <div className="w-2 h-1 bg-blue-600 inline-block mr-2"></div>
                <span className="text-gray-600 text-sm">Step 1 of 3 — Personal Information</span>
              </div>

              <h1 className="text-4xl font-bold mb-8">Create your account</h1>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Amaka"
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Okonkwo"
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="amaka@email.com"
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-bold mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Create a strong password"
                        className="w-full border border-gray-300 rounded-lg p-3 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Re-enter your password"
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    I consent to PhysiFit NG contacting me about my sessions, health progress, and platform updates.
                  </label>
                </div>

                {!passwordsMatch && formData.confirmPassword ? (
                  <p className="text-sm text-red-600">Passwords do not match. Please confirm your password.</p>
                ) : null}

                <button
                  disabled={!canContinue}
                  onClick={() => setStep('health')}
                  className={`w-full py-3 rounded-lg font-bold transition ${
                    canContinue
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {step === 'health' && (
            <>
              <div className="mb-2 inline-block">
                <div className="w-2 h-1 bg-blue-600 inline-block mr-2"></div>
                <span className="text-gray-600 text-sm">Step 2 of 3 — Required for safe training</span>
              </div>

              <h1 className="text-4xl font-bold mb-8">Health Information</h1>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-blue-600 mb-4">PHYSICAL MEASUREMENTS</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg p-3"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-2">BMI</label>
                      <input
                        type="number"
                        value={formData.bmi}
                        onChange={(e) => setFormData({ ...formData, bmi: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg p-3"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block font-bold mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-blue-600 mb-4">HEALTH CONDITIONS</h3>
                  <div>
                    <label className="block font-bold mb-2">Do you experience dizziness or light-headedness?</label>
                    <select
                      value={formData.dizziness}
                      onChange={(e) => setFormData({ ...formData, dizziness: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    >
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block font-bold mb-2">Any existing medical conditions?</label>
                    <textarea
                      value={formData.medicalConditions}
                      onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                      placeholder="e.g. hypertension, diabetes, joint issues — or 'None'"
                      className="w-full border border-gray-300 rounded-lg p-3 h-24"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('personal')}
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-900 py-3 rounded-lg font-bold transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="mb-2 inline-block">
                <div className="w-2 h-1 bg-blue-600 inline-block mr-2"></div>
                <span className="text-gray-600 text-sm">Step 3 of 3 — Review & Confirm</span>
              </div>

              <h1 className="text-4xl font-bold mb-8">You're all set!</h1>

              <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
                <h3 className="font-bold mb-6">Account Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name</span>
                    <span className="font-bold">
                      {formData.firstName} {formData.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-bold">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-bold">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Health data</span>
                    <span className="font-bold text-green-600">✓ Completed</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-bold text-blue-900 mb-3">Terms & Conditions</h3>
                  <div className="max-h-64 overflow-y-auto text-sm text-gray-700 mb-4 space-y-3">
                    <p><strong>Session Cancellation & Rescheduling:</strong> Sessions must be cancelled or rescheduled at least 24 hours in advance. Cancellations made within 24 hours will be charged as a full session fee.</p>
                    <p><strong>Health & Safety:</strong> You agree to provide accurate health information. PhysiFit NG is not responsible for injuries resulting from undisclosed medical conditions or failure to follow trainer guidance.</p>
                    <p><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your password and account information. All activities under your account are your responsibility.</p>
                    <p><strong>Payment & Billing:</strong> You authorize PhysiFit NG to charge your payment method for all sessions and services as agreed.</p>
                    <p><strong>Liability Waiver:</strong> By creating this account, you acknowledge the physical risks associated with fitness training and assume full responsibility for your health and safety.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agree-terms"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="w-4 h-4 mt-1"
                    />
                    <label htmlFor="agree-terms" className="text-sm text-gray-700">
                      I have read and agree to the Terms & Conditions, session policies, and rescheduling rules above.
                    </label>
                  </div>
                </div>

              </div>

              <button
                disabled={!canCreateAccount}
                onClick={() => {
                  // In a real app, this would call an API to create the account
                  // For now, we'll redirect to dashboard
                  router.push('/dashboard')
                }}
                className={`w-full py-3 rounded-lg font-bold transition mb-4 ${
                  canCreateAccount
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                Create Account & Continue
              </button>

              <button
                onClick={() => setStep('health')}
                className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-900 py-3 rounded-lg font-bold transition"
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
