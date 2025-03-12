import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { getActiveProviders } from '../utils/token';

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

/**
 * Connected Accounts component for profile page
 */
export function ConnectedAccounts() {
  const { state, socialLogin } = useAuth();
  const { user } = state;
  const activeProviders = getActiveProviders();
  
  // State to keep track of the provider being connected
  const [connecting, setConnecting] = useState<AuthProvider | null>(null);
  
  // Function to connect/disconnect social accounts
  const handleToggleConnection = (provider: AuthProvider) => {
    if (activeProviders.includes(provider)) {
      // If already connected, disconnect
      // This would call an API endpoint to unlink the account
      console.log(`Disconnecting from ${provider}`);
    } else {
      // If not connected, start OAuth flow
      setConnecting(provider);
      socialLogin(provider);
    }
  };
  
  // Helper to get readable provider name
  const getProviderName = (provider: AuthProvider): string => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'facebook':
        return 'Facebook';
      case 'apple':
        return 'Apple';
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };
  
  // Helper to get provider icon
  const getProviderIcon = (provider: AuthProvider) => {
    switch (provider) {
      case 'google':
        return <GoogleIcon className="h-5 w-5 text-[#4285F4]" />;
      case 'facebook':
        return <FacebookIcon className="h-5 w-5 text-[#1877F2]" />;
      case 'apple':
        return <AppleIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };
  
  const providers: AuthProvider[] = ['google', 'facebook', 'apple'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Connect your accounts to enable single sign-on and share profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map(provider => (
          <div key={provider} className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              {getProviderIcon(provider)}
              <div>
                <p className="text-sm font-medium">{getProviderName(provider)}</p>
                <p className="text-xs text-slate-500">
                  {activeProviders.includes(provider)
                    ? `Connected as ${user?.socialProfiles?.[provider]?.email || user?.email}`
                    : 'Not connected'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={activeProviders.includes(provider)}
                onCheckedChange={() => handleToggleConnection(provider)}
                disabled={connecting === provider}
              />
              {connecting === provider && (
                <span className="text-xs text-slate-500">Connecting...</span>
              )}
            </div>
          </div>
        ))}
        
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Primary Login Method</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor" d="M64 112c-8.8 0-16 7.2-16 16v22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1V128c0-8.8-7.2-16-16-16H64zM48 212.2V384c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V212.2L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64H448c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/>
              </svg>
              <div>
                <p className="text-sm font-medium">Email & Password</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            
            <Button disabled variant="outline" size="sm">
              Primary
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 