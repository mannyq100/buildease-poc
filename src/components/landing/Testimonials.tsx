import React from 'react'
import { motion } from 'framer-motion'
import { Testimonial } from '@/types/landing'
import { TestimonialCard } from './TestimonialCard'

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section id="testimonials" className="py-16 bg-gradient-to-br from-blue-50/40 via-gray-50/60 to-orange-50/40 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-16 left-16 w-32 h-32 bg-gradient-to-br from-blue-200/25 to-indigo-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-16 right-16 w-40 h-40 bg-gradient-to-tl from-orange-200/25 to-yellow-200/20 rounded-full blur-3xl"></div>
      
      <div className="container px-4 mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          className="max-w-4xl mx-auto mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm text-[#ED8936] font-medium uppercase tracking-wider bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200/50 px-6 py-3 rounded-full shadow-sm mb-6 inline-block">Testimonials</span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold font-inter mb-4 leading-tight text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            What our users say
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 font-opensans text-lg leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Hear from builders who are transforming their projects with BuildEase.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}