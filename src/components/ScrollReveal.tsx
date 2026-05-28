'use client'

import { useInView } from '@/hooks/useInView'
import React from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  variant?: 'fade' | 'slide-up' | 'zoom-in' | 'stagger'
  className?: string
  once?: boolean
}

export default function ScrollReveal({
  children,
  variant = 'slide-up',
  className = '',
  once = true,
}: ScrollRevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.1, once })

  const variantClass =
    variant === 'fade'
      ? 'reveal-fade'
      : variant === 'zoom-in'
        ? 'reveal-zoom-in'
        : variant === 'stagger'
          ? 'reveal-stagger'
          : 'reveal-slide-up'

  return (
    <div
      ref={ref}
      className={`${variantClass} ${inView ? 'revealed' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
