import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  breadcrumbs,
  gradient = false,
  action,
  theme = 'blue',
  animated = true
}) => {
  // Determine if we're in dark mode
  const isDarkMode = typeof document !== 'undefined' ? 
    document.documentElement.classList.contains('dark') : false;
  
  // Theme-specific gradient colors
  const themeGradients = {
    blue: {
      light: 'from-[#1E3A8A] to-[#3B82F6]',
      dark: 'from-blue-900/90 to-blue-700/50'
    },
    purple: {
      light: 'from-purple-900 to-purple-600',
      dark: 'from-purple-900/90 to-purple-700/50'
    },
    green: {
      light: 'from-green-900 to-green-600',
      dark: 'from-green-900/90 to-green-700/50'
    },
    amber: {
      light: 'from-amber-800 to-amber-600',
      dark: 'from-amber-900/90 to-amber-700/50'
    }
  };
  
  // Get the appropriate gradient based on theme and mode
  const gradientClasses = gradient 
    ? `bg-gradient-to-r ${isDarkMode ? themeGradients[theme].dark : themeGradients[theme].light}`
    : `bg-[#1E3A8A] dark:bg-slate-800`;
  
  return (
    <motion.div 
      className={cn(
        `rounded-lg shadow-lg p-6 text-white relative overflow-hidden
        dark:shadow-lg dark:shadow-slate-900/30 transition-all duration-300`,
        gradientClasses
      )}
      initial={animated ? { opacity: 0, y: -20 } : false}
      animate={animated ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.3 }}
    >
      {/* Background decorative elements - only visible in dark mode */}
      {isDarkMode && (
        <>
          <div className="absolute top-0 left-0 w-full h-full bg-slate-900/10 backdrop-blur-[1px] -z-10"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
        </>
      )}
      
      <div className="flex flex-col space-y-4 relative z-10">
        {breadcrumbs && (
          <motion.div 
            initial={animated ? { opacity: 0, x: -10 } : false}
            animate={animated ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center space-x-2 text-sm text-blue-100"
          >
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-4 w-4" />}
                {item.href ? (
                  <a href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </motion.div>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={animated ? { opacity: 0, x: -10 } : false}
            animate={animated ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold flex items-center text-white">
              {icon && (
                <motion.span 
                  className="mr-2"
                  initial={animated ? { rotate: -10, scale: 0.9 } : false}
                  animate={animated ? { rotate: 0, scale: 1 } : false}
                  transition={{ duration: 0.3, delay: 0.3, type: "spring" }}
                >
                  {icon}
                </motion.span>
              )}
              {title}
            </h1>
            {subtitle && (
              <motion.p 
                initial={animated ? { opacity: 0, y: 5 } : false}
                animate={animated ? { opacity: 1, y: 0 } : false}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="mt-1 text-blue-100 dark:text-gray-300"
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
          
          {(actions || action) && (
            <motion.div 
              className="flex flex-wrap items-center gap-2"
              initial={animated ? { opacity: 0, x: 10 } : false}
              animate={animated ? { opacity: 1, x: 0 } : false}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {action}
              {actions?.map((action, index) => (
                <motion.div
                  key={index}
                  initial={animated ? { opacity: 0, y: 5 } : false}
                  animate={animated ? { opacity: 1, y: 0 } : false}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Button
                    variant={action.variant || 'construction'}
                    onClick={action.onClick}
                    className={cn(
                      action.variant === 'construction' 
                        ? "bg-white text-white hover:bg-blue-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 font-semibold shadow-sm" 
                        : action.variant === 'blueprint'
                        ? "bg-white/10 text-white hover:bg-white/20 dark:bg-slate-700/80 dark:border-slate-600/80 dark:hover:bg-slate-600/80 dark:text-white border-white/20 font-medium"
                        : action.variant === 'glow'
                        ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 dark:shadow-blue-900/20 dark:shadow-lg font-medium"
                        : "dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 font-medium",
                      "transition-all duration-300"
                    )}
                  >
                    {action.icon && (
                      <motion.span 
                        className="mr-2"
                        whileHover={{ rotate: [0, -10, 10, -5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        {action.icon}
                      </motion.span>
                    )}
                    <span className="whitespace-nowrap">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PageHeader; 