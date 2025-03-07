/**
 * InsightItem component for displaying contextual information and tips
 */
import React from 'react';
import { Sparkles } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { InsightItemProps } from '@/types/projectInputs';

/**
 * Component for displaying insights, tips, and contextual information
 * with appropriate styling based on type (default, warning, success)
 */
export function InsightItem({ title, description, icon, type = 'default' }: InsightItemProps) {
  const styles = {
    default: {
      container: 'bg-blue-50/50 border border-blue-100/50 hover:border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 dark:hover:border-blue-700',
      icon: 'text-blue-500 dark:text-blue-400',
      heading: 'text-blue-900 dark:text-blue-300',
      text: 'text-blue-800 dark:text-blue-400',
    },
    warning: {
      container: 'bg-amber-50/50 border border-amber-100/50 hover:border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 dark:hover:border-amber-700',
      icon: 'text-amber-500 dark:text-amber-400',
      heading: 'text-amber-900 dark:text-amber-300',
      text: 'text-amber-800 dark:text-amber-400',
    },
    success: {
      container: 'bg-green-50/50 border border-green-100/50 hover:border-green-200 dark:bg-green-900/20 dark:border-green-800/50 dark:hover:border-green-700',
      icon: 'text-green-500 dark:text-green-400',
      heading: 'text-green-900 dark:text-green-300',
      text: 'text-green-800 dark:text-green-400',
    }
  };

  const style = styles[type];

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div 
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md ${style.container}`}
      >
        <div className={`rounded-full p-2 bg-current bg-opacity-10 ${style.icon}`}>
          {icon || <Sparkles className={`w-5 h-5 ${style.icon}`} />}
        </div>
        <div>
          <h4 className={`font-medium ${style.heading}`}>{title}</h4>
          <p className={`text-sm mt-1 leading-relaxed ${style.text}`}>{description}</p>
        </div>
      </m.div>
    </LazyMotion>
  );
} 