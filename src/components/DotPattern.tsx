interface DotPatternProps {
  className?: string
  size?: number
}

export default function DotPattern({ className = '', size = 14 }: DotPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none bg-dot-grid ${className}`}
      style={{ backgroundSize: `${size}px ${size}px` }}
    />
  )
}
