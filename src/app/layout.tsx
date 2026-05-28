import type { Metadata } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_APP_URL || 'https://physifit.co'),
  title: {
    default: 'PhysiFit – Personalized Fitness for Every Body',
    template: '%s | PhysiFit',
  },
  description:
    'Specialized fitness programs for seniors, postpartum women, and corporate teams. Certified trainers, progress tracking, and secure payments.',
  openGraph: {
    siteName: 'PhysiFit',
    type: 'website',
    locale: 'en_NG',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bebas.variable} ${inter.variable}`}>
      <body>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:text-primary-darker focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold"
          >
            Skip to main content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
