'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceNairaPerSession: number;
}

export default function BookSession() {
  const router = useRouter()
  const [step, setStep] = useState<'service' | 'terms' | 'payment_loading' | 'confirmed'>('service')
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Booking options
  const [sessionType, setSessionType] = useState<'one_on_one' | 'group'>('one_on_one')
  const [sessionsCount, setSessionsCount] = useState<4 | 6 | 8 | 12>(8)
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    today.setDate(today.getDate() + 3) // Default to 3 days from now
    return today.toISOString().split('T')[0]
  })
  const [timeSlot, setTimeSlot] = useState<'morning' | 'midday' | 'afternoon' | 'evening'>('afternoon')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Fetch services
        const svcRes = await fetch('/api/services')
        if (svcRes.ok) {
          const json = await svcRes.json()
          const fetchedServices = json.data?.services || []
          setServices(fetchedServices)
          if (fetchedServices.length > 0) {
            // Prefer Senior Fitness, else first available
            const defaultSvc = fetchedServices.find((s: Service) => s.slug === 'senior-fitness') || fetchedServices[0]
            setSelectedService(defaultSvc)
          }
        }

        // Fetch current user email
        const userRes = await fetch('/api/users/me')
        if (userRes.ok) {
          const userJson = await userRes.json()
          if (userJson.data?.user?.email) {
            setEmail(userJson.data.user.email)
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic details:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const pricePerSession = selectedService?.priceNairaPerSession ?? 33333
  const totalPrice = sessionsCount * pricePerSession

  const getServiceIcon = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('postpartum')) return '👶'
    if (n.includes('senior')) return '😊'
    return '🏢'
  }

  const handleProceedToPayment = async () => {
    if (!selectedService) return
    setError('')
    setStep('payment_loading')

    let bookingId = ''
    try {
      // 1. Create the pending booking record
      const bookingPayload = {
        serviceId: selectedService.id,
        sessionType,
        sessionCount: sessionsCount,
        startDate,
        preferredTimeSlots: [timeSlot],
        termsAccepted: true,
      }

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify(bookingPayload),
      })

      const bookingJson = await bookingRes.json()
      if (!bookingRes.ok) {
        throw new Error(bookingJson.error?.message || bookingJson.message || 'Failed to create booking')
      }

      const booking = bookingJson.data?.booking
      if (!booking?.id) {
        throw new Error('Booking response was missing the reference ID')
      }
      bookingId = booking.id

      // 2. Launch the Paystack checkout inline popup
      const transactionRef = 'pay_' + Math.random().toString(36).substring(2, 15) + Date.now();
      const popup = new window.PaystackPop();
      popup.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: email || 'client@physifit.co',
        amount: totalPrice * 100, // in kobo
        currency: 'NGN',
        ref: transactionRef,
        onSuccess: async function (response: { reference: string }) {
          try {
            // 3. Register payment intent
            const paymentRes = await fetch('/api/payments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': crypto.randomUUID(),
              },
              body: JSON.stringify({
                bookingId: bookingId,
                provider: 'paystack',
                providerRef: response.reference,
              }),
            })

            const paymentJson = await paymentRes.json()
            if (!paymentRes.ok) {
              throw new Error(paymentJson.error?.message || paymentJson.message || 'Failed to submit payment')
            }

            setStep('confirmed')
          } catch (err: any) {
            setError(err.message || 'An issue occurred recording the payment. Please contact support.')
            setStep('service')
          }
        },
        onCancel: function () {
          setStep('terms')
        },
        onClose: function () {
          setStep('terms')
        },
      })
    } catch (err: any) {
      setError(err.message || 'An unexpected issue occurred. Please retry shortly.')
      setStep('service')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Script src="https://js.paystack.co/v2/inline.js" strategy="afterInteractive" />

      {/* Back bar */}
      <div className="bg-primary-darker text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-accent transition uppercase tracking-[0.18em] text-xs font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="inline-flex items-center gap-3 mb-4">
          <span aria-hidden="true" className="h-[2px] w-10 bg-accent" />
          <span className="text-accent text-xs font-bold tracking-[0.25em] uppercase">BOOKING</span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl uppercase tracking-condensed leading-none text-primary-darker mb-3">Book a Session</h1>
        <p className="text-gray-600">Select your service and configure your training plan.</p>
      </div>

      {loading ? (
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-darker border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Retrieving PhysiFit programs...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="max-w-4xl mx-auto px-6 mb-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-left">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            </div>
          )}

          {step === 'service' && (
            <div className="max-w-4xl mx-auto px-6 py-4">
              {/* Service Selection */}
              <div className="mb-12">
                <h2 className="font-display text-2xl uppercase tracking-wide mb-6 text-primary-darker pb-2 border-b border-gray-200">1. Choose Your Service</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`p-6 rounded-md border-2 cursor-pointer transition ${
                        selectedService?.id === service.id
                          ? 'border-primary-darker bg-accent/10 shadow-sm'
                          : 'border-gray-200 hover:border-primary-darker/40'
                      }`}
                    >
                      <div className="text-4xl mb-4">
                        {getServiceIcon(service.name)}
                      </div>
                      <h3 className="font-display text-xl uppercase tracking-wide mb-2 text-primary-darker">{service.name}</h3>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Type */}
              <div className="mb-12">
                <h2 className="font-display text-2xl uppercase tracking-wide mb-6 text-primary-darker pb-2 border-b border-gray-200">2. Session Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    onClick={() => setSessionType('one_on_one')}
                    className={`p-6 rounded-md border-2 cursor-pointer transition ${
                      sessionType === 'one_on_one'
                        ? 'border-primary-darker bg-accent/10 shadow-sm'
                        : 'border-gray-200 hover:border-primary-darker/40'
                    }`}
                  >
                    <h3 className="font-display text-xl uppercase tracking-wide mb-2 text-primary-darker">One-on-One</h3>
                    <p className="text-gray-600 text-sm">Personal, focused training with your dedicated trainer</p>
                  </div>
                  <div
                    onClick={() => setSessionType('group')}
                    className={`p-6 rounded-md border-2 cursor-pointer transition ${
                      sessionType === 'group'
                        ? 'border-primary-darker bg-accent/10 shadow-sm'
                        : 'border-gray-200 hover:border-primary-darker/40'
                    }`}
                  >
                    <h3 className="font-display text-xl uppercase tracking-wide mb-2 text-primary-darker">Group Session</h3>
                    <p className="text-gray-600 text-sm">Train with others — cost shared among participants</p>
                  </div>
                </div>
              </div>

              {/* Additional Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block font-bold mb-2 text-gray-700 text-sm">Number of Sessions</label>
                  <select
                    value={sessionsCount}
                    onChange={(e) => setSessionsCount(Number(e.target.value) as any)}
                    className="w-full border border-gray-300 rounded-md p-3 bg-white focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                  >
                    {[4, 6, 8, 12].map((num) => (
                      <option key={num} value={num}>
                        {num} sessions
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-2 text-gray-700 text-sm">Preferred Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 bg-white focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                  />
                </div>
              </div>

              <div className="mb-12">
                <label className="block font-bold mb-2 text-gray-700 text-sm">Preferred Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md p-3 bg-white focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                >
                  <option value="morning">Morning (6:00 AM – 9:00 AM)</option>
                  <option value="midday">Midday (12:00 PM – 2:00 PM)</option>
                  <option value="afternoon">Afternoon (3:00 PM – 6:00 PM)</option>
                  <option value="evening">Evening (6:00 PM – 8:00 PM)</option>
                </select>
              </div>

              {/* Session Summary */}
              <div className="bg-gray-50 rounded-md p-8 mb-12 border border-gray-200">
                <h3 className="font-display text-2xl uppercase tracking-wide mb-6 text-primary-darker">Session Summary</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Service</span>
                    <span className="font-bold text-gray-900">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Session type</span>
                    <span className="font-bold text-gray-900">{sessionType === 'one_on_one' ? 'One-on-One' : 'Group Session'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Sessions</span>
                    <span className="font-bold text-gray-900">{sessionsCount} sessions</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Per session</span>
                    <span className="font-bold text-accent">₦{pricePerSession.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-accent">₦{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('terms')}
                  className="w-full bg-primary-darker hover:bg-primary-dark text-white py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition shadow-md"
                >
                  Continue to Terms →
                </button>
              </div>
            </div>
          )}

          {step === 'terms' && (
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="mb-12">
                <div className="inline-flex items-center gap-3 mb-4">
                  <span aria-hidden="true" className="h-[2px] w-10 bg-accent" />
                  <span className="text-accent text-xs font-bold tracking-[0.25em] uppercase">FINAL STEP</span>
                </div>
                <h2 className="font-display text-4xl uppercase tracking-condensed mb-2 text-primary-darker leading-none">Terms & Conditions</h2>
                <p className="text-gray-600 mb-8">Please read carefully before proceeding</p>

                <div className="bg-gray-50 rounded-md p-8 mb-8 space-y-4 border border-gray-200">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">• Session Policy:</h3>
                    <p className="text-gray-600">
                      Sessions are primarily one-on-one unless you specifically selected a group session.
                    </p>
                    <p className="text-gray-600">
                      Trainers will be matched to clients within 24-48 hours after booking a session.
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
                  <label htmlFor="agree" className="text-gray-900 font-semibold cursor-pointer">
                    I have read, understood, and agree to the above Terms & Conditions.
                  </label>
                </div>

                {!termsAgreed && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
                    <p className="text-red-700 font-semibold">⚠️ Please agree to the Terms & Conditions before proceeding.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setStep('service')}
                    className="border-2 border-gray-300 hover:border-primary-darker text-primary-darker py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition"
                  >
                    ← Back
                  </button>
                  <button
                    disabled={!termsAgreed}
                    onClick={handleProceedToPayment}
                    className={`py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition shadow-md ${
                      termsAgreed
                        ? 'bg-primary-darker hover:bg-primary-dark text-white hover:shadow'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Proceed to Payment →
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'payment_loading' && (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center">
              <div className="animate-spin inline-block w-12 h-12 border-4 border-primary-darker border-t-transparent rounded-full mb-6"></div>
              <h2 className="font-display text-3xl uppercase tracking-condensed text-primary-darker mb-3">Connecting to Secure Payment...</h2>
              <p className="text-gray-600">Please complete the payment in the secure Paystack popup overlay.</p>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl text-green-600">✓</span>
                </div>
              </div>

              <h2 className="font-display text-5xl uppercase tracking-condensed leading-none mb-5 text-primary-darker">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-2">Your payment of <strong>₦{totalPrice.toLocaleString()}</strong> has been initiated securely.</p>
              <p className="text-gray-600 mb-12">{sessionsCount} {selectedService?.name} sessions have been booked.</p>

              <div className="bg-accent/10 border-l-4 border-accent p-4 mb-12 text-left rounded shadow-sm">
                <p className="flex items-start gap-3">
                  <span className="text-2xl">🔔</span>
                  <span className="text-gray-700">
                    A trainer will be assigned to you within 24–48 hours. Once matched, your program will show up active in your profile!
                  </span>
                </p>
              </div>

              <Link
                href="/dashboard"
                className="bg-primary-darker hover:bg-primary-dark text-white px-10 py-4 rounded-md font-bold uppercase tracking-wider text-sm transition inline-block shadow-md"
              >
                Go to Dashboard →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
