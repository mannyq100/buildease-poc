import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download } from 'lucide-react';

interface Step {
  name: string;
  status: 'complete' | 'current' | 'upcoming';
}

interface ProgressHeaderProps {
  steps?: Step[];
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ steps = [] }) => {
  // Calculate progress percentage based on completed steps
  const completedSteps = steps.filter(step => step.status === 'complete').length;
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  
  // Default steps if none provided
  const defaultSteps = steps.length > 0 ? steps : [
    { name: 'Basic Info', status: 'complete' },
    { name: 'AI Generation', status: 'current' },
    { name: 'Review', status: 'upcoming' },
    { name: 'Complete', status: 'upcoming' },
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Generated Plan</h1>
          <Button variant="outline" className="space-x-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
            <Download className="w-4 h-4" />
            <span>Export Plan</span>
          </Button>
        </div>
        <div className="mt-6">
          <Progress value={progressPercentage} className="h-2 dark:bg-slate-700" />
          <div className="flex justify-between mt-3 text-sm text-gray-600 dark:text-gray-400">
            {defaultSteps.map((step, index) => (
              <span 
                key={index} 
                className={`font-medium ${
                  step.status === 'complete' ? 'text-green-600 dark:text-green-400' :
                  step.status === 'current' ? 'text-blue-600 dark:text-blue-400' :
                  'text-gray-500 dark:text-gray-500'
                }`}
              >
                {step.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressHeader;
