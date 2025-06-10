import React from 'react'
import { motion } from 'framer-motion'
import { Step } from '@/types/landing'

interface HowItWorksProps {
  steps: Step[]
}

export function HowItWorks({ steps }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="max-w-3xl mx-auto mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="flex items-center justify-center mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="h-px bg-gray-200 w-16 mr-4"></div>
            <span className="text-sm text-[#ED8936] font-medium uppercase tracking-wider">How It Works</span>
            <div className="h-px bg-gray-200 w-16 ml-4"></div>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold font-inter mb-4 leading-tight text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Simple steps to get started
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 font-opensans text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Follow these easy steps to start managing your construction projects efficiently.
          </motion.p>
        </motion.div>
        
        {/* Steps Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="flex items-start group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                {/* Number circle */}
                <div className="flex-shrink-0 w-12 h-12 bg-[#ED8936] text-white rounded-xl flex items-center justify-center font-semibold text-lg mr-4 group-hover:bg-[#F56500] transition-colors duration-300">
                  {step.number}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 font-inter mb-2 group-hover:text-gray-800 transition-colors duration-300">
                    {step.title}
                  </h4>
                  
                  <p className="text-gray-600 font-opensans leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}