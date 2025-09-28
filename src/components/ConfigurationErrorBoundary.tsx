/**
 * ConfigurationErrorBoundary - Specifically handles configuration-related errors
 * Provides helpful messages for missing environment variables and setup issues
 */
import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ConfigurationErrorBoundaryProps {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ConfigurationErrorBoundary extends React.Component<ConfigurationErrorBoundaryProps, State> {
  constructor(props: ConfigurationErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Configuration error:', error, errorInfo);
  }

  private isSupabaseConfigError(error: Error): boolean {
    return error.message.includes('Missing required environment variables') ||
           error.message.includes('VITE_SUPABASE_URL') ||
           error.message.includes('VITE_SUPABASE_ANON_KEY') ||
           error.message.includes('Invalid URL');
  }

  private renderSupabaseConfigError() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full p-6 border-orange-200 bg-orange-50">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-orange-900 mb-2">
              Configuration Required
            </h2>
            
            <p className="text-orange-700 mb-6">
              This application requires Supabase configuration. Please set up your environment variables to continue.
            </p>
            
            <div className="text-left bg-orange-100 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-orange-900 mb-2">Required Variables:</h3>
              <div className="space-y-1 text-sm font-mono text-orange-800">
                <div>VITE_SUPABASE_URL</div>
                <div>VITE_SUPABASE_ANON_KEY</div>
              </div>
            </div>

            <div className="text-left bg-white rounded-lg p-4 mb-6 border border-orange-200">
              <h3 className="font-medium text-gray-900 mb-2">For Netlify Deployment:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Go to your site settings in Netlify</li>
                <li>Navigate to "Environment variables"</li>
                <li>Add the required variables above</li>
                <li>Redeploy your site</li>
              </ol>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Retry
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://docs.netlify.com/configure-builds/environment-variables/', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Netlify Docs
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 p-3 bg-gray-100 rounded-lg text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-800 mb-2">
                  Technical Details
                </summary>
                <div className="text-xs text-gray-700 font-mono">
                  {this.state.error.message}
                </div>
              </details>
            )}
          </div>
        </Card>
      </div>
    );
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.isSupabaseConfigError(this.state.error)) {
        return this.renderSupabaseConfigError();
      }

      // For other configuration errors, fall back to generic error
      throw this.state.error;
    }

    return this.props.children;
  }
}

export default ConfigurationErrorBoundary;