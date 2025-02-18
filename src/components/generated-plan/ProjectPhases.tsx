
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Edit2 } from 'lucide-react';
import PhaseCard from './PhaseCard';

const ProjectPhases = () => {
  return (
    <Card className="overflow-hidden border-gray-200">
      <CardHeader className="bg-gray-50/50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-xl text-gray-900">Generated Project Phases</span>
          </div>
          <Button variant="outline" size="sm" className="hover:bg-gray-50 transition-colors">
            <Edit2 className="w-4 h-4 mr-2" />
            Adjust Phases
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <PhaseCard 
          name="Site Preparation & Foundation"
          duration="6 weeks"
          budget="$30,000"
          team={5}
          tasks={12}
          status="optimized"
        />
        <PhaseCard 
          name="Structural Work"
          duration="12 weeks"
          budget="$45,000"
          team={8}
          tasks={15}
          status="warning"
          warning="Consider additional skilled labor"
        />
        <PhaseCard 
          name="Roofing & Exterior"
          duration="8 weeks"
          budget="$35,000"
          team={6}
          tasks={10}
          status="optimized"
        />
      </CardContent>
    </Card>
  );
};

export default ProjectPhases;
