import React from 'react'
import { motion } from 'framer-motion'
import { Testimonial } from '@/types/landing'

interface TestimonialCardProps {
  testimonial: Testimonial
  index: number
}

export function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div 
      className="group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      {/* Clean card design */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        
        {/* Quote icon */}
        <div className="mb-4">
          <svg className="w-8 h-8 text-[#ED8936] opacity-60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </div>
        
        {/* Content */}
        <p className="text-gray-700 font-opensans leading-relaxed text-base mb-6 italic">
          "{testimonial.content}"
        </p>
        
        {/* Author section */}
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden mr-4 flex-shrink-0">
            <img 
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48'; }}
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 font-inter">
              {testimonial.name}
            </h4>
            <p className="text-sm text-gray-500 font-opensans">
              {testimonial.role}, {testimonial.location}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}