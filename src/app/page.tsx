'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import Image from 'next/image'
import HeroSlider, { type HeroSlide } from '@/components/HeroSlider'
import SectionHeader from '@/components/SectionHeader'
import Footer from '@/components/Footer'
import CornerTriangle from '@/components/CornerTriangle'
import DotPattern from '@/components/DotPattern'
import CircleOrnament from '@/components/CircleOrnament'
import Icon from '@/components/Icon'
import ScrollReveal from '@/components/ScrollReveal'
import { useTheme } from '@/context/ThemeContext'

const heroSlides: HeroSlide[] = [
  {
    image: '/images/senior-fitness.jpg',
    alt: 'Senior fitness training session',
    eyebrow: 'WELCOME TO PHYSIFIT',
    headline: 'Fitness designed for your journey',
    accentWord: 'your',
    body: 'PhysiFit NG offers personalized, structured training for seniors, postpartum women, and corporate teams — with dedicated trainers and full progress tracking.',
    ctas: [
      { label: 'Book a Session', href: '/book-session', variant: 'primary' },
      { label: 'Create Account', href: '/signup', variant: 'outline' },
    ],
    tagline: 'Senior Fitness — strength, balance, independence',
  },
  {
    image: '/images/Postpartum-fitness-1.jpg',
    alt: 'Postpartum fitness training session',
    eyebrow: 'WELCOME TO PHYSIFIT',
    headline: 'Fitness designed for your journey',
    accentWord: 'your',
    body: 'PhysiFit NG offers personalized, structured training for seniors, postpartum women, and corporate teams — with dedicated trainers and full progress tracking.',
    ctas: [
      { label: 'Book a Session', href: '/book-session', variant: 'primary' },
      { label: 'Create Account', href: '/signup', variant: 'outline' },
    ],
    tagline: 'Postpartum Recovery — safe, evidence-based',
  },
  {
    image: '/images/cooperate-wellness.jpg',
    alt: 'Corporate wellness team training',
    eyebrow: 'WELCOME TO PHYSIFIT',
    headline: 'Fitness designed for your journey',
    accentWord: 'your',
    body: 'PhysiFit NG offers personalized, structured training for seniors, postpartum women, and corporate teams — with dedicated trainers and full progress tracking.',
    ctas: [
      { label: 'Book a Session', href: '/book-session', variant: 'primary' },
      { label: 'Create Account', href: '/signup', variant: 'outline' },
    ],
    tagline: 'Corporate Wellness — energize your team',
  },
]

export default function Home() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-primary-darker text-white' : 'bg-white text-gray-800'}`}>
      <Header />
      <main id="main">
        <HeroSlider slides={heroSlides} />

        {/* Stats band */}
        <section className="bg-primary-darker text-white py-10 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-4xl sm:text-5xl text-accent">500+</p>
              <p className="text-gray-300 text-xs sm:text-sm uppercase tracking-[0.2em] mt-2">Active Clients</p>
            </div>
            <div className="border-x border-white/10">
              <p className="font-display text-4xl sm:text-5xl text-accent">98%</p>
              <p className="text-gray-300 text-xs sm:text-sm uppercase tracking-[0.2em] mt-2">Satisfaction Rate</p>
            </div>
            <div>
              <p className="font-display text-4xl sm:text-5xl text-accent">3</p>
              <p className="text-gray-300 text-xs sm:text-sm uppercase tracking-[0.2em] mt-2">Specializations</p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className={`relative py-24 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-primary-dark/20' : 'bg-gray-50'}`}>
          <DotPattern className="absolute top-10 right-10 w-40 h-40 text-accent/40" />
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="text-center flex flex-col items-center mb-14">
              <SectionHeader
                eyebrow="OUR SERVICES"
                headline={
                  <>
                    Fitness for every <span className="italic text-accent">life stage</span>
                  </>
                }
                subhead="Specialized programs built around your unique needs, delivered by certified trainers who understand your body and goals."
                align="center"
                tone={isDark ? 'dark' : 'light'}
              />
            </ScrollReveal>

            <ScrollReveal variant="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  image: '/images/senior-fitness.jpg',
                  alt: 'Senior fitness class',
                  title: 'Senior Fitness',
                  body: 'Low-impact, mobility-focused programs designed specifically for older adults to maintain strength, balance, and independence.',
                },
                {
                  image: '/images/Postpartum-fitness-1.jpg',
                  alt: 'Postpartum fitness class',
                  title: 'Postpartum Fitness',
                  body: 'Safe, evidence-based recovery programs helping new mothers regain strength, core stability, and overall wellbeing.',
                },
                {
                  image: '/images/cooperate-wellness.jpg',
                  alt: 'Corporate wellness class',
                  title: 'Corporate Wellness',
                  body: 'Group wellness programs for teams — improving productivity, reducing burnout, and building a healthier workplace culture.',
                },
              ].map((svc) => (
                <article
                  key={svc.title}
                  className={`group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-800'
                  }`}
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={svc.image}
                      alt={svc.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <CornerTriangle corner="tr" size={48} className="z-10" />
                  </div>
                  <div className="p-8">
                    <h3 className={`font-display text-3xl uppercase tracking-condensed mb-3 ${isDark ? 'text-white' : 'text-primary-darker'}`}>{svc.title}</h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6 leading-relaxed`}>{svc.body}</p>
                    <Link
                      href="/book-session"
                      className={`inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm group/link ${
                        isDark ? 'text-accent hover:text-accent-light' : 'text-primary-darker hover:text-accent'
                      }`}
                    >
                      Explore Program
                      <Icon name="arrowRight" size={18} className="transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </ScrollReveal>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative bg-primary-darker text-white py-24 overflow-hidden">
          <DotPattern className="absolute top-16 left-10 w-48 h-48 text-accent/20" />
          <DotPattern className="absolute bottom-16 right-10 w-32 h-32 text-accent/20" />
          <CornerTriangle corner="tl" size={48} color="bg-accent" />

          <div className="relative max-w-7xl mx-auto px-6">
            <ScrollReveal className="mb-16">
              <SectionHeader
                eyebrow="PROCESS"
                headline="How PhysiFit NG works"
                subhead="From sign-up to your first session in four simple steps."
                tone="dark"
              />
            </ScrollReveal>

            <ScrollReveal variant="stagger" className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {[
                { n: '1', title: 'Create Account', body: 'Register with your basic info and complete a short health questionnaire so we understand your needs.' },
                { n: '2', title: 'Book Sessions', body: 'Choose your service, session type, preferred dates, and the number of sessions you need.' },
                { n: '3', title: 'Trainer Assigned', body: "A certified trainer is matched and assigned to you within 24–48 hours. You'll get a push notification as soon as they're matched to your profile." },
                { n: '4', title: 'Train & Progress', body: 'Complete your assessment, follow your personalized plan, and track every session in your dashboard.' },
              ].map((step) => (
                <div key={step.n} className="relative">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="font-display text-6xl text-accent leading-none">{step.n}</span>
                    <span className="h-[2px] flex-1 bg-accent/30" />
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wide mb-3">{step.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-[15px]">{step.body}</p>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-primary-darker text-white' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="mb-14">
              <SectionHeader
                eyebrow="TESTIMONIALS"
                headline="What our clients say"
                subhead="Real stories from people who've transformed their health with PhysiFit NG."
                tone={isDark ? 'dark' : 'light'}
              />
            </ScrollReveal>

            <ScrollReveal variant="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "I've enjoyed excellent service so far. The trainer is professional and knows his beans. 100% recommend.",
                  name: 'Pamilerinayo Ige.',
                  role: 'Postpartum Client · Lagos',
                  initials: 'PI',
                },
                {
                  quote: 'A well equipped fitness center, attention to details and result driven coach.',
                  name: 'Falaye Oluwamayowa',
                  role: 'Senior Fitness Client · Abuja',
                  initials: 'FO',
                },
                {
                  quote: 'You need that snatched waist and summer body or general body fitness? This is the right plug. The trainers are so relatable and they will help you achieve your body goals.',
                  name: 'Ngozi B., HR Director',
                  role: 'Corporate Wellness · Port Harcourt',
                  initials: 'NB',
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className={`relative p-8 hover:shadow-xl transition border ${
                    isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-gray-200 text-slate-800'
                  }`}
                >
                  <Icon name="quote" size={40} className="text-accent mb-4" />
                  <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} aria-hidden="true" className="text-orange-400">★</span>
                    ))}
                  </div>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-6 italic leading-relaxed`}>"{t.quote}"</p>
                  <div className={`flex items-center gap-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                    <div className="w-12 h-12 bg-accent text-primary-darker font-display text-xl flex items-center justify-center">
                      {t.initials}
                    </div>
                    <div>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-primary-darker'}`}>{t.name}</p>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className={`py-24 transition-colors duration-300 ${isDark ? 'bg-primary-dark/20' : 'bg-gray-50'}`}>
          <div className="max-w-4xl mx-auto px-6">
            <ScrollReveal className="text-center flex flex-col items-center mb-14">
              <SectionHeader
                eyebrow="FAQ"
                headline="Common questions"
                subhead="Everything you need to know before getting started."
                align="center"
                tone={isDark ? 'dark' : 'light'}
              />
            </ScrollReveal>

            <div className="space-y-3">
              {[
                {
                  q: 'What happens during the first session?',
                  a: 'Your first session is always a Physical Assessment Session. Your trainer will evaluate your fitness level, take measurements, and discuss your health history before creating your personalized plan.',
                },
                {
                  q: 'Can I reschedule a session?',
                  a: "Yes, you may reschedule a session, but must give at least 24 hours' notice before the scheduled time.",
                },
                {
                  q: 'How are trainers assigned?',
                  a: "Our matching algorithm considers your fitness goals, availability, and trainer specialization to ensure you're paired with the best trainer for your needs.",
                },
                {
                  q: 'Are group sessions available?',
                  a: 'Yes, group sessions are available for certain programs at reduced rates. Train with others and share the cost.',
                },
                {
                  q: 'How do I communicate with my trainer?',
                  a: 'All communication with your trainer must happen within the PhysiFit NG platform. No external contact is permitted.',
                },
              ].map((item) => (
                <details key={item.q} className={`group border-b py-5 cursor-pointer ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
                  <summary className="flex justify-between items-center gap-4 list-none">
                    <span className={`font-display text-lg sm:text-xl uppercase tracking-wide pr-4 ${isDark ? 'text-white' : 'text-primary-darker'}`}>
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex-shrink-0 w-9 h-9 border-2 group-open:bg-accent group-open:border-accent group-open:text-primary-darker flex items-center justify-center transition ${
                        isDark ? 'border-white text-white' : 'border-primary-darker text-primary-darker'
                      }`}
                    >
                      <span className="group-open:hidden text-xl leading-none">+</span>
                      <span className="hidden group-open:inline text-xl leading-none">−</span>
                    </span>
                  </summary>
                  <p className={`mt-4 leading-relaxed pr-12 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-r from-primary-dark to-primary-darker text-white py-20 overflow-hidden">
          <CornerTriangle corner="tl" size={48} color="bg-accent" />
          <CornerTriangle corner="br" size={48} color="bg-accent" />
          <DotPattern className="absolute top-10 right-10 w-32 h-32 text-accent/30" />
          <ScrollReveal variant="zoom-in" className="relative max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl uppercase tracking-condensed leading-[0.95] mb-6">
              Ready to begin your <span className="text-accent">fitness journey?</span>
            </h2>
            <p className="text-lg sm:text-xl mb-10 text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of Nigerians who've transformed their health with structured, expert-led fitness programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/book-session"
                className="bg-accent text-primary-darker hover:bg-accent-dark px-10 py-4 rounded-md font-bold uppercase tracking-wider text-sm transition text-center w-full sm:w-auto"
              >
                Book a Session
              </Link>
              <Link
                href="/signup"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-darker px-10 py-4 rounded-md font-bold uppercase tracking-wider text-sm transition text-center w-full sm:w-auto"
              >
                Create Free Account
              </Link>
            </div>
            <p className="text-gray-300 mt-8 text-sm flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
              <span className="inline-flex items-center gap-2"><Icon name="check" size={16} className="text-accent" /> No hidden fees</span>
              <span className="inline-flex items-center gap-2"><Icon name="check" size={16} className="text-accent" /> Certified trainers</span>
              <span className="inline-flex items-center gap-2"><Icon name="check" size={16} className="text-accent" /> Cancel anytime</span>
            </p>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  )
}
