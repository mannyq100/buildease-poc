import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Define types for our features
interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

// Define types for our steps
interface Step {
  number: number
  title: string
  description: string
}

export function LandingPage() {
  // Features section data
  const features: Feature[] = [
    {
      title: 'Project Dashboard',
      description: 'Get a complete overview of your project status, tasks, and expenses all in one place.',
      icon: (
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Budget Tracking',
      description: 'Track your expenses against your budget and get alerts when approaching limits.',
      icon: (
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Schedule Management',
      description: 'Plan and track your construction timeline with interactive Gantt chart and notifications.',
      icon: (
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Team Collaboration',
      description: 'Coordinate with contractors, suppliers, and team members through a virtual platform.',
      icon: (
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Material Management',
      description: 'Keep track of all your building materials, inventory, and deliveries to prevent delays.',
      icon: (
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Document Management',
      description: 'Store and organize all your construction documents, permits, and contracts in one secure location.',
      icon: (
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      ),
    },
  ]

  // How it works steps
  const steps: Step[] = [
    {
      number: 1,
      title: 'Create your project',
      description: 'Set up your construction project with details.',
    },
    {
      number: 2,
      title: 'Add your team',
      description: 'Invite contractors, suppliers, and team members to collaborate on your project.',
    },
    {
      number: 3,
      title: 'Track progress',
      description: 'Monitor construction progress in real time with photos, updates, and milestone tracking.',
    },
    {
      number: 4,
      title: 'Complete on budget',
      description: 'Finish your construction project on time and within budget with BuildEase\'s tools.',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="container flex items-center justify-between px-4 py-3 mx-auto">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/buildease-logo-1.svg" alt="BuildEase" className="h-8" />
            <span className="ml-2 text-xl font-semibold text-blue-600">BuildEase</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
            <Link to="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How It Works</Link>
            <Link to="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</Link>
            <Link to="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Testimonials</Link>
          </nav>

          {/* Authentication Buttons */}
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors">Log In</Link>
            <Link to="/register" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-cover bg-center" style={{ 
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(/images/construction-01.png)',
        backgroundSize: 'cover',
        minHeight: '600px'
      }}>
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Manage your construction with <span className="text-blue-400">confidence</span>
              </h1>
              <p className="mt-4 text-lg text-gray-200">
                BuildEase helps individual home builders in Ghana manage their construction projects efficiently. Track expenses, schedule tasks, manage materials, and finish your project on time and within budget.
              </p>
              <div className="flex flex-col sm:flex-row mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium text-center transition-colors"
                >
                  Get Started Free
                </Link>
                <a
                  href="#how-it-works"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-md font-medium text-center transition-colors"
                >
                  Learn How It Works
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 mx-auto ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold">1,500+</div>
              <div className="text-blue-500 mt-2">Projects Completed</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold">30%</div>
              <div className="text-blue-500 mt-2">Time Saved</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold">97%</div>
              <div className="text-blue-500 mt-2">Satisfied Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to manage your construction</h2>
            <p className="mt-4 text-lg text-gray-600">
              BuildEase provides a comprehensive set of tools to help you manage your construction project from start to finish.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-blue-600 mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <motion.div
                className="rounded-lg overflow-hidden shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src="/images/construction-2.jpg" 
                  alt="Construction project in Ghana" 
                  className="w-full h-auto object-cover rounded-lg"
                  style={{ maxHeight: '400px' }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How BuildEase Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Getting started with BuildEase is easy. Follow these simple steps to transform your construction management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <motion.div
                className="rounded-lg overflow-hidden shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src="/images/construction-3.jpg" 
                  alt="Construction management in Ghana" 
                  className="w-full h-auto object-cover rounded-lg"
                  style={{ maxHeight: '400px' }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Background Image */}
      <section className="py-16 bg-cover bg-center text-white" style={{ 
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(/images/construction-4.jpg)',
        backgroundSize: 'cover'
      }}>
        <div className="container px-4 mx-auto text-center">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to transform your construction management?</h2>
            <p className="text-lg mb-8">
              Join thousands of builders in Ghana who are using BuildEase to complete projects on time and within budget.
            </p>
            <Link
              to="/register"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md font-medium inline-block transition-colors"
            >
              Get Started Today
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <img src="/buildease-logo-1.svg" alt="BuildEase" className="h-8 invert" />
                <span className="ml-2 text-xl font-semibold">BuildEase</span>
              </div>
              <p className="mt-4 text-gray-400">
                Empowering home builders in Ghana with modern construction management tools.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} BuildEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
