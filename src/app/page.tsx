'use client'

import Header from '@/components/Header'
import Link from 'next/link'
 import Image from 'next/image'
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="mb-6 inline-block bg-accent bg-opacity-10 text-accent px-4 py-2 rounded-full text-sm font-semibold">
            • Specialized Fitness Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Fitness designed for <span className="text-primary-dark">your</span> journey
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            PhysiFit NG offers personalized, structured training for seniors, postpartum women, and corporate teams — with dedicated trainers and full progress tracking.
          </p>
          <div className="flex gap-4">
            <Link
              href="/book-session"
              className="bg-primary-dark hover:bg-primary-darker text-white px-8 py-3 rounded-full font-semibold transition"
            >
              Book a Session
            </Link>
            <Link
              href="/signup"
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-900 px-8 py-3 rounded-full font-semibold transition"
            >
              Create Account
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-12 mt-16">
            <div>
              <p className="text-4xl font-bold">500+</p>
              <p className="text-gray-600">Active Clients</p>
            </div>
            <div>
              <p className="text-4xl font-bold">98%</p>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-4xl font-bold">3</p>
              <p className="text-gray-600">Specializations</p>
            </div>
          </div>
        </div>

         {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden h-72 sm:h-96 md:h-[28rem] lg:h-[32rem]">
          <Image
            src="/images/hero-section-1.jpg"
            alt="Fitness class in progress"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-accent font-semibold mb-2">OUR SERVICES</p>
            <h2 className="text-5xl font-bold mb-4">
              Fitness for every <span className="italic text-accent">life stage</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Specialized programs built around your unique needs, delivered by certified trainers who understand your body and goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Senior Fitness */}
            <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48 w-full">
                 <Image
                  src="/images/senior-fitness.jpg"
                  alt="Senior fitness class"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Senior Fitness</h3>
                <p className="text-gray-600 mb-6">
                  Low-impact, mobility-focused programs designed specifically for older adults to maintain strength, balance, and independence.
                </p>
                <Link href="/book-session" className="text-primary-dark hover:text-primary-darker font-semibold">
                  Explore Program →
                </Link>
              </div>
            </div>

            {/* Postpartum Fitness */}
            <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48 w-full">
                <Image
                  src="/images/postpartum-fitness-1.jpg"
                  alt="postpartum fitness class"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Postpartum Fitness</h3>
                <p className="text-gray-600 mb-6">
                  Safe, evidence-based recovery programs helping new mothers regain strength, core stability, and overall wellbeing.
                </p>
                <Link href="/book-session" className="text-primary-dark hover:text-primary-darker font-semibold">
                  Explore Program →
                </Link>
              </div>
            </div>

            {/* Corporate Wellness */}
            <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48 w-full">
                <Image
                  src="/images/cooperate-wellness.jpg"
                  alt="Corporate wellness class"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Corporate Wellness</h3>
                <p className="text-gray-600 mb-6">
                  Group wellness programs for teams — improving productivity, reducing burnout, and building a healthier workplace culture.
                </p>
                <Link href="/book-session" className="text-primary-dark hover:text-primary-darker font-semibold">
                  Explore Program →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-accent font-semibold mb-2">PROCESS</p>
            <h2 className="text-5xl font-bold">How PhysiFit NG works</h2>
            <p className="text-gray-400 mt-4">From sign-up to your first session in four simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 text-primary-dark">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">Create Account</h3>
              <p className="text-gray-400">
                Register with your basic info and complete a short health questionnaire so we understand your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 text-primary-dark">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">Book Sessions</h3>
              <p className="text-gray-400">
                Choose your service, session type, preferred dates, and the number of sessions you need.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 text-primary-dark">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">Trainer Assigned</h3>
              <p className="text-gray-400">
                A certified trainer is matched and assigned to you within 24–48 hours. You'll get a push notification as soon as they're matched to your profile.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 text-primary-dark">
                4
              </div>
              <h3 className="text-2xl font-bold mb-3">Train & Progress</h3>
              <p className="text-gray-400">
                Complete your assessment, follow your personalized plan, and track every session in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-accent font-semibold mb-2">TESTIMONIALS</p>
            <h2 className="text-5xl font-bold">What our clients say</h2>
            <p className="text-gray-600 text-lg mt-4">
              Real stories from people who've transformed their health with PhysiFit NG.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-orange-400">★</span>
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "I've enjoyed excellent service so far. The trainer is professional and knows his beans. 100% recommend."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-400 rounded-full"></div>
                <div>
                  <p className="font-bold">Pamilerinayo Ige.</p>
                  <p className="text-gray-600 text-sm">Postpartum Client · Lagos</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-orange-400">★</span>
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "A well equipped fitness center, attention to details and result driven coach."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full"></div>
                <div>
                  <p className="font-bold">Falaye Oluwamayowa</p>
                  <p className="text-gray-600 text-sm">Senior Fitness Client · Abuja</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-orange-400">★</span>
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "You need that snatched waist and summer body or general body fitness? This is the right plug. The trainers are so relatable and they will help you achieve your body goals."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-full"></div>
                <div>
                  <p className="font-bold">Ngozi B., HR Director</p>
                  <p className="text-gray-600 text-sm">Corporate Wellness · Port Harcourt</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-accent font-semibold mb-2">FAQ</p>
            <h2 className="text-5xl font-bold">Common questions</h2>
            <p className="text-gray-600 text-lg mt-4">
              Everything you need to know before getting started.
            </p>
          </div>

          <div className="space-y-6">
            <details className="border border-gray-200 rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-bold text-lg">
                What happens during the first session?
                <span className="group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Your first session is always a Physical Assessment Session. Your trainer will evaluate your fitness level, take measurements, and discuss your health history before creating your personalized plan.
              </p>
            </details>

            <details className="border border-gray-200 rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-bold text-lg">
                Can I reschedule a session?
                <span className="group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Yes, you may reschedule a session, but must give at least 24 hours' notice before the scheduled time.
              </p>
            </details>

            <details className="border border-gray-200 rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-bold text-lg">
                How are trainers assigned?
                <span className="group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Our matching algorithm considers your fitness goals, availability, and trainer specialization to ensure you're paired with the best trainer for your needs.
              </p>
            </details>

            <details className="border border-gray-200 rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-bold text-lg">
                Are group sessions available?
                <span className="group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Yes, group sessions are available for certain programs at reduced rates. Train with others and share the cost.
              </p>
            </details>

            <details className="border border-gray-200 rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-bold text-lg">
                How do I communicate with my trainer?
                <span className="group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                All communication with your trainer must happen within the PhysiFit NG platform. No external contact is permitted.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-dark to-primary-darker text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to begin your fitness journey?</h2>
          <p className="text-xl mb-8 text-gray-200">
            Join hundreds of Nigerians who've transformed their health with structured, expert-led fitness programs.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link
              href="/book-session"
              className="bg-accent text-primary-dark hover:bg-accent-dark px-8 py-3 rounded-full font-semibold transition"
            >
              Book a Session
            </Link>
            <Link
              href="/signup"
              className="border-2 border-white text-white hover:bg-primary-dark px-8 py-3 rounded-full font-semibold transition"
            >
              Create Free Account
            </Link>
          </div>
          <p className="text-gray-300 mt-6 text-sm">
            ✓ No hidden fees &nbsp;&nbsp; ✓ Certified trainers &nbsp;&nbsp; ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>© 2025 PhysiFit NG · All rights reserved · Built for Nigerian wellness</p>
        </div>
      </footer>
    </div>
  )
}
