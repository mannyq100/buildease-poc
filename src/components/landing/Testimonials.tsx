import React from 'react'
import { motion } from 'framer-motion'
import { Testimonial } from '@/types/landing'
import { TestimonialCard } from './TestimonialCard'

interface TestimonialsProps {
  testimonials: Testimonial[]
  onSignup: () => void
}

export function Testimonials({ testimonials, onSignup }: TestimonialsProps) {
  return (
    <section id="testimonials" className="py-16 bg-gray-50/50">
      <div className="container px-4 mx-auto">
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
            <span className="text-sm text-[#ED8936] font-medium uppercase tracking-wider">Testimonials</span>
            <div className="h-px bg-gray-200 w-16 ml-4"></div>
          </motion.div>
          
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
            className="text-gray-600 font-opensans text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Hear from builders who are transforming their projects with BuildEase.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Testimonials */}
          <div className="lg:col-span-2 space-y-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
            ))}
          </div>
          
          {/* Simple CTA */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm w-full">
              <div className="text-center">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold font-inter mb-3 text-gray-900">
                    Ready to get started?
                  </h3>
                  <p className="text-gray-600 font-opensans leading-relaxed">
                    Join builders using BuildEase to manage their projects efficiently.
                  </p>
                </div>
                
                {/* Features */}
                <div className="space-y-3 mb-8">
                  {[
                    'Completely free',
                    'No setup required',
                    'Start in minutes'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-3 text-[#ED8936]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
                
                {/* CTA Button */}
                <button
                  type="button"
                  className="w-full bg-[#ED8936] hover:bg-[#F56500] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 font-inter shadow-sm hover:shadow-md"
                  onClick={onSignup}
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}