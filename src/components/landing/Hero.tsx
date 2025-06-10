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
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/85 to-[#1E293B]/80 z-10"></div>
        <img 
          src="/images/construction-01.png" 
          alt="Construction site" 
          className="w-full h-full object-cover scale-105"
        />
      </div>

      {/* Subtle floating elements */}
      <div className="absolute inset-0 z-15">
        <div className="absolute top-20 right-10 w-20 h-20 bg-gradient-to-br from-[#ED8936]/20 to-[#F56500]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-10 w-16 h-16 bg-gradient-to-tr from-[#2B6CB0]/20 to-[#1E40AF]/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-br from-[#10B981]/15 to-[#059669]/8 rounded-full blur-xl opacity-50" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative z-20 h-full flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Trust Badge */}
            <motion.div 
              className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm font-medium text-white/90 font-inter">Trusted by Construction Professionals</span>
            </motion.div>
           
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-inter mb-8 tracking-tight leading-tight text-white">
              Build with{' '}
              <span className="bg-gradient-to-r from-[#ED8936] via-[#F59E0B] to-[#F56500] bg-clip-text text-transparent">
                Confidence
              </span>
              <br />
              Manage with{' '}
              <span className="bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#2563EB] bg-clip-text text-transparent">
                Ease
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 font-opensans mb-12 leading-relaxed max-w-3xl mx-auto">
              The all-in-one construction management platform that helps you stay on schedule, within budget, and stress-free.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
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
              className="flex flex-wrap justify-center items-center gap-8 text-white/80 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {[
                'Completely Free',
                'No Setup Required', 
                'Start Building Today'
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
      </div>
    </section>
  )
}