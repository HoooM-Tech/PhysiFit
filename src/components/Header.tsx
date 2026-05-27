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

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Hide header when logged in or in admin
  if (isLoggedIn) {
    return null
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center focus:outline-none">
          <Image
            src="/images/logo.png"
            alt="PhysiFit NG Logo"
            width={150}
            height={42}
            className="object-contain h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition font-medium">
            Home
          </Link>
          <Link href="/event" className="text-gray-600 hover:text-gray-900 transition font-medium">
            Event
          </Link>
          <Link href="/#services" className="text-gray-600 hover:text-gray-900 transition font-medium">
            Services
          </Link>
          <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 transition font-medium">
            How It Works
          </Link>
          <Link href="/#faq" className="text-gray-600 hover:text-gray-900 transition font-medium">
            FAQ
          </Link>
          <Link href="/trainer-portal" className="text-accent hover:text-accent-dark transition font-semibold">
            Trainer Portal
          </Link>
        </div>

        {/* Desktop Buttons & Hamburger Trigger */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition font-medium">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-accent hover:bg-accent-dark text-primary-dark px-6 py-2 rounded-full transition font-semibold shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Hamburger Menu Toggle (Mobile only) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition focus:outline-none"
            aria-label="Toggle Navigation Menu"
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

      {/* Mobile Drawer (Collapsible) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="px-6 py-4 flex flex-col gap-4 bg-gray-50 border-t border-gray-100">
            <Link href="/" className="text-gray-700 hover:text-gray-900 py-2 border-b border-gray-100 font-medium transition">
              Home
            </Link>
            <Link href="/event" className="text-gray-700 hover:text-gray-900 py-2 border-b border-gray-100 font-medium transition">
              Event
            </Link>
            <Link href="/#services" className="text-gray-700 hover:text-gray-900 py-2 border-b border-gray-100 font-medium transition">
              Services
            </Link>
            <Link href="/#how-it-works" className="text-gray-700 hover:text-gray-900 py-2 border-b border-gray-100 font-medium transition">
              How It Works
            </Link>
            <Link href="/#faq" className="text-gray-700 hover:text-gray-900 py-2 border-b border-gray-100 font-medium transition">
              FAQ
            </Link>
            <Link href="/trainer-portal" className="text-accent hover:text-accent-dark py-2 border-b border-gray-100 font-semibold transition">
              Trainer Portal
            </Link>
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/login"
                className="w-full text-center border border-gray-300 text-gray-700 py-2.5 rounded-full font-semibold hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="w-full text-center bg-accent hover:bg-accent-dark text-primary-dark py-2.5 rounded-full font-semibold shadow-sm transition"
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

