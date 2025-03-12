import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../types/auth';

// Since we don't have react-icons, let's use simple SVG components
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
      <path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
      <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  );
}

interface SocialLoginButtonsProps {
  className?: string;
}

/**
 * Social login buttons component
 */
export function SocialLoginButtons({ className }: SocialLoginButtonsProps) {
  const { socialLogin } = useAuth();
  
  const handleSocialLogin = (provider: AuthProvider) => {
    socialLogin(provider);
  };
  
  return (
    <div className={`grid grid-cols-1 gap-3 ${className || ''}`}>
      <Button
        type="button"
        variant="outline"
        className="flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-50 border-gray-300"
        onClick={() => handleSocialLogin('google')}
      >
        <GoogleIcon className="h-4 w-4 text-[#4285F4]" />
        <span>Continue with Google</span>
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="flex items-center justify-center gap-2 bg-[#1877F2] text-white hover:bg-[#166FE5] border-[#1877F2]"
        onClick={() => handleSocialLogin('facebook')}
      >
        <FacebookIcon className="h-4 w-4" />
        <span>Continue with Facebook</span>
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 border-black"
        onClick={() => handleSocialLogin('apple')}
      >
        <AppleIcon className="h-5 w-5" />
        <span>Continue with Apple</span>
      </Button>
    </div>
  );
} 