import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PhysiFit NG - Fitness Platform',
  description: 'Specialized fitness programs for seniors, postpartum women, and corporate teams',
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
