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
    <section className="py-0 bg-transparent relative">
      <div className="container px-4 mx-auto">
        <motion.div 
          className="bg-white shadow-lg rounded-xl py-6 px-8 -mt-20 relative z-10 max-w-4xl mx-auto border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Subtle background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2B6CB0]/3 via-transparent to-[#ED8936]/3"></div>
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#ED8936]/10 to-transparent rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-[#2B6CB0]/10 to-transparent rounded-full blur-3xl translate-x-12 translate-y-12"></div>
          
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="flex flex-col items-center group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Animated background blob */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2B6CB0]/10 to-[#ED8936]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110 blur-xl"></div>
                
                <motion.div 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold font-inter text-gray-900 mb-3 relative z-10"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <AnimatedStatValue value={stat.value} />
                </motion.div>
                
                <div className="text-gray-600 font-opensans text-sm md:text-base font-medium tracking-wide relative z-10 group-hover:text-gray-800 transition-colors duration-300">
                  {stat.label}
                </div>
                
                {/* Separator line */}
                {index < stats.length - 1 && (
                  <div className="hidden sm:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-px h-16 bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#2B6CB0]/20 via-[#ED8936]/20 to-[#2B6CB0]/20 p-[1px] opacity-50">
            <div className="w-full h-full bg-white rounded-2xl"></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}