import React from 'react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Hero, Stats, Features, HowItWorks, Testimonials, WhoFor, LogoStrip, FeatureSpotlightRow, FAQ, FinalCta } from '@/components/landing'
import { LANDING_FEATURES_DATA, HOW_IT_WORKS_STEPS, LANDING_STATS, LANDING_TESTIMONIALS } from '@/data/constants/landing'
import { createFeaturesWithIcons } from '@/utils/landing'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Helmet } from 'react-helmet-async'

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
      navigate('/projects')
    }
  }

  const handleSignup = () => {
    if (isLoading) return
    
    if (!isAuthenticated) {
      navigate('/signup')
    } else {
      navigate('/projects')
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
      <Helmet>
        <title>BuildEase — Construction Management Made Simple</title>
        <meta name="description" content="Create projects, plan phases, control expenses, and track progress with BuildEase — a mobile‑first construction management platform for homeowners and contractors." />
        <meta property="og:title" content="BuildEase — Construction Management" />
        <meta property="og:description" content="Stay on schedule and within budget with a construction platform built for the field." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/construction-1.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/buildease-logo-1.svg" alt="BuildEase" className="h-6 mr-1.5" />
              <span className="text-base font-bold text-[#2B6CB0] font-inter">BuildEase</span>
            </div>
            
            <div className="hidden md:flex space-x-6 items-center">
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-medium text-xs font-opensans"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-medium text-xs font-opensans"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                onClick={(e) => scrollToSection(e, 'testimonials')}
                className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-medium text-xs font-opensans"
              >
                Testimonials
              </a>
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
            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="text-gray-600 hover:text-[#2B6CB0] transition-colors" aria-label="Menu">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white">
                  <SheetHeader>
                    <SheetTitle>
                      <div className="flex items-center">
                        <img src="/buildease-logo-1.svg" alt="BuildEase" className="h-6 mr-2" />
                        <span className="text-base font-bold text-[#2B6CB0] font-inter">BuildEase</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    <SheetClose asChild>
                      <a
                        href="#features"
                        onClick={(e) => scrollToSection(e, 'features')}
                        className="block px-2 py-3 text-gray-700 hover:text-[#2B6CB0] font-medium"
                      >
                        Features
                      </a>
                    </SheetClose>
                    <SheetClose asChild>
                      <a
                        href="#how-it-works"
                        onClick={(e) => scrollToSection(e, 'how-it-works')}
                        className="block px-2 py-3 text-gray-700 hover:text-[#2B6CB0] font-medium"
                      >
                        How It Works
                      </a>
                    </SheetClose>
                    <SheetClose asChild>
                      <a
                        href="#testimonials"
                        onClick={(e) => scrollToSection(e, 'testimonials')}
                        className="block px-2 py-3 text-gray-700 hover:text-[#2B6CB0] font-medium"
                      >
                        Testimonials
                      </a>
                    </SheetClose>
                    <div className="pt-4 flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={handleLogin} disabled={isLoading}>Log in</Button>
                      <Button className="flex-1 bg-[#ED8936] hover:bg-orange-500 text-white" onClick={handleSignup} disabled={isLoading}>Get Started</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <Hero onSignup={handleSignup} onScrollToSection={scrollToSection} />

      {/* Stats Section */}
      <Stats stats={LANDING_STATS} />

      {/* Logo Strip */}
      <LogoStrip />

      {/* Features Section */}
      <Features features={features} />

      {/* Audience Section */}
      <WhoFor />

      {/* Feature Spotlights */}
      <FeatureSpotlightRow
        title="Budget & Expenses"
        description="Track planned vs. actuals, approve in batches, and export reports to keep everyone aligned."
        bullets={[
          'Pending/Approved/Paid statuses',
          'Filters and batch actions',
          'CSV export for finance reviews',
        ]}
        imageSrc="/images/construction-3.jpg"
        imageAlt="Budget and expenses management"
      />
      <FeatureSpotlightRow
        title="Documents & Media"
        description="Auto-save profile and inspiration images, and organize permits and contracts in one place."
        bullets={[
          'Supabase Storage-backed files',
          'Auto-save uploads with instant preview',
          'Organized by category for fast lookup',
        ]}
        imageSrc="/images/house-construction.jpg"
        imageAlt="Documents and media management"
        reverse
      />

      {/* How BuildEase Works Section */}
      <HowItWorks steps={HOW_IT_WORKS_STEPS} />

      {/* Testimonials and CTA Section */}
      <Testimonials testimonials={LANDING_TESTIMONIALS} onSignup={handleSignup} />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <FinalCta onSignup={handleSignup} />

      {/* Footer */}
      <footer className="bg-white text-gray-800 py-6 border-t border-gray-200">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/buildease-logo-1.svg" alt="BuildEase" className="h-8 mr-2" />
              <span className="text-base font-medium font-inter text-[#2B6CB0]">BuildEase</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mb-4 md:mb-0 text-xs">
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-opensans"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-opensans"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                onClick={(e) => scrollToSection(e, 'testimonials')}
                className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-opensans"
              >
                Testimonials
              </a>
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