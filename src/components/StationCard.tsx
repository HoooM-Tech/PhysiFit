import Image from 'next/image'
import CornerTriangle from './CornerTriangle'
import { useTheme } from '@/context/ThemeContext'

type Category = 'PHYSICAL' | 'MENTAL' | 'SOCIAL'

interface StationCardProps {
  image: string
  alt: string
  title: string
  body: string
  category: Category
}

const categoryStyles: Record<Category, string> = {
  PHYSICAL: 'bg-accent text-primary-darker',
  MENTAL: 'bg-primary-darker text-accent border border-accent',
  SOCIAL: 'bg-white text-primary-darker border border-primary-darker',
}

export default function StationCard({ image, alt, title, body, category }: StationCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <article className={`group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border ${
      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-800'
    }`}>
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
        />
        <CornerTriangle corner="tr" size={48} className="z-10" />
        <span className={`absolute top-4 left-4 z-10 inline-block px-3 py-1 text-[10px] font-bold tracking-[0.2em] ${categoryStyles[category]}`}>
          {category}
        </span>
      </div>
      <div className="p-7">
        <h3 className={`font-display text-2xl uppercase tracking-wide mb-3 ${isDark ? 'text-white' : 'text-primary-darker'}`}>{title}</h3>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed text-[15px]`}>{body}</p>
      </div>
    </article>
  )
}
