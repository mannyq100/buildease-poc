import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Building, 
  ArrowRight, 
  Clock, 
  Calendar as CalendarIcon,
  Bell,
  BarChart3
} from 'lucide-react';

interface PhaseHeaderProps {
  phaseName: string;
  phaseStatus: string;
  projectName: string;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  progress: number;
  onNavigateToProject: () => void;
}

/**
 * Header component for phase details showing phase information and progress
 */
export function PhaseHeader({
  phaseName,
  phaseStatus,
  projectName,
  startDate,
  endDate,
  durationWeeks,
  progress,
  onNavigateToProject
}: PhaseHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check dark mode on component mount and when it changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Check on mount
    checkDarkMode();
    
    // Set up a mutation observer to watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Clean up observer on unmount
    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn(
      "relative py-6 px-4 shadow-md z-10",
      isDarkMode ? "bg-slate-800" : "bg-white"
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-50 z-0"></div>
      <div className="max-w-5xl mx-auto relative z-10">
        <LazyMotion features={domAnimation}>
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-2 text-sm"
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-2 py-1 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700"
              onClick={onNavigateToProject}
            >
              <Building className="w-4 h-4 mr-1" />
              {projectName}
            </Button>
            <ArrowRight className={cn("w-3 h-3", isDarkMode ? "text-slate-400" : "text-gray-400")} />
            <Badge variant="outline" className="rounded-full font-normal">{phaseName}</Badge>
          </m.div>
          
          <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-between items-start mt-4"
          >
            <div>
              <h1 className={cn(
                "text-2xl font-bold flex items-center",
                isDarkMode ? "text-white" : "text-slate-800"
              )}>
                {phaseName}
                <Badge className="ml-3 bg-blue-500 hover:bg-blue-600 text-white">{phaseStatus}</Badge>
              </h1>
              <p className={cn(
                "text-sm mt-1.5 flex items-center",
                isDarkMode ? "text-slate-300" : "text-gray-600"
              )}>
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                {startDate} - {endDate}
                <span className="mx-2">•</span>
                <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                {durationWeeks} weeks duration
              </p>
            </div>
            
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Bell className="w-4 h-4 mr-1" />
                      Alerts
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Phase alerts and notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" className="h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Reports
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View phase reports and analytics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </m.div>
          
          <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5"
          >
            <div className="flex justify-between text-sm mb-1.5">
              <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>Phase Progress</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{progress}% Complete</span>
            </div>
            <div className="bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <m.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              />
            </div>
          </m.div>
        </LazyMotion>
      </div>
    </div>
  );
} 