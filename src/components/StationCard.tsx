import Image from 'next/image'
import CornerTriangle from './CornerTriangle'

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
  return (
    <article className="group bg-white border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
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
        <h3 className="font-display text-2xl uppercase tracking-wide text-primary-darker mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed text-[15px]">{body}</p>
      </div>
    </article>
  )
}
