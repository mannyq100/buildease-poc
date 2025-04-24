import React from 'react';
import { Phase, ConstructionPlan } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { motion as m } from 'framer-motion';

interface TimelineViewProps {
  plan: ConstructionPlan;
}

export function TimelineView({ plan }: TimelineViewProps) {
  // Sort phases by order
  const sortedPhases = [...plan.phases].sort((a, b) => a.order - b.order);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending':
        return 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/10';
      case 'in-progress':
        return 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/10';
      case 'completed':
        return 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/10';
      case 'delayed':
        return 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10';
      default:
        return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30';
    }
  };

  const getTextColor = (status: string) => {
    switch(status) {
      case 'pending':
        return 'text-blue-600 dark:text-blue-400';
      case 'in-progress':
        return 'text-amber-600 dark:text-amber-400';
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'delayed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700 pb-3">
            <CardTitle className="text-lg font-semibold text-[#2B6CB0] dark:text-[#93C5FD] flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Project Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-0 bottom-0 left-7 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>

              <div className="space-y-8 relative z-10">
                {sortedPhases.map((phase, index) => (
                  <m.div 
                    key={phase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex relative"
                  >
                    <div className={`flex-shrink-0 h-14 w-14 rounded-full ${getStatusColor(phase.status)} border-2 flex items-center justify-center`}>
                      <span className={`font-bold ${getTextColor(phase.status)}`}>{phase.order}</span>
                    </div>
                    <div className="ml-4 mt-1">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                        {phase.name}
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusColor(phase.status)} ${getTextColor(phase.status)}`}>
                          {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{phase.description}</p>
                      <div className="flex items-center text-gray-500 dark:text-gray-400 space-x-4 mt-1 text-xs">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>{phase.duration}</span>
                        </div>
                        {phase.startDate && phase.endDate && (
                          <div>
                            {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Tasks preview */}
                      {phase.tasks.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Tasks: {phase.tasks.length}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {phase.tasks.slice(0, 3).map(task => (
                              <span 
                                key={task.id} 
                                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                              >
                                {task.name}
                              </span>
                            ))}
                            {phase.tasks.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
                                +{phase.tasks.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </m.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </div>
  );
}
