import type { ReactNode } from 'react'

interface SectionHeaderProps {
  eyebrow?: string
  headline: ReactNode
  accentWord?: string
  subhead?: string
  tone?: 'light' | 'dark'
  align?: 'left' | 'center'
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}

export default function SectionHeader({
  eyebrow,
  headline,
  accentWord,
  subhead,
  tone = 'light',
  align = 'left',
  as: HeadingTag = 'h2',
  className = '',
}: SectionHeaderProps) {
  const eyebrowColor = tone === 'dark' ? 'text-accent' : 'text-accent'
  const headlineColor = tone === 'dark' ? 'text-white' : 'text-primary-darker'
  const subColor = tone === 'dark' ? 'text-gray-300' : 'text-gray-600'
  const alignClass = align === 'center' ? 'text-center mx-auto' : ''
  const justifyClass = align === 'center' ? 'justify-center' : ''

  const renderHeadline = () => {
    if (typeof headline === 'string' && accentWord && headline.includes(accentWord)) {
      const [before, after] = headline.split(accentWord)
      return (
        <>
          {before}
          <span className="text-accent">{accentWord}</span>
          {after}
        </>
      )
    }
    return headline
  }

  return (
    <div className={`${alignClass} ${className} max-w-3xl`}>
      {eyebrow && (
        <div className={`flex items-center gap-3 mb-4 ${justifyClass}`}>
          <span aria-hidden="true" className="h-[2px] w-10 bg-accent" />
          <p className={`${eyebrowColor} text-xs font-semibold tracking-[0.2em] uppercase`}>
            {eyebrow}
          </p>
        </div>
      )}
      <HeadingTag
        className={`font-display ${headlineColor} text-4xl sm:text-5xl md:text-6xl leading-[0.95] tracking-condensed uppercase`}
      >
        {renderHeadline()}
      </HeadingTag>
      {subhead && (
        <p className={`${subColor} text-base sm:text-lg mt-5 leading-relaxed`}>{subhead}</p>
      )}
    </div>
  )
}
