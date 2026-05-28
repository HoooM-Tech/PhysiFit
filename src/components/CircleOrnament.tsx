interface CircleOrnamentProps {
  size?: number
  tone?: 'dark' | 'light'
  className?: string
}

export default function CircleOrnament({
  size = 28,
  tone = 'light',
  className = '',
}: CircleOrnamentProps) {
  const ringColor = tone === 'dark' ? 'border-accent' : 'border-accent'
  const dotColor = tone === 'dark' ? 'bg-white' : 'bg-accent'
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex items-center justify-center rounded-full border-2 ${ringColor} ${className}`}
      style={{ width: size, height: size }}
    >
      <span className={`block rounded-full ${dotColor}`} style={{ width: size / 5, height: size / 5 }} />
    </span>
  )
}
