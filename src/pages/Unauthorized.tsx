import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

/**
 * Unauthorized access page component
 */
export function Unauthorized() {
  return (
    <>
      <Helmet>
        <title>Unauthorized | Buildease</title>
      </Helmet>
      
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-full bg-yellow-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h1>
          
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            You don't have permission to access this page. Please contact your 
            administrator if you believe this is an error.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link to="/login">Sign in with Different Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 