import type { ReactNode } from 'react'
import { Home, Wrench } from 'lucide-react'

interface AudienceCardProps {
  title: string
  description: string
  points: string[]
  icon: ReactNode
}

function AudienceCard({ title, description, points, icon }: AudienceCardProps) {
  return (
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-orange-50/30 rounded-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
      
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/30 to-orange-100/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="mb-6 inline-flex p-4 rounded-xl bg-gradient-to-br from-[#2B6CB0]/10 to-[#2B6CB0]/20 text-[#2B6CB0] shadow-sm group-hover:shadow-md transition-shadow duration-300">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 font-inter mb-3 group-hover:text-[#2B6CB0] transition-colors duration-300">{title}</h3>
        <p className="text-gray-600 font-opensans mb-4 leading-relaxed">{description}</p>
        <ul className="space-y-3 text-gray-700">
          {points.map((p, i) => (
            <li key={i} className="flex items-start">
              <svg className="w-5 h-5 text-[#ED8936] mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-opensans">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function WhoFor() {
  return (
    <section className="py-16 bg-gradient-to-br from-orange-50/30 via-white to-blue-50/30 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-28 h-28 bg-gradient-to-br from-orange-200/20 to-red-200/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-36 h-36 bg-gradient-to-tl from-blue-200/20 to-indigo-200/15 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <span className="inline-block text-sm text-[#2B6CB0] font-medium uppercase tracking-wider bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200/50 px-6 py-3 rounded-full shadow-sm mb-6">Who it's for</span>
          <h2 className="text-3xl md:text-4xl font-bold font-inter text-gray-900 mb-4 leading-tight">Built for homeowners and contractors</h2>
          <p className="text-gray-600 font-opensans text-lg leading-relaxed">Clear, trustworthy tools tailored to each role—on mobile or desktop.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          <AudienceCard
            title="Homeowners"
            description="Stay informed at every step with a clear plan and transparent budget."
            points={[
              'Simple project setup in minutes',
              'Track progress photos and milestones',
              'Know your spend vs. budget at a glance',
            ]}
            icon={<Home className="w-6 h-6" />}
          />
          <AudienceCard
            title="Contractors"
            description="Plan phases, manage teams, and control expenses with speed."
            points={[
              'Flexible phases and default tasks',
              'Batch approvals and exports for expenses',
              'Mobile-first for on-site use',
            ]}
            icon={<Wrench className="w-6 h-6" />}
          />
        </div>
      </div>
    </section>
  )
}
