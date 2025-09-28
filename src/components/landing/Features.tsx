import { motion } from 'framer-motion'
import { Feature } from '@/types/landing'
import { FeatureCard } from './FeatureCard'

interface FeaturesProps {
  features: Feature[]
}

export function Features({ features }: FeaturesProps) {
  return (
    <section id="features" className="py-16 relative">
      {/* Clean background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>

      <div className="container px-4 mx-auto relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="flex items-center justify-center mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-[#2B6CB0]/40 to-transparent w-20 mr-6"></div>
            <span className="text-sm text-[#2B6CB0] font-medium uppercase tracking-wider bg-[#2B6CB0]/10 px-4 py-2 rounded-full border border-[#2B6CB0]/20">Features</span>
            <div className="h-px bg-gradient-to-r from-transparent via-[#2B6CB0]/40 to-transparent w-20 ml-6"></div>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold font-inter mb-6 leading-tight text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Everything you need to manage your construction
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 mx-auto font-opensans text-lg md:text-xl leading-relaxed max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Powerful tools designed specifically for construction management, helping you stay on schedule and within budget.
          </motion.p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto auto-rows-min">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}