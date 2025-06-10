import React from 'react'
import { motion } from 'framer-motion'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

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
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  // Handle login click with React 19 compatibility
  const handleLogin = () => {
    console.log('handleLogin clicked. isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    // Prevent navigation during loading state
    if (isLoading) {
      console.log('Navigation prevented: authentication state is still loading');
      return;
    }
    
    // Only navigate if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      // If already authenticated, go to dashboard instead
      navigate('/dashboard');
    }
  };

  // Handle signup click with React 19 compatibility
  const handleSignup = () => {
    console.log('handleSignup clicked. isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    // Prevent navigation during loading state
    if (isLoading) {
      console.log('Navigation prevented: authentication state is still loading');
      return;
    }
    
    // Only navigate if not authenticated
    if (!isAuthenticated) {
      navigate('/signup');
    } else {
      // If already authenticated, go to dashboard instead
      navigate('/dashboard');
    }
  };

  // Handle smooth scrolling for anchor links
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Features section data
  const features: Feature[] = [
    {
      title: 'Project Dashboard',
      description: 'Get a complete overview of your project status, tasks, and expenses all in one place.',
      icon: (
        <div className="p-2 bg-[#2B6CB0]/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#2B6CB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Budget Tracking',
      description: 'Track your expenses against your budget and get alerts when approaching limits.',
      icon: (
        <div className="p-2 bg-[#2B6CB0]/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#2B6CB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Schedule Management',
      description: 'Plan and track your construction timeline with interactive Gantt chart and notifications.',
      icon: (
        <div className="p-2 bg-[#2B6CB0]/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#2B6CB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Team Collaboration',
      description: 'Coordinate with contractors, suppliers, and team members through a virtual platform.',
      icon: (
        <div className="p-2 bg-[#2B6CB0]/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#2B6CB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Material Management',
      description: 'Keep track of all your building materials, inventory, and deliveries to prevent delays.',
      icon: (
        <div className="p-2 bg-[#2B6CB0]/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#2B6CB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Document Management',
      description: 'Store and organize all your construction documents, permits, and contracts in one secure location.',
      icon: (
        <div className="p-2 bg-[#2B6CB0]/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#2B6CB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/buildease-logo-1.svg" alt="BuildEase" className="h-6 mr-1.5" />
              <span className="text-base font-bold text-[#2B6CB0] font-inter">BuildEase</span>
            </div>
            
            <div className="hidden md:flex space-x-6 items-center">
              <a href="#features" className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-medium text-xs font-opensans">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-medium text-xs font-opensans">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-medium text-xs font-opensans">Testimonials</a>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 text-[#2B6CB0] border-[#2B6CB0] hover:bg-[#2B6CB0]/10 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 transition-all duration-300 font-medium rounded-md min-h-[44px]"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="h-4 w-4 mr-2 rounded-full border-2 border-[#2B6CB0] border-t-transparent animate-spin"></span>
                      Loading...
                    </span>
                  ) : 'Log in'}
                </Button>
                <Button
                  variant="default"
                  className="w-full sm:w-auto h-12 bg-[#ED8936] hover:bg-orange-500 text-white font-medium rounded-md min-h-[44px] transition-all duration-300 shadow-sm hover:shadow-orange-500/20"
                  onClick={handleSignup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      Loading...
                    </span>
                  ) : 'Sign Up Free'}
                </Button>
              </div>
            </div>
            
            <button className="md:hidden text-gray-600 hover:text-[#2B6CB0] transition-colors" aria-label="Menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative text-white pt-16" style={{ minHeight: '70vh' }}>
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-[#1E293B]/70 z-10"></div>
          <img 
            src="/images/construction-01.png" 
            alt="Construction site" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 py-8 relative z-20 h-full flex flex-col justify-center">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
             
              <h1 className="text-3xl md:text-4xl font-bold font-inter mb-3 tracking-tight leading-tight">
                Manage your construction projects with <span className="text-[#2B6CB0]">confidence</span>
              </h1>
              <p className="text-sm text-gray-200 font-opensans mb-4 leading-relaxed">
                BuildEase provides all the tools you need to manage construction projects efficiently, saving time and reducing stress.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="bg-[#ED8936] hover:bg-orange-500 text-white px-4 py-2 rounded text-xs font-medium transition-all duration-300 font-inter shadow-sm hover:shadow-orange-500/20"
                  onClick={handleSignup}
                >
                  Get Started Free
                </button>
                <a
                  href="#how-it-works"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 px-4 py-2 rounded text-xs font-medium transition-all duration-300 font-inter"
                  onClick={(e) => scrollToSection(e, 'how-it-works')}
                >
                  Learn How It Works
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-0 bg-transparent">
        <div className="container px-4 mx-auto">
          <div className="bg-white shadow-sm rounded-xl py-4 px-6 -mt-20 relative z-10 max-w-4xl mx-auto border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center group">
                <div className="text-2xl md:text-3xl font-bold font-inter text-[#2B6CB0] mb-1 group-hover:text-[#ED8936] transition-colors duration-300">1,500+</div>
                <div className="text-gray-500 font-opensans text-xs uppercase tracking-wider">Projects Completed</div>
              </div>
              <div className="flex flex-col items-center group">
                <div className="text-2xl md:text-3xl font-bold font-inter text-[#2B6CB0] mb-1 group-hover:text-[#ED8936] transition-colors duration-300">30%</div>
                <div className="text-gray-500 font-opensans text-xs uppercase tracking-wider">Time Saved</div>
              </div>
              <div className="flex flex-col items-center group">
                <div className="text-2xl md:text-3xl font-bold font-inter text-[#2B6CB0] mb-1 group-hover:text-[#ED8936] transition-colors duration-300">97%</div>
                <div className="text-gray-500 font-opensans text-xs uppercase tracking-wider">Schedule Management</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50/50">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex items-center justify-center mb-3">
              <div className="h-px bg-gray-300 w-8 mr-4"></div>
              <span className="text-sm text-[#2B6CB0] font-medium uppercase tracking-wider">Features</span>
              <div className="h-px bg-gray-300 w-8 ml-4"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-inter mb-3 text-center">Everything you need to manage your construction</h2>
            <p className="text-gray-600 mx-auto font-opensans text-center text-sm">Powerful tools designed specifically for construction management, helping you stay on schedule and within budget.</p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10 max-w-6xl mx-auto">
            {features.slice(0, 6).map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col bg-white rounded-lg p-4 hover:shadow-sm transition-all duration-300 border border-gray-100 group hover:border-[#2B6CB0]/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -3 }}
              >
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-[#2B6CB0]/10 text-[#2B6CB0] rounded-md flex items-center justify-center mr-2 flex-shrink-0 group-hover:bg-[#2B6CB0] group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-medium text-gray-800 font-inter">{feature.title}</h3>
                </div>
                <p className="text-gray-600 font-opensans leading-relaxed text-xs">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* How BuildEase Works Section */}
          <div id="how-it-works" className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto mb-10">
                <div className="flex items-center justify-center mb-3">
                  <div className="h-px bg-gray-300 w-8 mr-4"></div>
                  <span className="text-sm text-[#2B6CB0] font-medium uppercase tracking-wider">How It Works</span>
                  <div className="h-px bg-gray-300 w-8 ml-4"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-inter mb-3 text-center">How BuildEase works</h2>
                <p className="text-gray-600 font-opensans mx-auto text-center text-sm">
                  Getting started with BuildEase is easy. Follow these simple steps to transform your construction management.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
                <div>
                  <img 
                    src="/images/house-construction.jpg" 
                    alt="Construction project" 
                    className="w-full h-auto object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                  />
                </div>
                <div>
                  <div className="space-y-6">
                    {steps.map((step, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-start"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ x: 3 }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#ED8936] to-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3 min-h-[32px] shadow-sm">
                          {step.number}
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900 font-inter mb-1">{step.title}</h4>
                          <p className="text-gray-600 font-opensans leading-relaxed text-xs">{step.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* What Our Clients Say and CTA Section */}
      <section id="testimonials" className="py-16 bg-gray-50/50">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* What Our Clients Say */}
            <div>
              <div className="mb-6">
                <div className="flex items-start mb-3">
                  <div className="h-px bg-gray-300 w-8 mr-4 mt-3"></div>
                  <span className="text-sm text-[#2B6CB0] font-medium uppercase tracking-wider">Testimonials</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-inter mb-3">What Our Clients Say</h2>
              </div>
              
              <div className="space-y-4">
                <motion.div 
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-2 flex-shrink-0 border border-[#2B6CB0]/20">
                      <img 
                        src="/images/avatars/person-2.jpg" 
                        alt="Kofi Mensah"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/50'; }}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 font-inter text-xs">Kofi Mensah</h4>
                      <p className="text-xs text-gray-500 font-opensans">Client Builder, Accra</p>
                    </div>
                  </div>
                  <p className="text-gray-700 font-opensans leading-relaxed text-xs">
                    "BuildEase has all I needed for my dream journey as a first-time homebuilder. It helped me stay organized!"
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-2 flex-shrink-0 border border-[#2B6CB0]/20">
                      <img 
                        src="/images/avatars/person-3.jpg" 
                        alt="Ama Owusu"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/50'; }}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 font-inter text-xs">Ama Owusu</h4>
                      <p className="text-xs text-gray-500 font-opensans">Small Contractor, Kumasi</p>
                    </div>
                  </div>
                  <p className="text-gray-700 font-opensans leading-relaxed text-xs">
                    "As a contractor, I find the tools so easy to use. My clients love how transparent the process is!"
                  </p>
                </motion.div>
              </div>
            </div>
            
            {/* Get Started Today CTA */}
            <div className="flex items-center">
              <motion.div 
                className="bg-white rounded-lg overflow-hidden shadow-sm w-full hover:shadow-md transition-all duration-300 border border-gray-100"
                whileHover={{ scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex flex-col h-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
                    <img 
                      src="/images/avatars/person-4.jpg" 
                      alt="Construction site" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#2B6CB0] text-white text-xs uppercase tracking-wider py-1 px-2 rounded-full font-medium text-[10px]">
                      Start Now
                    </div>
                  </div>
                  <div className="p-4 flex-grow">
                    <div className="h-full flex flex-col justify-center">
                      <h2 className="text-xl font-bold mb-2 text-gray-900 font-inter">Get Started Today</h2>
                      <p className="text-sm mb-4 text-gray-600 font-opensans leading-relaxed">
                        Join thousands of builders who are using BuildEase to complete projects on time and within budget.
                      </p>
                      <div>
                        <button
                          type="button"
                          className="bg-gradient-to-r from-[#2B6CB0] to-[#2B6CB0] hover:from-[#2B6CB0] hover:to-[#ED8936] text-white px-4 py-2 rounded-md font-medium inline-block transition-all duration-500 min-h-[36px] font-inter shadow-sm hover:shadow-lg text-sm"
                          onClick={handleSignup}
                        >
                          Get Started Free
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-800 py-6 border-t border-gray-200">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/buildease-logo-1.svg" alt="BuildEase" className="h-8 mr-2" />
              <span className="text-base font-medium font-inter text-[#2B6CB0]">BuildEase</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mb-4 md:mb-0 text-xs">
              <a href="#features" className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-opensans">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-opensans">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-opensans">Testimonials</a>
              <a href="#" className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-opensans">Terms</a>
              <a href="#" className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-opensans">Privacy</a>
            </div>
            
            <div className="text-xs text-gray-500 font-opensans">
              &copy; {new Date().getFullYear()} BuildEase. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage