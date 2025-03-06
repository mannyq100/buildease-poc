import React from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'p' 
  | 'lead' 
  | 'large' 
  | 'small' 
  | 'subtle' 
  | 'label' 
  | 'helper';

type TypographyProps = {
  variant?: TypographyVariant;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
  asChild?: boolean;
};

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl',
  h2: 'text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-3xl',
  h3: 'text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-2xl',
  h4: 'text-lg font-bold leading-tight tracking-tight text-gray-900 dark:text-white',
  p: 'text-base leading-normal text-gray-700 dark:text-gray-300',
  lead: 'text-lg leading-normal text-gray-700 dark:text-gray-300',
  large: 'text-lg leading-7 text-gray-700 dark:text-gray-300',
  small: 'text-sm leading-normal text-gray-600 dark:text-gray-400',
  subtle: 'text-sm leading-normal text-gray-500 dark:text-gray-500',
  label: 'text-sm font-medium leading-none text-gray-700 dark:text-gray-300',
  helper: 'text-xs leading-normal text-gray-500 dark:text-gray-500',
};

const variantMapping: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p: 'p',
  lead: 'p',
  large: 'p',
  small: 'p',
  subtle: 'p',
  label: 'label',
  helper: 'span',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'p',
  as,
  className,
  asChild,
  children,
  ...props
}) => {
  const Component = asChild ? Slot : as || variantMapping[variant];
  
  return (
    <Component
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
};

// Export specific typography variants for convenience
export const H1 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h1" {...props} />;
export const H2 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h2" {...props} />;
export const H3 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h3" {...props} />;
export const H4 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h4" {...props} />;
export const Paragraph = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="p" {...props} />;
export const Lead = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="lead" {...props} />;
export const Large = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="large" {...props} />;
export const Small = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="small" {...props} />;
export const Subtle = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="subtle" {...props} />;
export const Label = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="label" {...props} />;
export const Helper = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="helper" {...props} />;

export default Typography; 