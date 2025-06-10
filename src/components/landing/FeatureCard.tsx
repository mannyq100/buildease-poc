import React from 'react'
import { motion } from 'framer-motion'
import { Feature } from '@/types/landing'

interface FeatureCardProps {
  feature: Feature
  index: number
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      {/* Clean card design */}
      <div className="relative bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-200">
        
        {/* Subtle hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-[#ED8936]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="mb-6">
            <motion.div 
              className="inline-flex p-3 rounded-lg bg-gray-50 group-hover:bg-[#ED8936]/10 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="group-hover:text-[#ED8936] transition-colors duration-300">
                {feature.icon}
              </div>
            </motion.div>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 font-inter mb-3 group-hover:text-gray-800 transition-colors duration-300">
            {feature.title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 font-opensans leading-relaxed text-base">
            {feature.description}
          </p>
          
          {/* Subtle hover indicator */}
          <motion.div 
            className="mt-4 w-8 h-0.5 bg-[#ED8936] opacity-0 group-hover:opacity-100 transition-all duration-300"
            initial={{ width: 0 }}
            whileInView={{ width: 32 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  )
}