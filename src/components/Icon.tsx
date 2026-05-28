import type { SVGProps } from 'react'

export type IconName =
  | 'calendar'
  | 'clock'
  | 'mapPin'
  | 'users'
  | 'mail'
  | 'phone'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'chevronLeft'
  | 'chevronRight'
  | 'arrowRight'
  | 'arrowLeft'
  | 'check'
  | 'plus'
  | 'minus'
  | 'sparkle'
  | 'quote'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
  'aria-label'?: string
}

export default function Icon({ name, size = 24, className, ...props }: IconProps) {
  const ariaHidden = props['aria-label'] ? undefined : true
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': ariaHidden,
    ...props,
  }

  switch (name) {
    case 'calendar':
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    case 'mapPin':
      return (
        <svg {...commonProps}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case 'users':
      return (
        <svg {...commonProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...commonProps}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 6-10 7L2 6" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...commonProps}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...commonProps}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...commonProps}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...commonProps}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    case 'chevronLeft':
      return (
        <svg {...commonProps}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      )
    case 'chevronRight':
      return (
        <svg {...commonProps}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )
    case 'arrowRight':
      return (
        <svg {...commonProps}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      )
    case 'arrowLeft':
      return (
        <svg {...commonProps}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      )
    case 'check':
      return (
        <svg {...commonProps}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...commonProps}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    case 'minus':
      return (
        <svg {...commonProps}>
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg {...commonProps}>
          <path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </svg>
      )
    case 'quote':
      return (
        <svg {...commonProps} fill="currentColor" stroke="none">
          <path d="M9.4 6C5.9 7.6 4 10.4 4 14v4h6v-6H6.6c.4-2 1.7-3.4 4.2-4.4L9.4 6Zm10 0c-3.5 1.6-5.4 4.4-5.4 8v4h6v-6h-3.4c.4-2 1.7-3.4 4.2-4.4L19.4 6Z" />
        </svg>
      )
    default:
      return null
  }
}
