import { cn } from '@/utils/core/ui'
import { CheckCircle2 } from 'lucide-react'

interface FeatureSpotlightRowProps {
  title: string
  description: string
  bullets: string[]
  imageSrc: string
  imageAlt?: string
  reverse?: boolean
}

export function FeatureSpotlightRow({ title, description, bullets, imageSrc, imageAlt = '', reverse }: FeatureSpotlightRowProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className={cn(
          'grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center',
          reverse && 'md:[&>div:first-child]:order-2 md:[&>div:last-child]:order-1'
        )}>
          {/* Copy */}
          <div>
            <span className="inline-block text-sm text-[#2B6CB0] font-medium uppercase tracking-wider bg-[#2B6CB0]/10 px-4 py-2 rounded-full border border-[#2B6CB0]/20 mb-4">Feature</span>
            <h3 className="text-2xl md:text-3xl font-bold font-inter text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 font-opensans mb-5">{description}</p>
            <ul className="space-y-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#ED8936] mr-2 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-lg">
            <img src={imageSrc} alt={imageAlt} className="w-full h-[240px] md:h-[340px] object-cover" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  )
}
