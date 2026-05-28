import Link from 'next/link'
import Image from 'next/image'
import Icon from './Icon'
import CornerTriangle from './CornerTriangle'

export default function Footer() {
  return (
    <footer className="relative bg-primary-darker text-gray-300 overflow-hidden">
      <CornerTriangle corner="tr" size={56} className="opacity-80" />
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="mb-4">
            <Link href="/" className="inline-flex bg-white px-3.5 py-1.5 rounded-lg shadow-sm hover:opacity-95 transition">
              <Image
                src="/images/logo.png"
                alt="PhysiFit NG Logo"
                width={130}
                height={35}
                className="object-contain h-8 w-auto"
              />
            </Link>
          </div>
          <p className="text-gray-200 mb-2">Active lifestyle, healthy lifetime.</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Empowering Nigerians through evidence-based, personalized fitness for every stage of life.
          </p>
        </div>

        <div>
          <h3 className="text-accent font-display text-xl mb-5 uppercase tracking-wider">Explore</h3>
          <ul className="space-y-3 text-gray-300">
            <li><Link href="/" className="hover:text-white transition">Home</Link></li>
            <li><Link href="/event" className="hover:text-white transition">Event</Link></li>
            <li><Link href="/#services" className="hover:text-white transition">Services</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-white transition">How It Works</Link></li>
            <li><Link href="/#faq" className="hover:text-white transition">FAQ</Link></li>
            <li><Link href="/trainer-portal" className="hover:text-white transition">Trainer Portal</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-accent font-display text-xl mb-5 uppercase tracking-wider">Contact</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center gap-3">
              <Icon name="mail" size={18} className="text-accent flex-shrink-0" />
              <span>info.physifitservices@gmail.com</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="phone" size={18} className="text-accent flex-shrink-0" />
              <span>+234 703 892 0250</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="mapPin" size={18} className="text-accent flex-shrink-0" />
              <span>Lagos, Nigeria</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-400 text-sm">
          © 2026 PhysiFit · <a href="https://physifit.co" className="hover:text-white transition">physifit.co</a> · All rights reserved · Built for Nigerian wellness
        </div>
      </div>
    </footer>
  )
}
