'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Icon from './Icon'
import CornerTriangle from './CornerTriangle'

export interface HeroSlide {
  image: string
  alt: string
  eyebrow: string
  headline: string
  accentWord?: string
  body: string
  ctas: Array<{ label: string; href: string; variant: 'primary' | 'outline' }>
  tagline?: string
}

interface HeroSliderProps {
  slides: HeroSlide[]
  intervalMs?: number
}

export default function HeroSlider({ slides, intervalMs = 6500 }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const count = slides.length

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const next = useCallback(() => setCurrent((c) => (c + 1) % count), [count])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + count) % count), [count])

  useEffect(() => {
    if (isPaused || reduceMotion || count <= 1) return
    const id = window.setInterval(next, intervalMs)
    return () => window.clearInterval(id)
  }, [isPaused, reduceMotion, count, intervalMs, next])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      next()
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) next()
      else prev()
    }
    touchStartX.current = null
  }

  const renderHeadline = (slide: HeroSlide) => {
    if (slide.accentWord && slide.headline.includes(slide.accentWord)) {
      const [before, after] = slide.headline.split(slide.accentWord)
      return (
        <>
          {before}
          <span className="text-accent">{slide.accentWord}</span>
          {after}
        </>
      )
    }
    return slide.headline
  }

  const activeSlide = slides[current]

  return (
    <section
      ref={rootRef}
      className="relative w-full overflow-hidden bg-primary-darker"
      role="region"
      aria-roledescription="carousel"
      aria-label="PhysiFit specializations"
      onKeyDown={handleKey}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      <div className="relative h-[78vh] min-h-[560px] max-h-[820px] w-full">
        {slides.map((slide, i) => {
          const active = i === current
          return (
            <div
              key={slide.image}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${count}: ${slide.tagline || slide.headline}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                active ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none z-0'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-darker/90 via-primary-darker/55 to-primary-darker/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-darker/80 via-transparent to-transparent" />
            </div>
          )
        })}

        {/* Foreground content (uses activeSlide so transitions feel snappy) */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full items-center">
            <div key={`text-${current}`} className="md:col-span-7 animate-fadeUp text-white">
              <div className="flex items-center gap-3 mb-5">
                <span aria-hidden="true" className="h-[2px] w-12 bg-accent" />
                <p className="text-accent text-xs font-semibold tracking-[0.25em] uppercase">
                  {activeSlide.eyebrow}
                </p>
              </div>
              <h1 className="font-display uppercase leading-[0.92] tracking-condensed text-5xl sm:text-7xl md:text-[5.5rem] mb-6">
                {renderHeadline(activeSlide)}
              </h1>
              <p className="text-gray-200 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
                {activeSlide.body}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {activeSlide.ctas.map((cta) => (
                  <Link
                    key={cta.label}
                    href={cta.href}
                    className={
                      cta.variant === 'primary'
                        ? 'bg-accent hover:bg-accent-dark text-primary-darker px-8 py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition text-center inline-flex items-center justify-center gap-2'
                        : 'border-2 border-white hover:bg-white hover:text-primary-darker text-white px-8 py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition text-center'
                    }
                  >
                    {cta.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Decorative right column on desktop: slide-specific tagline card */}
            <div className="hidden md:flex md:col-span-5 justify-end">
              <div key={`card-${current}`} className="relative animate-fadeUp bg-white text-primary-darker p-8 max-w-sm shadow-2xl">
                <CornerTriangle corner="br" size={32} />
                <p className="text-accent text-xs font-bold tracking-[0.25em] uppercase mb-3">
                  Specialization
                </p>
                <p className="font-display text-3xl uppercase leading-tight tracking-condensed">
                  {activeSlide.tagline}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute z-30 bottom-8 right-6 sm:right-10 flex gap-3">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="w-12 h-12 border-2 border-white/70 hover:border-accent hover:bg-accent hover:text-primary-darker text-white flex items-center justify-center transition"
          >
            <Icon name="chevronLeft" size={22} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="w-12 h-12 border-2 border-white/70 hover:border-accent hover:bg-accent hover:text-primary-darker text-white flex items-center justify-center transition"
          >
            <Icon name="chevronRight" size={22} />
          </button>
        </div>

        {/* Dot pagination */}
        <div className="absolute z-30 bottom-12 left-1/2 -translate-x-1/2 flex gap-3 sm:hidden">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-8 bg-accent' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Slide pagination — desktop bottom-left under text */}
        <div className="hidden sm:flex absolute z-30 bottom-10 left-6 sm:left-10 gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-10 bg-accent' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Live region for SR */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Slide {current + 1} of {count}: {activeSlide.tagline || activeSlide.headline}
        </div>
      </div>
    </section>
  )
}
