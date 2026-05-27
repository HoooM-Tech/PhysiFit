'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import Image from 'next/image'

export default function EventPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-dark to-primary-darker py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-block bg-accent bg-opacity-20 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-6">
            • PHYSIFIT WELLNESS DAY 2025
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Move Safer,
            <br />
            <span className="text-accent">Live Stronger</span>
          </h1>
          <p className="text-gray-200 text-lg mb-8 max-w-2xl">
            A transformative day wellness experience designed to help older adults improve balance, focus, coordination, mobility, endurance, and confidence in movement.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/register" className="bg-accent hover:bg-accent-dark text-primary-dark px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2">
              ✦ Register for the Event
            </Link>
            <Link
              href="#event-details"
              className="border-2 border-white hover:border-gray-200 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-16">
            <div>
              <p className="text-4xl font-bold text-accent">6+</p>
              <p className="text-gray-300">Wellness Stations</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent">1</p>
              <p className="text-gray-300">Full Experience</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent">100%</p>
              <p className="text-gray-300">Evidence-Based</p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section id="event-details" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-primary-dark mb-8">Event Details</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 text-3xl">📅</div>
                <div>
                  <h3 className="font-semibold text-primary-dark">DATE</h3>
                  <p className="text-gray-600">Saturday, July 12, 2026</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 text-3xl">🕐</div>
                <div>
                  <h3 className="font-semibold text-primary-dark">TIME</h3>
                  <p className="text-gray-600">8:00 AM – 4:00 PM</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 text-3xl">📍</div>
                <div>
                  <h3 className="font-semibold text-primary-dark">VENUE</h3>
                  <p className="text-gray-600">Details sent via email after registration</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 text-3xl">👥</div>
                <div>
                  <h3 className="font-semibold text-primary-dark">FOR</h3>
                  <p className="text-gray-600">Older adults & senior wellness enthusiasts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-dark to-primary-darker rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Reserve Your Spot</h3>
            <Link
              href="/reserve"
              className="block w-full bg-accent hover:bg-accent-dark text-primary-dark py-4 px-6 rounded-md font-semibold transition mb-4 text-center shadow-md"
            >
              Reserve Your Spot →
            </Link>
            <p className="text-gray-300 text-sm">
              Complete registration in just a few steps. Venue details and your access card will be sent to your email after payment.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">OUR MISSION</h3>
              <h2 className="text-4xl font-bold text-primary-dark mb-6">
                Healthy Aging Through Evidence-Based Movement
              </h2>
              <p className="text-gray-600 mb-6">
                Move Safer, Live Stronger brings together carefully curated, evidence-based activities that support healthy aging. Each station is designed to meet seniors where they are — building physical capability, mental sharpness, and social connection in a safe, welcoming environment.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary-dark to-primary-darker rounded-lg p-8">
              <div className="inline-block bg-accent text-primary-dark px-4 py-2 rounded-full text-sm font-semibold mb-6">
                WELLNESS PILLARS
              </div>
              <h3 className="text-3xl font-bold text-white mb-8">
                Six Dimensions of Senior Wellness
              </h3>
              <p className="text-gray-200 mb-8">
                Every activity station addresses one or more critical dimensions of healthy aging, proven effective through clinical research.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-primary-darker bg-opacity-50 border border-accent border-opacity-30 rounded-lg p-4">
                  <span className="text-accent">●</span>
                  <p className="text-white font-semibold">Balance & Stability</p>
                </div>
                <div className="bg-primary-darker bg-opacity-50 border border-accent border-opacity-30 rounded-lg p-4">
                  <span className="text-accent">●</span>
                  <p className="text-white font-semibold">Cognitive Focus</p>
                </div>
                <div className="bg-primary-darker bg-opacity-50 border border-accent border-opacity-30 rounded-lg p-4">
                  <span className="text-accent">●</span>
                  <p className="text-white font-semibold">Coordination</p>
                </div>
                <div className="bg-primary-darker bg-opacity-50 border border-accent border-opacity-30 rounded-lg p-4">
                  <span className="text-accent">●</span>
                  <p className="text-white font-semibold">Mobility</p>
                </div>
                <div className="bg-primary-darker bg-opacity-50 border border-accent border-opacity-30 rounded-lg p-4">
                  <span className="text-accent">●</span>
                  <p className="text-white font-semibold">Endurance</p>
                </div>
                <div className="bg-primary-darker bg-opacity-50 border border-accent border-opacity-30 rounded-lg p-4">
                  <span className="text-accent">●</span>
                  <p className="text-white font-semibold">Confidence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wellness Stations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">WHAT'S INCLUDED</h3>
            <h2 className="text-4xl font-bold text-primary-dark mb-4">
              Wellness Activity Stations
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each station is expertly facilitated by certified wellness professionals and tailored to varying ability levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Balance Training */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="text-5xl mb-4">⚖️</div>
              <h3 className="text-2xl font-bold text-primary-dark mb-4">Balance Training</h3>
              <p className="text-gray-600 mb-4">
                Gentle, guided exercises to improve postural stability and reduce fall risk through proven techniques.
              </p>
              <span className="inline-block bg-accent bg-opacity-10 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                PHYSICAL
              </span>
            </div>

            {/* Cognitive Focus */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold text-primary-dark mb-4">Cognitive Focus</h3>
              <p className="text-gray-600 mb-4">
                Mental agility games and exercises designed to sharpen focus, memory, and reaction time.
              </p>
              <span className="inline-block bg-accent bg-opacity-10 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                MENTAL
              </span>
            </div>

            {/* Coordination Flow */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="text-5xl mb-4">🤸</div>
              <h3 className="text-2xl font-bold text-primary-dark mb-4">Coordination Flow</h3>
              <p className="text-gray-600 mb-4">
                Rhythmic movement sequences that enhance hand-eye coordination and body awareness.
              </p>
              <span className="inline-block bg-accent bg-opacity-10 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                PHYSICAL
              </span>
            </div>

            {/* Mobility & Flexibility */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="text-5xl mb-4">🧘</div>
              <h3 className="text-2xl font-bold text-primary-dark mb-4">Mobility & Flexibility</h3>
              <p className="text-gray-600 mb-4">
                Gentle stretching and joint mobility work to maintain and improve range of motion.
              </p>
              <span className="inline-block bg-accent bg-opacity-10 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                PHYSICAL
              </span>
            </div>

            {/* Endurance Building */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-2xl font-bold text-primary-dark mb-4">Endurance Building</h3>
              <p className="text-gray-600 mb-4">
                Low-impact cardiovascular activities that safely build stamina and energy levels.
              </p>
              <span className="inline-block bg-accent bg-opacity-10 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                PHYSICAL
              </span>
            </div>

            {/* Social Wellness */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="text-5xl mb-4">👫</div>
              <h3 className="text-2xl font-bold text-primary-dark mb-4">Social Wellness</h3>
              <p className="text-gray-600 mb-4">
                Guided social activities that build community connections and emotional wellbeing.
              </p>
              <span className="inline-block bg-accent bg-opacity-10 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                SOCIAL
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">YOUR JOURNEY</h3>
            <h2 className="text-4xl font-bold text-primary-dark mb-4">
              How the Day Unfolds
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-dark text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark mb-2">Register Online</h3>
                <p className="text-gray-600">
                  Complete the simple registration form with your name, age, email, and phone. Takes under 2 minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-dark text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark mb-2">Secure Your Spot</h3>
                <p className="text-gray-600">
                  Complete your payment through our secure gateway. Your registration is confirmed instantly.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-dark text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark mb-2">Receive Access Pass</h3>
                <p className="text-gray-600">
                  Your digital access card with venue details, event time, and unique ID is sent directly to your email.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-dark text-white font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark mb-2">Experience the Day</h3>
                <p className="text-gray-600">
                  Arrive with confidence, explore all wellness stations, and connect with a vibrant community of active seniors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-dark to-primary-darker py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Secure Your Spot Today
          </h2>
          <p className="text-gray-200 mb-8">
            Complete your registration in just a few steps. Venue details and your access card will be sent to your email after payment.
          </p>
          <Link
            href="/register"
            className="inline-block bg-accent hover:bg-accent-dark text-primary-dark px-10 py-4 rounded-md font-semibold transition text-lg shadow-md"
          >
            Register Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4">
              <Image
                src="/images/logo.png"
                alt="PhysiFit NG Logo"
                width={150}
                height={40}
                className="object-contain h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-300 mb-2">Active lifestyle, healthy lifetime.</p>
            <p className="text-gray-400 text-sm">
              Empowering older adults through evidence-based wellness.
            </p>
          </div>

          <div>
            <h3 className="text-accent font-semibold mb-4 uppercase">EVENT</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="#" className="hover:text-white transition">
                  About the Event
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Activities
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-accent font-semibold mb-4 uppercase">CONTACT</h3>
            <ul className="space-y-2 text-gray-300">
              <li>info@physifit.co</li>
              <li>+234 805 755 7588</li>
              <li>Lagos, Nigeria</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
