
const LOGOS = [
  { name: 'BuildPro Ltd.' },
  { name: 'UrbanCraft' },
  { name: 'SafeSite Co.' },
  { name: 'PrimeContract' },
  { name: 'HomeWorks' },
]

export function LogoStrip() {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-wider text-gray-500">Trusted by builders</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="px-4 py-2 rounded-md bg-gray-50 text-gray-600 border border-gray-100 text-sm md:text-base shadow-sm"
            >
              {logo.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
