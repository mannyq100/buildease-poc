import React, { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PhaseTabsProps {
  children: ReactNode;
  defaultValue?: string;
  className?: string;
}

/**
 * PhaseTabs component for organizing phase details content into tabs
 * with enhanced styling and animation
 */
export function PhaseTabs({ 
  children, 
  defaultValue = "overview",
  className 
}: PhaseTabsProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={cn("w-full", className)}
      >
        <Tabs defaultValue={defaultValue} className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <TabsList className="bg-transparent h-auto p-0 justify-start w-full">
              <TabsTrigger 
                value="overview" 
                data-value="overview"
                className="text-sm rounded-none border-b-2 border-transparent px-4 py-3 text-gray-500 dark:text-gray-400 
                  hover:text-gray-700 dark:hover:text-gray-300
                  data-[state=active]:border-[#1E3A8A] dark:data-[state=active]:border-blue-500 
                  data-[state=active]:text-[#1E3A8A] dark:data-[state=active]:text-blue-400"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                data-value="tasks"
                className="text-sm rounded-none border-b-2 border-transparent px-4 py-3 text-gray-500 dark:text-gray-400 
                  hover:text-gray-700 dark:hover:text-gray-300
                  data-[state=active]:border-[#1E3A8A] dark:data-[state=active]:border-blue-500 
                  data-[state=active]:text-[#1E3A8A] dark:data-[state=active]:text-blue-400"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="materials" 
                data-value="materials"
                className="text-sm rounded-none border-b-2 border-transparent px-4 py-3 text-gray-500 dark:text-gray-400 
                  hover:text-gray-700 dark:hover:text-gray-300
                  data-[state=active]:border-[#1E3A8A] dark:data-[state=active]:border-blue-500 
                  data-[state=active]:text-[#1E3A8A] dark:data-[state=active]:text-blue-400"
              >
                Materials
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                data-value="documents"
                className="text-sm rounded-none border-b-2 border-transparent px-4 py-3 text-gray-500 dark:text-gray-400 
                  hover:text-gray-700 dark:hover:text-gray-300
                  data-[state=active]:border-[#1E3A8A] dark:data-[state=active]:border-blue-500 
                  data-[state=active]:text-[#1E3A8A] dark:data-[state=active]:text-blue-400"
              >
                Documents
              </TabsTrigger>
            </TabsList>
          </div>
          
          {children}
        </Tabs>
      </m.div>
    </LazyMotion>
  );
} 