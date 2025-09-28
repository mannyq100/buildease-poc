import { Feature } from '@/types/landing'
import { FeatureCard } from './FeatureCard'

interface FeaturesProps {
  features: Feature[]
}

export function Features({ features }: FeaturesProps) {
  return (
    <section id="features" className="py-16 bg-gradient-to-b from-white via-blue-50/20 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-orange-100/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-tl from-orange-100/30 to-blue-100/20 rounded-full blur-3xl"></div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <span className="text-sm text-[#2B6CB0] font-medium uppercase tracking-wider bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200/50 px-6 py-3 rounded-full shadow-sm">
            Features
          </span>
          
          <h2 className="text-3xl md:text-4xl font-bold font-inter mt-6 mb-4 text-gray-900 leading-tight">
            Everything you need to manage construction
          </h2>
          
          <p className="text-gray-600 font-opensans text-lg leading-relaxed max-w-3xl mx-auto">
            Powerful tools designed specifically for construction management, helping you stay on schedule and within budget.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}