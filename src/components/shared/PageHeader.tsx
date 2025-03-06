import React, { useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn, darkModeDetector } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'construction' | 'blueprint' | 'default' | 'glow';
  onClick: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: PageHeaderAction[];
  breadcrumbs?: Breadcrumb[];
  gradient?: boolean;
  action?: React.ReactNode;
  theme?: 'blue' | 'purple' | 'green' | 'amber';
  animated?: boolean;
}

// Memoize gradient options to avoid recalculation
const themeGradients = {
  blue: {
    light: 'from-[#1E3A8A] to-[#2B6CB0]',
    dark: 'from-blue-900 to-blue-700/90'
  },
  purple: {
    light: 'from-purple-900 to-purple-700',
    dark: 'from-purple-900 to-purple-800/90'
  },
  green: {
    light: 'from-green-900 to-green-700',
    dark: 'from-green-900 to-green-800/90'
  },
  amber: {
    light: 'from-amber-800 to-[#ED8936]',
    dark: 'from-amber-900 to-amber-700/90'
  }
};

// Memoize action button for performance
const ActionButton = memo(({ action }: { action: PageHeaderAction }) => {
  return (
    <Button
      variant={action.variant || 'construction'}
      onClick={action.onClick}
      className={cn(
        "transition-all duration-300 font-medium",
        action.variant === 'construction' 
          ? "bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/40" 
          : action.variant === 'blueprint'
          ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
          : action.variant === 'glow'
          ? "bg-[#ED8936] hover:bg-[#DD7926] text-white shadow-lg shadow-black/20"
          : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
      )}
    >
      {action.icon && (
        <span className="mr-2 opacity-90">
          {action.icon}
        </span>
      )}
      <span className="whitespace-nowrap">{action.label}</span>
    </Button>
  );
});

ActionButton.displayName = 'ActionButton';

// Optimized breadcrumb item component
const BreadcrumbItem = memo(({ item, isLast }: { item: Breadcrumb, isLast: boolean }) => {
  return (
    <>
      {!isLast && <ChevronRight className="h-4 w-4 text-white/70" />}
      {item.href ? (
        <a href={item.href} className="text-white/70 hover:text-white transition-colors">
          {item.label}
        </a>
      ) : (
        <span className="text-white/90">{item.label}</span>
      )}
    </>
  );
});

BreadcrumbItem.displayName = 'BreadcrumbItem';

export const PageHeader = memo(({
  title,
  subtitle,
  icon,
  actions,
  breadcrumbs,
  gradient = false,
  action,
  theme = 'blue',
  animated = true
}: PageHeaderProps) => {
  // Use centralized dark mode detection
  const isDarkMode = darkModeDetector.isDarkMode();
  
  // Memoize gradient classes
  const gradientClasses = useMemo(() => {
    if (gradient) {
      return `bg-gradient-to-r ${isDarkMode ? themeGradients[theme].dark : themeGradients[theme].light}`;
    } else {
      return `bg-[#2B6CB0] dark:bg-slate-800/95`;
    }
  }, [gradient, theme, isDarkMode]);
  
  // Memoize background decorative elements JSX
  const backgroundElements = useMemo(() => {
    return (
      <>
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute -top-18 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
      </>
    );
  }, []);
  
  // Skip animations for better performance if needed
  if (!animated) {
    return (
      <div 
        className={cn(
          "rounded-lg shadow-lg p-6 text-white relative overflow-hidden mt-0",
          "shadow-black/10 dark:shadow-black/30",
          gradientClasses
        )}
      >
        {backgroundElements}
        
        <div className="flex flex-col space-y-4 relative z-10">
          {breadcrumbs && (
            <div className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((item, index) => (
                <BreadcrumbItem key={index} item={item} isLast={index === 0} />
              ))}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center text-white">
                {icon && <span className="mr-2 opacity-90">{icon}</span>}
                {title}
              </h1>
              {subtitle && <p className="mt-1 text-white/80">{subtitle}</p>}
            </div>
            
            {(actions || action) && (
              <div className="flex flex-wrap items-center gap-2">
                {action}
                {actions?.map((action, index) => (
                  <ActionButton key={index} action={action} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // With animations, use lighter motion animations
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={cn(
          "rounded-lg shadow-lg p-6 text-white relative overflow-hidden mt-0",
          "shadow-black/10 dark:shadow-black/30",
          gradientClasses
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {backgroundElements}
        
        <div className="flex flex-col space-y-4 relative z-10">
          {breadcrumbs && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex items-center space-x-2 text-sm"
            >
              {breadcrumbs.map((item, index) => (
                <BreadcrumbItem key={index} item={item} isLast={index === 0} />
              ))}
            </m.div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold flex items-center text-white">
                {icon && <span className="mr-2 opacity-90">{icon}</span>}
                {title}
              </h1>
              {subtitle && <p className="mt-1 text-white/80">{subtitle}</p>}
            </m.div>
            
            {(actions || action) && (
              <m.div
                className="flex flex-wrap items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.15 }}
              >
                {action}
                {actions?.map((action, index) => (
                  <ActionButton key={index} action={action} />
                ))}
              </m.div>
            )}
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader; 