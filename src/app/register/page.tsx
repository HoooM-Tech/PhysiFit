'use client'

import Header from '@/components/Header'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-primary-dark mb-4">Register for the Event</h1>
        <p className="text-gray-600 mb-8">
          This registration process uses the official event form. Complete the form below, then return here to proceed with payment.
        </p>

        <div className="bg-gray-50 rounded-3xl border border-gray-200 mb-8 w-full overflow-x-auto">
          <iframe
            title="Event Registration Form"
            src="https://docs.google.com/forms/d/e/1FAIpQLSc9uweKQ7X7GtFrN2EnEW_lSl8vhw34le6MSGL2p8J2BW_xrw/viewform?embedded=true"
            className="w-full min-w-[320px] min-h-[900px]"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
          >
            Loading…
          </iframe>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-700 mb-6">
            After submitting the Google Form, continue to payment to complete your registration.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link href="/payment" className="bg-accent hover:bg-accent-dark text-primary-dark px-6 py-3 rounded font-semibold">
              Continue to Payment
            </Link>
            <Link href="/event" className="text-primary-dark hover:underline">
              Back to event
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
