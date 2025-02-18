
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ProgressHeader from './generated-plan/ProgressHeader';
import ProjectOverview from './generated-plan/ProjectOverview';
import ProjectPhases from './generated-plan/ProjectPhases';
import AIRecommendations from './generated-plan/AIRecommendations';

const AIGenerationResultsMockup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 transition-all duration-500">
      <ProgressHeader />

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <ProjectOverview />
        <ProjectPhases />
        <AIRecommendations />

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" className="space-x-2 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Adjust Inputs</span>
          </Button>
          <Button className="space-x-2 bg-blue-600 hover:bg-blue-700 transition-colors">
            <span>Continue to Details</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIGenerationResultsMockup;
