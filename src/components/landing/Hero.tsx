import React from 'react'
import { motion } from 'framer-motion'
import { Stat } from '@/types/landing'

interface HeroProps {
  onSignup: () => void
  onScrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => void
  stats: Stat[]
}

export function Hero({ onSignup, onScrollToSection, stats }: HeroProps) {
  // Animated stat value component
  function AnimatedStatValue({ value }: { value: string }) {
    const match = value.match(/[0-9,.]+/)
    const numericStr = match ? match[0] : ''
    const suffix = match ? value.slice(match[0].length) : value
    const target = Number(numericStr.replace(/,/g, '')) || 0

    const [display, setDisplay] = React.useState(0)

    React.useEffect(() => {
      let raf = 0
      const duration = 1200 // ms
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
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-orange-50/30 pt-16 min-h-screen flex flex-col overflow-hidden">
      {/* Enhanced Dark Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-blue-900/50 z-10"></div>
        <img 
          src="/images/landing/hero-page-2.png" 
          alt="Modern construction site with workers and equipment" 
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-orange-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-blue-300/20 rounded-full blur-2xl"></div>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-14 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Left: Value proposition */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Trust Badge */}
                <div className="inline-flex items-center bg-gradient-to-r from-emerald-50/90 to-green-50/90 backdrop-blur-sm border border-emerald-200/80 rounded-full px-6 py-3 mb-6 shadow-lg">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-800 font-inter">Trusted by Construction Professionals</span>
                </div>
               
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-inter mb-6 tracking-tight leading-[1.1] text-white drop-shadow-lg">
                  <span className="whitespace-nowrap">Build with Confidence</span>
                  <br/>
                  <span className="bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent whitespace-nowrap">
                    Manage with Ease
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-100 font-opensans mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-md">
                  Create projects, plan phases, control expenses, and track progress with confidence—built for the field.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
                  <button
                    type="button"
                    className="bg-gradient-to-r from-[#ED8936] to-[#DD7324] hover:from-[#DD7324] hover:to-[#CC6214] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 font-inter shadow-xl hover:shadow-2xl transform hover:scale-105 min-w-[200px]"
                    onClick={onSignup}
                  >
                    Get Started Free
                  </button>
                  
                  <a
                    href="#how-it-works"
                    className="text-white hover:text-gray-200 border-2 border-white/40 hover:border-white/60 backdrop-blur-sm bg-white/10 hover:bg-white/20 px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 font-inter flex items-center min-w-[200px] justify-center shadow-lg hover:shadow-xl"
                    onClick={(e) => onScrollToSection(e, 'how-it-works')}
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Watch Demo
                  </a>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-8 text-white/90 text-sm">
                  {[
                    'Completely Free',
                    'No Setup Required', 
                    'Start Building Today'
                  ].map((text, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="drop-shadow-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Product preview */}
            <motion.div 
              className="relative flex justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 border border-white/20 max-w-m w-full">
                <div className="rounded-xl overflow-hidden">
                  <img
                    src="/images/landing/projects-dashboard.png"
                    alt="BuildEase projects dashboard showing project overview and progress tracking"
                    className="w-full h-[300px] md:h-[300px] lg:h-[450px] object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="h-14 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200"></div>
                  <div className="h-14 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200"></div>
                  <div className="h-14 rounded-lg bg-gradient-to-r from-orange-100 to-orange-200"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section - Integrated at bottom */}
      <div className="relative z-20 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 relative overflow-hidden group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-orange-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="text-4xl md:text-5xl font-bold font-inter bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent mb-3 drop-shadow-lg">
                      <AnimatedStatValue value={stat.value} />
                    </div>
                    
                    <div className="text-white/90 font-opensans text-base md:text-lg font-medium drop-shadow-sm">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}