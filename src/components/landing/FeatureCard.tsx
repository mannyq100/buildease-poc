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
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 hover:shadow-xl hover:bg-white/90 transition-all duration-300 group relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/40 to-orange-100/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-[#2B6CB0]/10 to-[#2B6CB0]/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-[#2B6CB0]/20 group-hover:to-[#2B6CB0]/30 transition-all duration-300 shadow-sm">
          <div className="text-[#2B6CB0] text-xl">
            {feature.icon}
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 font-inter mb-3 group-hover:text-[#2B6CB0] transition-colors duration-300">
          {feature.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 font-opensans leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  )
}