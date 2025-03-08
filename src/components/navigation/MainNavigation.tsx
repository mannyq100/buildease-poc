import { FC } from 'react';
import { cn } from "@/lib/utils";

interface MainNavigationProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const MainNavigation: FC<MainNavigationProps> = ({
  title,
  subtitle,
  icon,
  actions,
  className
}) => {
  return (
    <div className={cn(
      "fixed top-0 right-0 left-[280px] z-30 flex items-center justify-between border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3",
      "lg:left-[280px]",
      "md:left-16",
      className
    )}>
      <div className="flex items-center gap-6">
        <img 
          src="/buildease-logo-1.svg" 
          alt="BuildEase" 
          className="h-10 w-auto"
          style={{ maxWidth: '180px'}}
        />
        {(icon || title) && (
          <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-slate-700">
            {icon && (
              <div className="text-gray-500 dark:text-gray-400">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};
