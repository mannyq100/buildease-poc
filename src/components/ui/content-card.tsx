import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { H3, Paragraph, Small } from './typography';

interface ContentCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  children: React.ReactNode;
  padding?: 'default' | 'large' | 'compact' | 'none';
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  description,
  icon,
  footer,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  children,
  padding = 'default',
  ...props
}) => {
  // Padding values
  const paddingValues = {
    default: 'p-6',
    large: 'p-8',
    compact: 'p-4',
    none: 'p-0'
  };
  
  // Content padding should be slightly less than header
  const contentPaddingValues = {
    default: 'px-6 pb-6',
    large: 'px-8 pb-8',
    compact: 'px-4 pb-4',
    none: 'p-0'
  };
  
  return (
    <Card className={cn('overflow-hidden', className)} {...props}>
      {(title || description) && (
        <CardHeader className={cn(paddingValues[padding], 'pb-4', headerClassName)}>
          <div className="flex items-start gap-4">
            {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
            <div className="space-y-1.5 flex-1">
              {title && (
                <H3 className="text-xl">{title}</H3>
              )}
              {description && (
                <Small className="text-gray-500 dark:text-gray-400">
                  {description}
                </Small>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        contentPaddingValues[padding], 
        title || description ? 'pt-0' : '', 
        'space-y-4',
        contentClassName
      )}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={cn(
          paddingValues[padding], 
          'pt-4 border-t border-gray-100 dark:border-gray-800', 
          footerClassName
        )}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default ContentCard; 