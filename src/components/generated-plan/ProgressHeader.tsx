
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download } from 'lucide-react';

const ProgressHeader = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">AI Generated Plan</h1>
          <Button variant="outline" className="space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Plan</span>
          </Button>
        </div>
        <div className="mt-6">
          <Progress value={75} className="h-2" />
          <div className="flex justify-between mt-3 text-sm text-gray-600">
            <span className="font-medium">Basic Info</span>
            <span>AI Generation</span>
            <span>Review</span>
            <span>Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressHeader;
