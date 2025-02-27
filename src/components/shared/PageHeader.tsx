import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'construction' | 'blueprint' | 'default';
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
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  breadcrumbs,
  gradient = false,
  action
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`${gradient ? 'bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6]' : 'bg-[#1E3A8A]'} rounded-lg shadow-lg p-6 text-white`}>
        <div className="flex flex-col space-y-4">
          {breadcrumbs && (
            <div className="flex items-center space-x-2 text-sm text-blue-100">
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
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                {icon && <span className="mr-2">{icon}</span>}
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-blue-100">{subtitle}</p>
              )}
            </div>
            
            {(actions || action) && (
              <div className="flex flex-wrap items-center gap-2">
                {action}
                {actions?.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'construction'}
                    onClick={action.onClick}
                    className={
                      action.variant === 'construction' 
                        ? "bg-white text-white hover:bg-blue-50 font-semibold shadow-sm"
                        : action.variant === 'blueprint'
                        ? "bg-white/10 text-white hover:bg-white/20 border-white/20 font-medium"
                        : "font-medium"
                    }
                  >
                    {action.icon && (
                      <span className="mr-2">{action.icon}</span>
                    )}
                    <span className="whitespace-nowrap">{action.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader; 