import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ContentSectionProps {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'highlight' | 'outlined' | 'gradient' | 'glass';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  children,
  action,
  className,
  headerClassName,
  contentClassName,
  variant = 'default',
  elevation = 'none',
  borderRadius = 'md'
}) => {
  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Define the variants
  const variants = {
    default: {
      card: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200',
      header: isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50/50',
    },
    highlight: {
      card: isDarkMode 
        ? 'bg-slate-800 border-blue-700 border-2' 
        : 'bg-white border-blue-500 border-2',
      header: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50/50',
    },
    outlined: {
      card: isDarkMode 
        ? 'bg-transparent border-2 border-slate-700' 
        : 'bg-transparent border-2 border-gray-200',
      header: 'bg-transparent',
    },
    gradient: {
      card: isDarkMode 
        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' 
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200',
      header: isDarkMode 
        ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50',
    },
    glass: {
      card: isDarkMode 
        ? 'bg-slate-800/70 backdrop-blur-md border-slate-700/50' 
        : 'bg-white/70 backdrop-blur-md border-gray-200/50',
      header: isDarkMode 
        ? 'bg-slate-700/50' 
        : 'bg-gray-50/50',
    }
  };

  // Define elevation styles
  const elevationStyles = {
    none: '',
    sm: isDarkMode ? 'shadow-sm shadow-black/30' : 'shadow-sm',
    md: isDarkMode ? 'shadow-md shadow-black/30' : 'shadow-md',
    lg: isDarkMode ? 'shadow-lg shadow-black/30' : 'shadow-lg',
  };

  // Define border radius styles
  const borderRadiusStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-2xl',
  };

  const style = variants[variant];
  const elevationStyle = elevationStyles[elevation];
  const radiusStyle = borderRadiusStyles[borderRadius];

  return (
    <Card className={cn(
      style.card, 
      elevationStyle,
      radiusStyle,
      "transition-all duration-200 ease-in-out",
      className
    )}>
      {title && (
        <CardHeader className={cn(
          style.header, 
          radiusStyle && `${radiusStyle}-t`,
          "border-b transition-colors", 
          isDarkMode ? "border-slate-700" : "border-gray-200",
          headerClassName
        )}>
          <div className="flex justify-between items-center">
            <CardTitle className={cn(
              "text-xl", 
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              {title}
            </CardTitle>
            {action}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        title ? "p-6" : "pt-6 px-6 pb-6", 
        isDarkMode ? "text-gray-200" : "text-gray-700",
        contentClassName
      )}>
        {children}
      </CardContent>
    </Card>
  );
}; 