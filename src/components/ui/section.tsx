import React from 'react';
import { cn } from '@/lib/utils';
import { Typography, H2, Paragraph } from './typography';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  children: React.ReactNode;
  divider?: boolean;
  compact?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  title,
  description,
  className,
  contentClassName,
  headerClassName,
  children,
  divider = false,
  compact = false,
  ...props
}) => {
  return (
    <section 
      className={cn(
        'space-y-4',
        compact ? 'my-4' : 'my-8',
        divider && 'border-b pb-6 border-gray-200 dark:border-gray-800',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className={cn('space-y-1.5', headerClassName)}>
          {title && <H2>{title}</H2>}
          {description && (
            <Paragraph className="text-gray-500 dark:text-gray-400">
              {description}
            </Paragraph>
          )}
        </div>
      )}
      <div className={cn('space-y-6', contentClassName)}>
        {children}
      </div>
    </section>
  );
};

export default Section; 