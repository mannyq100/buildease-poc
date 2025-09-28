import React from 'react'
import { motion } from 'framer-motion'
import { Stat } from '@/types/landing'

interface StatsProps {
  stats: Stat[]
}

export function Stats({ stats }: StatsProps) {
  function AnimatedStatValue({ value }: { value: string }) {
    // Extract numeric portion and suffix (e.g., 1500 + '+', 30 + '%')
    const match = value.match(/[0-9,.]+/)
    const numericStr = match ? match[0] : ''
    const suffix = match ? value.slice(match[0].length) : value
    const target = Number(numericStr.replace(/,/g, '')) || 0

    const [display, setDisplay] = React.useState(0)

    React.useEffect(() => {
      let raf = 0
      const duration = 900 // ms
      const start = performance.now()

      const tick = (now: number) => {
        const elapsed = now - start
        const p = Math.min(1, elapsed / duration)
        const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
        setDisplay(Math.round(target * eased))
        if (p < 1) raf = requestAnimationFrame(tick)
      }

      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }, [target])

    const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(display)
    return (
      <>
        {numericStr ? formatted : value}
        {numericStr ? suffix : ''}
      </>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50/50 via-white to-orange-50/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/50 hover:shadow-xl hover:bg-white/80 transition-all duration-300 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/40 to-orange-100/40 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl md:text-6xl font-bold font-inter bg-gradient-to-r from-[#2B6CB0] to-[#1E40AF] bg-clip-text text-transparent mb-4">
                    <AnimatedStatValue value={stat.value} />
                  </div>
                  
                  <div className="text-gray-700 font-opensans text-lg font-medium">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}