'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import SectionHeader from '@/components/SectionHeader'
import Footer from '@/components/Footer'
import DotPattern from '@/components/DotPattern'
import CornerTriangle from '@/components/CornerTriangle'
import Icon from '@/components/Icon'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'

export default function ReservePage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [attendees, setAttendees] = useState(1)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    if (attendees < 1) {
      setError('Number of attendees must be at least 1.')
      return
    }
    setError('')
    router.push(`/payment?email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName)}&attendees=${attendees}`)
  }

  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const inputClass = `p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-accent/40 transition ${
    isDark ? 'bg-slate-950/50 border-white/10 text-white focus:border-accent' : 'bg-white border-gray-300 text-slate-800 focus:border-primary-darker'
  }`

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-primary-darker text-white' : 'bg-white text-gray-800'} flex flex-col`}>
      <Header />

      <main id="main" className="flex-1">
        {/* Back bar */}
        <div className="bg-primary-darker text-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link
              href="/event"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-accent transition uppercase tracking-[0.18em] text-xs font-semibold"
            >
              <Icon name="arrowLeft" size={16} />
              Back to event
            </Link>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <DotPattern className="absolute top-10 right-10 w-40 h-40 text-accent/30 hidden lg:block" />

          <div className="lg:col-span-2">
            <SectionHeader
              eyebrow="EVENT RESERVATION"
              headline="Reserve Your Spot"
              subhead="Quick reservation — we will hold your spot and send payment instructions to your email."
              tone={isDark ? 'dark' : 'light'}
            />

            <form onSubmit={handleReserve} className={`relative mt-12 border rounded-md shadow-sm p-6 sm:p-8 overflow-hidden ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <CornerTriangle corner="br" size={32} color="bg-accent" />

              {error && (
                <div className="mb-4 text-sm font-semibold text-red-600 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="Full name"
                  required
                />
                <input
                  type="number"
                  min="1"
                  value={attendees}
                  onChange={(e) => setAttendees(parseInt(e.target.value) || 1)}
                  className={inputClass}
                  placeholder="Number of attendees"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="Email address"
                  required
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="Phone number"
                  required
                />
              </div>

              <div className="mb-6">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full ${inputClass}`}
                  placeholder="Notes (optional)"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-primary-darker hover:bg-primary-dark text-white px-8 py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition"
                >
                  Reserve Now
                  <Icon name="arrowRight" size={18} />
                </button>
                <Link href="/event" className="text-accent hover:text-accent-dark font-bold uppercase tracking-wider text-xs">
                  Back to event
                </Link>
              </div>
            </form>
          </div>

          {/* Event-summary sidebar (desktop only) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-primary-darker text-white p-7 relative overflow-hidden">
              <CornerTriangle corner="tr" size={32} color="bg-accent" />
              <p className="text-accent text-xs font-bold tracking-[0.25em] uppercase mb-3">EVENT INFO</p>
              <h3 className="font-display text-2xl uppercase tracking-condensed mb-6 leading-tight">
                Move Safer,
                <br />
                <span className="text-accent">Live Stronger</span>
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <Icon name="calendar" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">Saturday, June 27, 2026</span>
                </li>
                <li className="flex gap-3">
                  <Icon name="clock" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">8:00 AM – 10:00 AM</span>
                </li>
                <li className="flex gap-3">
                  <Icon name="mapPin" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">Venue details sent after registration</span>
                </li>
                <li className="flex gap-3">
                  <Icon name="users" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">Older adults & senior wellness enthusiasts</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
