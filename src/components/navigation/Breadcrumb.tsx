import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LazyMotion, domAnimation, m } from 'framer-motion';

interface BreadcrumbPath {
  name: string;
  path?: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbPath[];
  homeLabel?: string;
  homeIcon?: React.ReactNode;
  className?: string;
  showHomeIcon?: boolean;
  separator?: React.ReactNode;
  autoGenerate?: boolean;
  pathMapping?: Record<string, string>;
  animated?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbsProps> = ({
  items,
  homeLabel = "Home",
  homeIcon = <Home className="h-4 w-4" />,
  className,
  showHomeIcon = true,
  separator = <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" />,
  autoGenerate = false,
  pathMapping = {},
  animated = true,
}) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs based on current path if no items provided
  const breadcrumbItems = items || (() => {
    if (!autoGenerate) return [];
    
    // Default mapping of path segments to readable names
    const defaultPathMapping = {
      'dashboard': 'Dashboard',
      'projects': 'Projects',
      'project': 'Project',
      'schedule': 'Schedule',
      'materials': 'Materials',
      'expenses': 'Expenses',
      'team': 'Team',
      'documents': 'Documents',
      'settings': 'Settings',
      'create-project': 'Create Project',
      ...pathMapping
    };
    
    // Split path and filter empty segments
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Always start with home
    const generatedItems: BreadcrumbPath[] = [
      { name: homeLabel, path: '/', icon: homeIcon }
    ];
    
    // Build up the breadcrumb items
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Check if segment is an ID (numeric)
      const isId = /^\d+$/.test(segment);
      
      // For numeric IDs, use the previous segment as context
      let name;
      if (isId && index > 0) {
        const contextSegment = pathSegments[index - 1];
        // Remove trailing 's' if plural
        const singularContext = contextSegment.endsWith('s') 
          ? contextSegment.slice(0, -1) 
          : contextSegment;
        name = `${defaultPathMapping[singularContext] || singularContext} #${segment}`;
      } else {
        name = defaultPathMapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      generatedItems.push({
        name,
        path: index < pathSegments.length - 1 ? currentPath : undefined,
        active: index === pathSegments.length - 1
      });
    });
    
    return generatedItems;
  })();
  
  return (
    <nav className={cn("flex items-center text-sm", className)}>
      <ol className="flex items-center flex-wrap">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          const itemContent = (
            <>
              {item.icon && (showHomeIcon || index !== 0) && (
                <span className="mr-1.5">{item.icon}</span>
              )}
              <span>{item.name}</span>
            </>
          );
          
          return (
            <m.li 
              key={index}
              className="flex items-center"
              initial={animated ? { opacity: 0, x: -5 } : undefined}
              animate={animated ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              {index > 0 && separator}
              
              {item.path && !isLast ? (
                <Link 
                  to={item.path}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center font-medium"
                >
                  {itemContent}
                </Link>
              ) : (
                <span className={cn(
                  "flex items-center",
                  isLast 
                    ? "text-gray-900 font-semibold dark:text-white" 
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {itemContent}
                </span>
              )}
            </m.li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb; 