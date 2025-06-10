import React from 'react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Hero, Stats, Features, HowItWorks, Testimonials } from '@/components/landing'
import { LANDING_FEATURES_DATA, HOW_IT_WORKS_STEPS, LANDING_STATS, LANDING_TESTIMONIALS } from '@/data/constants/landing'
import { createFeaturesWithIcons } from '@/utils/landing'

export function LandingPage() {
  const { isAuthenticated, isLoading } = useSupabaseAuth()
  const navigate = useNavigate()

  // Convert feature data to features with JSX icons
  const features = createFeaturesWithIcons(LANDING_FEATURES_DATA)

  const handleLogin = () => {
    if (isLoading) return
    
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      navigate('/dashboard')
    }
  }

  const handleSignup = () => {
    if (isLoading) return
    
    if (!isAuthenticated) {
      navigate('/signup')
    } else {
      navigate('/dashboard')
    }
  }

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
                  ) : 'Get Started'}
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
      <Hero onSignup={handleSignup} onScrollToSection={scrollToSection} />

      {/* Stats Section */}
      <Stats stats={LANDING_STATS} />

      {/* Features Section */}
      <Features features={features} />

      {/* How BuildEase Works Section */}
      <HowItWorks steps={HOW_IT_WORKS_STEPS} />

      {/* Testimonials and CTA Section */}
      <Testimonials testimonials={LANDING_TESTIMONIALS} onSignup={handleSignup} />

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