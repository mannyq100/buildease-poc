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
    <div className="relative bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/60 via-transparent to-[#2B6CB0]/5 rounded-xl" />
      <div className="relative z-10">
        <div className="mb-4 inline-flex p-3 rounded-lg bg-gray-50 text-[#2B6CB0]">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 font-inter mb-2">{title}</h3>
        <p className="text-gray-600 font-opensans mb-4">{description}</p>
        <ul className="space-y-2 text-sm text-gray-700">
          {points.map((p, i) => (
            <li key={i} className="flex items-start">
              <svg className="w-4 h-4 text-[#ED8936] mr-2 mt-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function WhoFor() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="inline-block text-sm text-[#2B6CB0] font-medium uppercase tracking-wider bg-[#2B6CB0]/10 px-4 py-2 rounded-full border border-[#2B6CB0]/20 mb-4">Who it's for</span>
          <h2 className="text-3xl md:text-4xl font-bold font-inter text-gray-900">Built for homeowners and contractors</h2>
          <p className="text-gray-600 font-opensans mt-3">Clear, trustworthy tools tailored to each role—on mobile or desktop.</p>
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
