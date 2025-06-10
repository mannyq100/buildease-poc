import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/core/ui';

// Define BuildEase colors
const buildeaseBlue = '#2B6CB0';

export interface AuthLayoutProps {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function AuthLayout({
  title,
  description,
  children,
  className,
  imageUrl,
  imageAlt,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-background">
      {/* Branding Side - Updated with BuildEase Blue */}
      <div
        className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center p-12 text-white bg-gradient-to-br from-blue-800 to-blue-900"
        style={{ backgroundColor: buildeaseBlue }}
      >
        <div className="mb-8">
          <Link to="/" aria-label="Go to homepage">
            <img src="/buildease-logo-1.png" className="h-16 w-auto text-white" />
          </Link>
        </div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={imageAlt || 'Branding image'}
            className="mt-8 max-w-sm rounded-lg shadow-lg"
          />
        )}
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className={cn('mx-auto w-full max-w-md space-y-6', className)}>
          {/* Logo for mobile view */}
          <div className="lg:hidden flex justify-center mb-6">
            <Link to="/" aria-label="Go to homepage">
              <img src="/buildease-logo-1.png" className="h-10 w-auto text-blue-700" />
            </Link>
          </div>
          <div>
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <div className="mt-2 text-center text-sm text-muted-foreground">
              {description}
            </div>
          </div>
          {children}
          <p className="text-center text-xs text-muted-foreground pt-6">
            &copy; {new Date().getFullYear()} BuildEase. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
