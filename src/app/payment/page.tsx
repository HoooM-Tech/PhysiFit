'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col animate-pulse">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Loading secure checkout...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}

function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const eventRegistrationId = searchParams.get('eventRegistrationId')
  
  // Dynamic payment details
  const [email, setEmail] = useState('')
  const [amountNaira, setAmountNaira] = useState(15000) // Default ₦15,000 if generic event
  const [description, setDescription] = useState('Event Spot Reservation')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true)
      try {
        // 1. If we have a booking ID, fetch the booking details
        if (bookingId) {
          const res = await fetch(`/api/bookings/${bookingId}`)
          if (res.ok) {
            const json = await res.json()
            const booking = json.data?.booking
            if (booking) {
              setAmountNaira(booking.totalAmountNaira)
              setDescription(`${booking.serviceName} Session Booking`)
            }
          }
        }
        
        // 2. Fetch logged in user email if authenticated
        const userRes = await fetch('/api/users/me')
        if (userRes.ok) {
          const userJson = await userRes.json()
          if (userJson.data?.user?.email) {
            setEmail(userJson.data.user.email)
          }
        }
      } catch (err) {
        console.error('Error fetching details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [bookingId])

  const handlePaySecurely = () => {
    if (!email) {
      setError('Please provide a valid email address for receipt.')
      return
    }
    setError('')
    setPaying(true)

    try {
      const transactionRef = 'pay_' + Math.random().toString(36).substring(2, 15) + Date.now();
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_03b79b66317c1b3573e6e746245b654b14a4d88f',
        email: email,
        amount: amountNaira * 100, // Paystack requires amount in kobo
        currency: 'NGN',
        ref: transactionRef,
        callback: async function (response: { reference: string }) {
          // Paystack callback on success
          try {
            const paymentPayload = {
              bookingId: bookingId || undefined,
              eventRegistrationId: eventRegistrationId || undefined,
              provider: 'paystack' as const,
              providerRef: response.reference,
            }

            const apiRes = await fetch('/api/payments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': crypto.randomUUID(),
              },
              body: JSON.stringify(paymentPayload),
            })

            const apiJson = await apiRes.json()
            if (!apiRes.ok) {
              throw new Error(apiJson.error?.message || apiJson.message || 'Failed to record payment')
            }

            setConfirmed(true)
          } catch (err: any) {
            setError(err.message || 'Failed to confirm payment on server. Please contact support.')
          } finally {
            setPaying(false)
          }
        },
        onClose: function () {
          setPaying(false)
        },
      })
      handler.openIframe()
    } catch (err) {
      setError('Failed to load payment checkout. Please refresh and try again.')
      setPaying(false)
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <span className="text-4xl text-green-600">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark mb-4">Payment Pending Confirmation</h1>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Thank you! Your payment transaction of <strong>₦{amountNaira.toLocaleString()}</strong> has been initiated securely via Paystack.
            Once confirmed by the provider webhook, your booking status will automatically flip to active.
          </p>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition">
            Go to Dashboard
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold text-primary-dark mb-2">Secure Checkout</h1>
        <p className="text-gray-600 mb-8">Card details never touch our servers and are processed securely via Paystack.</p>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Loading checkout details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-gray-800 pb-4 border-b">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Description</span>
                  <span className="font-semibold text-gray-900">{description}</span>
                </div>
                {bookingId && (
                  <div className="flex justify-between text-gray-600">
                    <span>Booking ID</span>
                    <span className="text-xs bg-gray-100 px-2.5 py-1 rounded text-gray-800 font-mono">{bookingId}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Currency</span>
                  <span className="font-semibold text-gray-900">NGN (₦)</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₦{amountNaira.toLocaleString()}</span>
                </div>
              </div>

              {/* Email Address collection if not logged in */}
              {!email && (
                <div className="mb-6">
                  <label className="block font-bold mb-2 text-sm text-gray-700">Billing Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for payment receipt"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded text-left">
                  <p className="text-red-700 text-sm font-semibold">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handlePaySecurely}
                  disabled={paying}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-full font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {paying ? (
                    <>
                      <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Connecting to Paystack...</span>
                    </>
                  ) : (
                    <>
                      <span>🔒 Pay Securely with Paystack</span>
                    </>
                  )}
                </button>
                <div className="text-center">
                  <span className="text-xs text-gray-500">PCI-DSS Compliant • SSL Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
