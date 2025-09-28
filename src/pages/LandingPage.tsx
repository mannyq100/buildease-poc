import React from 'react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Hero, Features, HowItWorks, Testimonials, WhoFor, LogoStrip, FeatureSpotlightRow, FAQ, FinalCta } from '@/components/landing'
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-orange-50/20" role="main">
      <Helmet>
        <title>BuildEase — Construction Management Made Simple</title>
        <meta name="description" content="Create projects, plan phases, control expenses, and track progress with BuildEase — a mobile‑first construction management platform for homeowners and contractors." />
        <meta property="og:title" content="BuildEase — Construction Management" />
        <meta property="og:description" content="Stay on schedule and within budget with a construction platform built for the field." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/landing/hero-page-2.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/buildease-logo-1.svg" alt="BuildEase" className="h-7 mr-2" />
              <span className="text-lg font-bold text-[#2B6CB0] font-inter">BuildEase</span>
            </div>
            
            <div className="hidden md:flex space-x-8 items-center">
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="text-gray-700 hover:text-[#2B6CB0] transition-colors font-medium text-sm font-opensans"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="text-gray-700 hover:text-[#2B6CB0] transition-colors font-medium text-sm font-opensans"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                onClick={(e) => scrollToSection(e, 'testimonials')}
                className="text-gray-700 hover:text-[#2B6CB0] transition-colors font-medium text-sm font-opensans"
              >
                Testimonials
              </a>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="text-[#2B6CB0] border-[#2B6CB0] hover:bg-[#2B6CB0]/5 transition-colors font-medium px-6 py-2 h-10"
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
                  className="bg-[#ED8936] hover:bg-[#DD7324] text-white font-medium px-6 py-2 h-10 transition-colors"
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
                  <button className="text-gray-700 hover:text-[#2B6CB0] transition-colors p-2" aria-label="Menu">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white w-80">
                  <SheetHeader className="pb-6">
                    <SheetTitle>
                      <div className="flex items-center">
                        <img src="/buildease-logo-1.svg" alt="BuildEase" className="h-7 mr-2" />
                        <span className="text-lg font-bold text-[#2B6CB0] font-inter">BuildEase</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6">
                    <nav className="space-y-1">
                      <SheetClose asChild>
                        <a
                          href="#features"
                          onClick={(e) => scrollToSection(e, 'features')}
                          className="block px-4 py-3 text-gray-700 hover:text-[#2B6CB0] hover:bg-gray-50 font-medium rounded-lg transition-colors"
                        >
                          Features
                        </a>
                      </SheetClose>
                      <SheetClose asChild>
                        <a
                          href="#how-it-works"
                          onClick={(e) => scrollToSection(e, 'how-it-works')}
                          className="block px-4 py-3 text-gray-700 hover:text-[#2B6CB0] hover:bg-gray-50 font-medium rounded-lg transition-colors"
                        >
                          How It Works
                        </a>
                      </SheetClose>
                      <SheetClose asChild>
                        <a
                          href="#testimonials"
                          onClick={(e) => scrollToSection(e, 'testimonials')}
                          className="block px-4 py-3 text-gray-700 hover:text-[#2B6CB0] hover:bg-gray-50 font-medium rounded-lg transition-colors"
                        >
                          Testimonials
                        </a>
                      </SheetClose>
                    </nav>
                    <div className="flex flex-col gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        className="text-[#2B6CB0] border-[#2B6CB0] hover:bg-[#2B6CB0]/5 h-12" 
                        onClick={handleLogin} 
                        disabled={isLoading}
                      >
                        Log in
                      </Button>
                      <Button 
                        className="bg-[#ED8936] hover:bg-[#DD7324] text-white h-12" 
                        onClick={handleSignup} 
                        disabled={isLoading}
                      >
                        Get Started
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section with Integrated Stats */}
      <Hero onSignup={handleSignup} onScrollToSection={scrollToSection} stats={LANDING_STATS} />

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
        imageSrc="/images/landing/budget-expenses.png"
        imageAlt="Budget and expenses management"
      />
      <FeatureSpotlightRow
        title="Schedule Tracking"
        description="Track milestones and timelines to keep projects on time with visual progress indicators."
        bullets={[
          'Visual timeline with milestones',
          'Automatic progress tracking',
          'Deadline alerts and notifications',
        ]}
        imageSrc="/images/landing/schedule-tracking.png"
        imageAlt="Schedule tracking and timeline management"
        reverse
      />
      <FeatureSpotlightRow
        title="Flexible Project Phases"
        description="Use templates or build your own workflow with customizable phases and default tasks."
        bullets={[
          'Pre-built phase templates',
          'Custom workflow creation',
          'Task management per phase',
        ]}
        imageSrc="/images/landing/phases.png"
        imageAlt="Project phases and workflow management"
      />

      {/* How BuildEase Works Section */}
      <HowItWorks steps={HOW_IT_WORKS_STEPS} />

      {/* Testimonials Section */}
      <Testimonials testimonials={LANDING_TESTIMONIALS} />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <FinalCta onSignup={handleSignup} />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center mb-6 md:mb-0">
              <img src="/buildease-logo-1.svg" alt="BuildEase" className="h-8 mr-2" />
              <span className="text-lg font-bold font-inter text-[#2B6CB0]">BuildEase</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-medium text-sm font-opensans"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-medium text-sm font-opensans"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                onClick={(e) => scrollToSection(e, 'testimonials')}
                className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-medium text-sm font-opensans"
              >
                Testimonials
              </a>
              <a href="#" className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-medium text-sm font-opensans">Terms</a>
              <a href="#" className="text-gray-600 hover:text-[#2B6CB0] transition-colors font-medium text-sm font-opensans">Privacy</a>
            </div>
            
            <div className="text-sm text-gray-500 font-opensans">
              &copy; {new Date().getFullYear()} BuildEase. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage