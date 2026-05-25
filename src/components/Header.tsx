'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const pathname = usePathname()
  const isLoggedIn =
    pathname.includes('/dashboard') ||
    pathname.includes('/trainer-portal') ||
    pathname.includes('/admin')

  // Hide header when logged in or in admin
  if (isLoggedIn) {
    return null
  }

  return (
    <header className="bg-white border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold">Physi</span>
          <span className="text-2xl font-bold text-accent">Fit</span>
          <span className="text-2xl font-bold">NG</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
            Home
          </Link>
          <Link href="/event" className="text-gray-600 hover:text-gray-900 transition">
            Event
          </Link>
          <Link href="/#services" className="text-gray-600 hover:text-gray-900 transition">
            Services
          </Link>
          <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 transition">
            How It Works
          </Link>
          <Link href="/#faq" className="text-gray-600 hover:text-gray-900 transition">
            FAQ
          </Link>
          <Link href="/trainer-portal" className="text-accent hover:text-accent-dark transition">
            Trainer Portal
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 transition">
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-accent hover:bg-accent-dark text-primary-dark px-6 py-2 rounded-full transition font-semibold"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  )
}
