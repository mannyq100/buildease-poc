import React from 'react';
import { Sparkles, Lightbulb, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface InsightItemProps {
  title: string;
  description: string;
  type?: 'default' | 'alert' | 'success' | 'warning' | 'performance';
  icon?: React.ReactNode;
  className?: string;
}

export const InsightItem: React.FC<InsightItemProps> = ({ 
  title, 
  description,
  type = 'default',
  icon,
  className
}) => {
  const styles = {
    default: {
      container: 'bg-blue-50/50 border border-blue-100/50 hover:border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 dark:hover:border-blue-700',
      icon: 'text-blue-600 dark:text-blue-400',
      heading: 'text-blue-900 dark:text-blue-300',
      text: 'text-blue-800 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50'
    },
    alert: {
      container: 'bg-yellow-50/50 border border-yellow-100/50 hover:border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50 dark:hover:border-yellow-700',
      icon: 'text-yellow-500 dark:text-yellow-400',
      heading: 'text-yellow-900 dark:text-yellow-300', 
      text: 'text-yellow-800 dark:text-yellow-400',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/50'
    },
    success: {
      container: 'bg-green-50/50 border border-green-100/50 hover:border-green-200 dark:bg-green-900/20 dark:border-green-800/50 dark:hover:border-green-700',
      icon: 'text-green-500 dark:text-green-400',
      heading: 'text-green-900 dark:text-green-300',
      text: 'text-green-800 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/50'
    },
    warning: {
      container: 'bg-orange-50/50 border border-orange-100/50 hover:border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50 dark:hover:border-orange-700',
      icon: 'text-orange-500 dark:text-orange-400',
      heading: 'text-orange-900 dark:text-orange-300',
      text: 'text-orange-800 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/50'
    },
    performance: {
      container: 'bg-purple-50/50 border border-purple-100/50 hover:border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50 dark:hover:border-purple-700',
      icon: 'text-purple-500 dark:text-purple-400',
      heading: 'text-purple-900 dark:text-purple-300',
      text: 'text-purple-800 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50'
    }
  };

  const style = styles[type];

  // Default icons based on type
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'default':
        return <Lightbulb className={cn("w-5 h-5", style.icon)} />;
      case 'alert':
        return <AlertTriangle className={cn("w-5 h-5", style.icon)} />;
      case 'success':
        return <TrendingUp className={cn("w-5 h-5", style.icon)} />;
      case 'warning':
        return <AlertTriangle className={cn("w-5 h-5", style.icon)} />;
      case 'performance':
        return <Zap className={cn("w-5 h-5", style.icon)} />;
      default:
        return <Sparkles className={cn("w-5 h-5", style.icon)} />;
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={cn(
        "flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md", 
        style.container,
        className
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", 
        style.iconBg
      )}>
        {getIcon()}
      </div>
      <div>
        <h4 className={cn("font-semibold", style.heading)}>{title}</h4>
        <p className={cn("text-sm mt-1.5 leading-relaxed", style.text)}>{description}</p>
      </div>
    </motion.div>
  );
}; 