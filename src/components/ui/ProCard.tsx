/**
 * ProCard - BuildEase consistent elevated card style
 * Provides a unified glossy, rounded, subtle-gradient card with accent variants.
 * Use to ensure visual consistency across overview widgets and sections.
 */

import { Card, type CardProps } from '@/components/ui/card';
import { cn } from '@/utils/core/ui';

export type ProCardAccent = 'neutral' | 'blue' | 'orange' | 'green';

// Internal helper for composing class names (not exported to satisfy fast-refresh guidance)
function proCardClass(accent: ProCardAccent = 'neutral'): string {
  const base = [
    'rounded-2xl border shadow-xl backdrop-blur-md opacity-100',
    // Motion + interaction
    'transition-all duration-300 ease-out will-change-transform motion-safe:transform',
    'hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0',
    // Focus accessibility
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-buildease-blue-400/50',
    'focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
  ].join(' ');
  const variants: Record<ProCardAccent, string> = {
    neutral:
      'border-slate-200/60 bg-gradient-to-br from-white via-slate-50/40 to-white/90',
    blue:
      'border-buildease-blue-200/60 bg-gradient-to-br from-buildease-blue-50/30 via-white to-white',
    orange:
      'border-buildease-orange-200/60 bg-gradient-to-br from-buildease-orange-50/30 via-white to-white',
    green:
      'border-emerald-200/60 bg-gradient-to-br from-emerald-50/30 via-white to-white',
  };
  return cn(base, variants[accent]);
}

export interface ProCardProps extends CardProps {
  accent?: ProCardAccent;
}

export function ProCard({ accent = 'neutral', className, ...props }: ProCardProps) {
  return <Card className={cn(proCardClass(accent), className)} {...props} />;
}

export default ProCard;
