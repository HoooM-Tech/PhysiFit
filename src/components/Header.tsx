'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Icon from './Icon'
import { useTheme } from '@/context/ThemeContext'

export default function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isDark = theme === 'dark'

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

  const navLinkClass = `relative transition font-medium text-sm uppercase tracking-[0.18em] after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-accent hover:after:w-full after:transition-all after:duration-300 ${
    isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-primary-darker'
  }`

  return (
    <header className={`border-b sticky top-0 z-50 transition-all duration-300 ${
      isDark ? 'bg-primary-darker/95 border-white/5 text-white backdrop-blur' : 'bg-white border-gray-100 text-gray-800 shadow-sm'
    }`}>
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded bg-white px-2 py-1 rounded-lg">
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
            className="text-accent hover:text-accent-light transition font-semibold text-sm uppercase tracking-[0.18em]"
          >
            Trainer Portal
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-5">
            {/* Desktop Theme Toggler */}
            <button
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isDark ? 'bg-white/5 border-white/10 text-accent hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Mode"
            >
              <Icon name={isDark ? 'sun' : 'moon'} size={18} />
            </button>

            <Link
              href="/login"
              className={`transition font-medium text-sm uppercase tracking-[0.18em] ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-primary-darker'
              }`}
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

          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Header Theme Toggler */}
            <button
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition focus:outline-none ${
                isDark ? 'bg-white/5 border-white/10 text-accent hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Toggle Theme Mode"
            >
              <Icon name={isDark ? 'sun' : 'moon'} size={18} />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition focus:outline-none ${
                isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-gray-100 text-gray-800'
              }`}
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
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className={`md:hidden absolute top-full left-0 w-full shadow-lg z-50 border-b transition-colors duration-300 ${
          isDark ? 'bg-primary-darker border-white/5 text-white' : 'bg-white border-gray-100 text-gray-800'
        }`}>
          <div className="px-6 py-6 flex flex-col gap-1">
            <Link href="/" className={`py-3 border-b font-medium uppercase tracking-wider text-sm hover:text-accent transition ${
              isDark ? 'border-white/10 text-white' : 'border-gray-100 text-gray-700'
            }`}>Home</Link>
            <Link href="/event" className={`py-3 border-b font-medium uppercase tracking-wider text-sm hover:text-accent transition ${
              isDark ? 'border-white/10 text-white' : 'border-gray-100 text-gray-700'
            }`}>Event</Link>
            <Link href="/#services" className={`py-3 border-b font-medium uppercase tracking-wider text-sm hover:text-accent transition ${
              isDark ? 'border-white/10 text-white' : 'border-gray-100 text-gray-700'
            }`}>Services</Link>
            <Link href="/#how-it-works" className={`py-3 border-b font-medium uppercase tracking-wider text-sm hover:text-accent transition ${
              isDark ? 'border-white/10 text-white' : 'border-gray-100 text-gray-700'
            }`}>How It Works</Link>
            <Link href="/#faq" className={`py-3 border-b font-medium uppercase tracking-wider text-sm hover:text-accent transition ${
              isDark ? 'border-white/10 text-white' : 'border-gray-100 text-gray-700'
            }`}>FAQ</Link>
            
            <button
              onClick={toggleTheme}
              className={`w-full text-left py-3 border-b font-medium uppercase tracking-wider text-sm hover:text-accent transition flex items-center justify-between ${
                isDark ? 'border-white/10 text-white' : 'border-gray-100 text-gray-700'
              }`}
            >
              <span>Theme Mode</span>
              <span className="flex items-center gap-1.5 text-accent">
                <Icon name={isDark ? 'sun' : 'moon'} size={16} />
                <span className="text-xs uppercase font-mono tracking-wider">{theme}</span>
              </span>
            </button>

            <Link href="/trainer-portal" className={`py-3 border-b text-accent font-semibold uppercase tracking-wider text-sm transition ${
              isDark ? 'border-white/10' : 'border-gray-100'
            }`}>Trainer Portal</Link>

            <div className="flex flex-col gap-3 pt-5">
              <Link
                href="/login"
                className={`w-full text-center border py-3 rounded-md font-bold uppercase tracking-wider text-sm transition ${
                  isDark ? 'border-white/40 text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
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
