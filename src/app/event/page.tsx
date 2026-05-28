'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/SectionHeader'
import Footer from '@/components/Footer'
import CornerTriangle from '@/components/CornerTriangle'
import DotPattern from '@/components/DotPattern'
import CircleOrnament from '@/components/CircleOrnament'
import Icon, { type IconName } from '@/components/Icon'
import StationCard from '@/components/StationCard'
import ScrollReveal from '@/components/ScrollReveal'

const stations = [
  {
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    alt: 'Senior practicing balance on a yoga mat',
    title: 'Balance Training',
    body: 'Gentle, guided exercises to improve postural stability and reduce fall risk through proven techniques.',
    category: 'PHYSICAL' as const,
  },
  {
    image:
      'https://images.unsplash.com/photo-1606166325683-e6deb697d301?auto=format&fit=crop&w=1200&q=80',
    alt: 'Senior engaged in a cognitive focus puzzle activity',
    title: 'Cognitive Focus',
    body: 'Mental agility games and exercises designed to sharpen focus, memory, and reaction time.',
    category: 'MENTAL' as const,
  },
  {
    image:
      'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80',
    alt: 'Group practicing tai chi coordination outdoors',
    title: 'Coordination Flow',
    body: 'Rhythmic movement sequences that enhance hand-eye coordination and body awareness.',
    category: 'PHYSICAL' as const,
  },
  {
    image:
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    alt: 'Senior performing a mobility stretch on a yoga mat',
    title: 'Mobility & Flexibility',
    body: 'Gentle stretching and joint mobility work to maintain and improve range of motion.',
    category: 'PHYSICAL' as const,
  },
  {
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Senior briskly walking for endurance training',
    title: 'Endurance Building',
    body: 'Low-impact cardiovascular activities that safely build stamina and energy levels.',
    category: 'PHYSICAL' as const,
  },
  {
    image:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Group of seniors laughing together after a fitness session',
    title: 'Social Wellness',
    body: 'Guided social activities that build community connections and emotional wellbeing.',
    category: 'SOCIAL' as const,
  },
]

const metaItems: { icon: IconName; label: string; value: string }[] = [
  { icon: 'calendar', label: 'DATE', value: 'Saturday, June 27, 2026' },
  { icon: 'clock', label: 'TIME', value: '8:00 AM – 10:00 AM' },
  { icon: 'mapPin', label: 'VENUE', value: 'Details sent via email after registration' },
  { icon: 'users', label: 'FOR', value: 'Older adults & senior wellness enthusiasts' },
]

const pillars = [
  'Balance & Stability',
  'Cognitive Focus',
  'Coordination',
  'Mobility',
  'Endurance',
  'Confidence',
]

const journey = [
  {
    title: 'Register Online',
    body: 'Complete the simple registration form with your name, age, email, and phone. Takes under 2 minutes.',
  },
  {
    title: 'Secure Your Spot',
    body: 'Complete your payment through our secure gateway. Your registration is confirmed instantly.',
  },
  {
    title: 'Receive Access Pass',
    body: 'Your digital access card with venue details, event time, and unique ID is sent directly to your email.',
  },
  {
    title: 'Experience the Day',
    body: 'Arrive with confidence, explore all wellness stations, and connect with a vibrant community of active seniors.',
  },
]

export default function EventPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main id="main">
        {/* Hero Section */}
        <section className="relative bg-primary-darker py-24 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1600&q=80"
            alt=""
            fill
            priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-darker via-primary-darker/95 to-primary-darker/60" />
          <DotPattern className="absolute top-12 right-12 w-44 h-44 text-accent/30" />
          <CornerTriangle corner="tl" size={56} color="bg-accent" />
          <CornerTriangle corner="br" size={56} color="bg-accent" />

          <div className="relative max-w-7xl mx-auto px-6">
            <div className="inline-flex items-center gap-3 mb-7">
              <span aria-hidden="true" className="h-[2px] w-10 bg-accent" />
              <span className="text-accent text-xs font-bold tracking-[0.25em] uppercase">
                PHYSIFIT WELLNESS DAY 2026
              </span>
            </div>
            <h1 className="font-display uppercase tracking-condensed leading-[0.92] text-white text-5xl sm:text-7xl md:text-[6rem] mb-7">
              Move Safer,
              <br />
              <span className="text-accent">Live Stronger</span>
            </h1>
            <p className="text-gray-200 text-base sm:text-lg mb-9 max-w-2xl leading-relaxed">
              A transformative day wellness experience designed to help older adults improve balance, focus, coordination, mobility, endurance, and confidence in movement.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/register"
                className="bg-accent hover:bg-accent-dark text-primary-darker px-8 py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition flex items-center gap-2"
              >
                <Icon name="sparkle" size={18} />
                Register for the Event
              </Link>
              <Link
                href="#event-details"
                className="border-2 border-white hover:bg-white hover:text-primary-darker text-white px-8 py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition"
              >
                Learn More
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 sm:gap-12 mt-16 max-w-2xl">
              <div>
                <p className="font-display text-5xl text-accent leading-none">6+</p>
                <p className="text-gray-300 text-xs sm:text-sm uppercase tracking-[0.2em] mt-2">Wellness Stations</p>
              </div>
              <div>
                <p className="font-display text-5xl text-accent leading-none">1</p>
                <p className="text-gray-300 text-xs sm:text-sm uppercase tracking-[0.2em] mt-2">Full Experience</p>
              </div>
              <div>
                <p className="font-display text-5xl text-accent leading-none">100%</p>
                <p className="text-gray-300 text-xs sm:text-sm uppercase tracking-[0.2em] mt-2">Evidence-Based</p>
              </div>
            </div>
          </div>
        </section>

        {/* Event Details */}
        <section id="event-details" className="py-20 bg-white">
          <ScrollReveal className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader eyebrow="THE BASICS" headline="Event Details" />
              <div className="space-y-5 mt-10">
                {metaItems.map((item) => (
                  <div key={item.label} className="flex gap-5 items-start">
                    <div className="flex-shrink-0 w-14 h-14 border-2 border-accent text-accent flex items-center justify-center">
                      <Icon name={item.icon} size={24} />
                    </div>
                    <div className="pt-1">
                      <p className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-1">{item.label}</p>
                      <p className="text-gray-700 text-lg">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative bg-primary-darker text-white p-10 overflow-hidden">
              <CornerTriangle corner="br" size={48} color="bg-accent" />
              <DotPattern className="absolute top-6 right-6 w-24 h-24 text-accent/30" />
              <p className="text-accent text-xs font-bold tracking-[0.25em] uppercase mb-4">RESERVE YOUR SPOT</p>
              <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-condensed leading-tight mb-6">
                Limited spaces.
                <br />
                <span className="text-accent">Reserve today.</span>
              </h3>
              <Link
                href="/reserve"
                className="block w-full bg-accent hover:bg-accent-dark text-primary-darker py-4 px-6 rounded-md font-bold uppercase tracking-wider text-sm transition mb-5 text-center"
              >
                Reserve Your Spot →
              </Link>
              <p className="text-gray-300 text-sm leading-relaxed">
                Complete registration in just a few steps. Venue details and your access card will be sent to your email after payment.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-gray-50">
          <ScrollReveal className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div>
                <SectionHeader
                  eyebrow="OUR MISSION"
                  headline="Healthy Aging Through Evidence-Based Movement"
                />
                <p className="text-gray-600 mt-8 leading-relaxed text-lg">
                  Move Safer, Live Stronger brings together carefully curated, evidence-based activities that support healthy aging. Each station is designed to meet seniors where they are — building physical capability, mental sharpness, and social connection in a safe, welcoming environment.
                </p>
              </div>

              <div className="relative bg-primary-darker p-10 overflow-hidden">
                <CornerTriangle corner="tr" size={40} color="bg-accent" />
                <DotPattern className="absolute bottom-6 right-6 w-28 h-28 text-accent/30" />
                <div className="inline-flex items-center gap-3 mb-5">
                  <span aria-hidden="true" className="h-[2px] w-8 bg-accent" />
                  <span className="text-accent text-xs font-bold tracking-[0.25em] uppercase">WELLNESS PILLARS</span>
                </div>
                <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-condensed text-white mb-5 leading-tight">
                  Six Dimensions of <span className="text-accent">Senior Wellness</span>
                </h3>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Every activity station addresses one or more critical dimensions of healthy aging, proven effective through clinical research.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pillars.map((p) => (
                    <div
                      key={p}
                      className="flex items-center gap-3 bg-white/5 border border-accent/30 p-4"
                    >
                      <CircleOrnament size={20} tone="dark" />
                      <p className="text-white font-semibold text-sm uppercase tracking-wide">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Wellness Stations */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="text-center flex flex-col items-center mb-14">
              <SectionHeader
                eyebrow="WHAT'S INCLUDED"
                headline="Wellness Activity Stations"
                subhead="Each station is expertly facilitated by certified wellness professionals and tailored to varying ability levels."
                align="center"
              />
            </ScrollReveal>

            <ScrollReveal variant="stagger" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stations.map((s) => (
                <StationCard key={s.title} {...s} />
              ))}
            </ScrollReveal>
          </div>
        </section>

        {/* Journey Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="text-center flex flex-col items-center mb-14">
              <SectionHeader
                eyebrow="YOUR JOURNEY"
                headline="How the Day Unfolds"
                align="center"
              />
            </ScrollReveal>

            <ScrollReveal variant="stagger" className="max-w-3xl mx-auto">
              {journey.map((step, i) => (
                <div key={step.title} className="relative flex gap-6 pb-10 last:pb-0">
                  {i !== journey.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[27px] top-14 bottom-0 w-[2px] bg-accent/40" />
                  )}
                  <div className="flex-shrink-0 relative">
                    <div className="w-14 h-14 bg-primary-darker text-accent font-display text-3xl flex items-center justify-center">
                      {i + 1}
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-display text-2xl uppercase tracking-wide text-primary-darker mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-r from-primary-dark to-primary-darker py-20 overflow-hidden">
          <CornerTriangle corner="tl" size={48} color="bg-accent" />
          <CornerTriangle corner="br" size={48} color="bg-accent" />
          <DotPattern className="absolute bottom-10 left-10 w-32 h-32 text-accent/30" />
          <ScrollReveal variant="zoom-in" className="relative max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl uppercase tracking-condensed leading-[0.95] text-white mb-6">
              Secure Your Spot <span className="text-accent">Today</span>
            </h2>
            <p className="text-gray-200 mb-10 text-lg max-w-2xl mx-auto leading-relaxed">
              Complete your registration in just a few steps. Venue details and your access card will be sent to your email after payment.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-primary-darker px-10 py-4 rounded-md font-bold uppercase tracking-wider transition"
            >
              Register Now
              <Icon name="arrowRight" size={20} />
            </Link>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  )
}
