import React from 'react'
import { motion } from 'framer-motion'

interface HeroProps {
  onSignup: () => void
  onScrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => void
}
export function Hero({ onSignup, onScrollToSection }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-16" style={{ minHeight: '90vh' }}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-gray-800/80 to-[#1E293B]/75 z-10"></div>
        <img 
          src="/images/construction-01.png" 
          alt="Construction site" 
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute bottom-32 left-10 w-16 h-16 bg-gradient-to-tr from-[#2B6CB0]/20 to-[#1E40AF]/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-br from-[#10B981]/15 to-[#059669]/8 rounded-full blur-xl opacity-50" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-16 md:py-20 relative z-20 h-full flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
          {/* Left: Value prop */}
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Trust Badge */}
              <motion.div 
              className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-white/90 font-inter">Trusted by Construction Professionals</span>
              </motion.div>
             
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-inter mb-6 tracking-tight leading-tight text-white">
                Run construction projects on time and on budget.
              </h1>
              
              <p className="text-lg md:text-xl text-gray-200 font-opensans mb-10 leading-relaxed max-w-2xl md:max-w-none mx-auto md:mx-0">
                Create a project, plan phases, control expenses, track progress, and deliver with confidence—built for the field.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center md:justify-start items-center mb-10">
                <motion.button
                  type="button"
                  className="group bg-gradient-to-r from-[#ED8936] via-[#F59E0B] to-[#F56500] hover:from-[#F56500] hover:to-[#EA580C] text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 font-inter shadow-2xl hover:shadow-orange-500/40 transform hover:scale-105 min-w-[220px] relative overflow-hidden"
                  onClick={onSignup}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
                
                <motion.a
                  href="#how-it-works"
                  className="group bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/20 hover:border-white/50 px-10 py-4 rounded-full text-lg font-medium transition-all duration-300 font-inter flex items-center min-w-[220px] justify-center"
                  onClick={(e) => onScrollToSection(e, 'how-it-works')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch Demo
                </motion.a>
              </div>
              
              {/* Trust Indicators */}
              <motion.div 
              className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-8 text-white/80 text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {[
                  'Completely Free',
                  'No Setup Required', 
                  'Start Building today'
                ].map((text, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Product mockup */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3 md:p-4 shadow-2xl">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#2B6CB0]/40 via-transparent to-[#ED8936]/40 blur-lg opacity-40 pointer-events-none" />
              <div className="relative rounded-xl overflow-hidden ring-1 ring-white/20">
                <img
                  src="/images/house-construction.jpg"
                  alt="BuildEase project overview"
                  className="w-full h-[260px] md:h-[360px] object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="h-16 rounded-md bg-white/10 ring-1 ring-white/10"></div>
                <div className="h-16 rounded-md bg-white/10 ring-1 ring-white/10"></div>
                <div className="h-16 rounded-md bg-white/10 ring-1 ring-white/10"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}