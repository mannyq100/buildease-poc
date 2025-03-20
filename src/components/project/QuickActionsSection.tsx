import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { scaleInVariants, buttonHoverVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface QuickActionProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface QuickActionsSectionProps {
  actions: QuickActionProps[];
  className?: string;
}

/**
 * QuickActionsSection - Displays quick action buttons for common project tasks
 */
export function QuickActionsSection({
  actions,
  className
}: QuickActionsSectionProps) {
  return (
    <Card className={cn(
      "shadow-sm border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800",
      className
    )}>
      <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
      </CardHeader>
      <CardContent className="p-4">
        <LazyMotion features={domAnimation}>
          <div className="space-y-3">
            {actions.map((action, i) => (
              <m.div
                key={i}
                variants={scaleInVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.2, delay: i * 0.05 }}
                whileHover={buttonHoverVariants}
              >
                <Button 
                  variant="outline" 
                  className="w-full justify-between bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-gray-800 dark:text-gray-200 font-medium"
                  onClick={action.onClick}
                >
                  <span className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2B6CB0]/10 text-[#2B6CB0] dark:bg-blue-900/30 dark:text-blue-400 mr-3">
                      {action.icon}
                    </span>
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4 ml-2 text-[#ED8936] dark:text-[#F6AD55]" />
                </Button>
              </m.div>
            ))}
          </div>
        </LazyMotion>
      </CardContent>
    </Card>
  );
}