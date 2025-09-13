import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Process the OAuth or magic link callback
    const handleAuthCallback = async () => {
      // Get the auth code from the URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const queryParams = new URLSearchParams(window.location.search)
      
      // Show loading animation for at least 1 second for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      try {
        // Get the session to see if we're already authenticated
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Already have a session, redirect to dashboard
          // Session found, redirecting to dashboard
          navigate('/projects')
        } else {
          // No session yet, try to exchange the code if present
          if (hashParams.get('access_token') || queryParams.get('code')) {
            // Auth code or token found, exchanging...
            
            // Let Supabase handle the token exchange in the background
            const { data, error } = await supabase.auth.getUser()
            
            if (error) {
              console.error('Error exchanging auth code:', error)
              navigate('/login?error=auth-error&message=' + encodeURIComponent(error.message))
              return
            }
            
            if (!data.user) {
              console.error('No user returned after token exchange')
              navigate('/login?error=no-user')
              return
            }
            
            // Successfully authenticated
            // Successfully authenticated, redirecting
            
            // Get the return URL from localStorage if it exists
            const returnUrl = localStorage.getItem('returnUrl') || '/projects'
            // Clear the return URL from localStorage
            localStorage.removeItem('returnUrl')
            
            // Redirect to the return URL
            navigate(returnUrl)
          } else {
            // Check for error in URL parameters
            const errorParam = queryParams.get('error')
            const errorDescription = queryParams.get('error_description')
            
            if (errorParam) {
              console.error('OAuth error:', errorParam, errorDescription)
              navigate(`/login?error=${errorParam}&message=${encodeURIComponent(errorDescription || 'Authentication failed')}`)
              return
            }
            
            // No auth code or token found, redirect to login
            // No auth code or token found in URL, redirecting to login
            navigate('/login')
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        navigate(`/login?error=unknown&message=${encodeURIComponent(errorMessage)}`)
      }
    }
    
    handleAuthCallback()
  }, [navigate])
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 z-0"></div>
      <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] bg-repeat opacity-5 dark:opacity-10 z-0"></div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-[#2B6CB0]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[#ED8936]/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0"></div>
      <div className="w-full max-w-md mx-auto text-center relative z-10">
        {/* BuildEase logo and branding */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-6 mx-auto rounded-full bg-gradient-to-br from-[#2B6CB0] to-blue-600 shadow-md flex items-center justify-center">
          <svg 
            className="w-8 h-8 sm:w-10 sm:h-10 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white font-inter">
          Completing your sign in...
        </h1>
        
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 font-opensans">
          We're verifying your credentials and setting up your session
        </p>
        
        {/* Loading indicator - mobile friendly */}
        <div className="w-full max-w-sm mx-auto">
          <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-[#2B6CB0] dark:bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
