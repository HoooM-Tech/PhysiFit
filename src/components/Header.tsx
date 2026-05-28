'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isLoggedIn =
    pathname.includes('/dashboard') ||
    pathname.includes('/trainer-portal') ||
    pathname.includes('/admin') ||
    pathname.includes('/book-session') ||
    pathname.includes('/payment') ||
    pathname.includes('/reserve')

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (isLoggedIn) {
    return null
  }

  const navLinkClass =
    "relative text-gray-700 hover:text-primary-darker transition font-medium text-sm uppercase tracking-[0.18em] after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-accent hover:after:w-full after:transition-all after:duration-300"

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
          <Image
            src="/images/logo.png"
            alt="PhysiFit NG Logo"
            width={150}
            height={42}
            className="object-contain h-12 w-auto"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-9">
          <Link href="/" className={navLinkClass}>Home</Link>
          <Link href="/event" className={navLinkClass}>Event</Link>
          <Link href="/#services" className={navLinkClass}>Services</Link>
          <Link href="/#how-it-works" className={navLinkClass}>How It Works</Link>
          <Link href="/#faq" className={navLinkClass}>FAQ</Link>
          <Link
            href="/trainer-portal"
            className="text-accent hover:text-accent-dark transition font-semibold text-sm uppercase tracking-[0.18em]"
          >
            Trainer Portal
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/login"
              className="text-gray-700 hover:text-primary-darker transition font-medium text-sm uppercase tracking-[0.18em]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-accent hover:bg-accent-dark text-primary-darker px-6 py-2.5 rounded-md transition font-bold uppercase tracking-wider text-sm shadow-sm"
            >
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Toggle Navigation Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-primary-darker text-white shadow-lg z-50">
          <div className="px-6 py-6 flex flex-col gap-1">
            <Link href="/" className="py-3 border-b border-white/10 font-medium uppercase tracking-wider text-sm hover:text-accent transition">Home</Link>
            <Link href="/event" className="py-3 border-b border-white/10 font-medium uppercase tracking-wider text-sm hover:text-accent transition">Event</Link>
            <Link href="/#services" className="py-3 border-b border-white/10 font-medium uppercase tracking-wider text-sm hover:text-accent transition">Services</Link>
            <Link href="/#how-it-works" className="py-3 border-b border-white/10 font-medium uppercase tracking-wider text-sm hover:text-accent transition">How It Works</Link>
            <Link href="/#faq" className="py-3 border-b border-white/10 font-medium uppercase tracking-wider text-sm hover:text-accent transition">FAQ</Link>
            <Link href="/trainer-portal" className="py-3 border-b border-white/10 text-accent font-semibold uppercase tracking-wider text-sm transition">Trainer Portal</Link>

            <div className="flex flex-col gap-3 pt-5">
              <Link
                href="/login"
                className="w-full text-center border border-white/40 text-white py-3 rounded-md font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="w-full text-center bg-accent hover:bg-accent-dark text-primary-darker py-3 rounded-md font-bold uppercase tracking-wider text-sm transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
