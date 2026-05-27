import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
