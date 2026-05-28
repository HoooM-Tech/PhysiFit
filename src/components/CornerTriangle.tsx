type Corner = 'tl' | 'tr' | 'bl' | 'br'

interface CornerTriangleProps {
  corner?: Corner
  size?: number
  color?: string
  className?: string
}

const clipMap: Record<Corner, string> = {
  tl: 'clip-corner-tl',
  tr: 'clip-corner-tr',
  bl: 'clip-corner-bl',
  br: 'clip-corner-br',
}

const positionMap: Record<Corner, string> = {
  tl: 'top-0 left-0',
  tr: 'top-0 right-0',
  bl: 'bottom-0 left-0',
  br: 'bottom-0 right-0',
}

export default function CornerTriangle({
  corner = 'br',
  size = 40,
  color = 'bg-accent',
  className = '',
}: CornerTriangleProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute ${positionMap[corner]} ${clipMap[corner]} ${color} ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
