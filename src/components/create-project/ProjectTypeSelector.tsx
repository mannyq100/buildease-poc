/**
 * Project type selector component
 * Displays radio buttons for selecting project types with visual examples
 */
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Home as HomeIcon, Building, Factory, Wrench } from 'lucide-react';

// Import project type images
import { PROJECT_TYPE_IMAGES } from '@/data/mock/projectInputs/exampleImages';

interface ProjectOption {
  value: string;
  label: string;
}

interface ProjectTypeSelectorProps {
  selectedType: string;
  projectTypes: ProjectOption[];
  onChange: (value: string) => void;
  isDarkMode: boolean;
}

export function ProjectTypeSelector({
  selectedType,
  projectTypes,
  onChange,
  isDarkMode
}: ProjectTypeSelectorProps) {
  // Helper to get the appropriate icon for a project type
  const getIconForType = (type: string) => {
    switch (type) {
      case 'residential-single':
      case 'residential-multi':
        return <HomeIcon className="h-4 w-4 mr-2 text-blue-500" />;
      case 'commercial-small':
      case 'commercial-large':
        return <Building className="h-4 w-4 mr-2 text-purple-500" />;
      case 'mixed-use':
      case 'educational':
      case 'religious':
      case 'community':
        return <Factory className="h-4 w-4 mr-2 text-green-500" />;
      case 'renovation':
        return <Wrench className="h-4 w-4 mr-2 text-orange-500" />;
      default:
        return <Building className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-3">
      <Label className={`font-medium ${
        isDarkMode ? "text-slate-300" : "text-gray-900"
      }`}>
        What type of project are you building?
      </Label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {projectTypes.slice(0, 6).map((type) => (
          <div key={type.value} className="flex items-start space-x-2">
            <RadioGroup 
              value={selectedType} 
              onValueChange={onChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={type.value} 
                  id={`project-type-${type.value}`} 
                  className={isDarkMode ? "border-slate-600" : ""}
                />
                <Label 
                  htmlFor={`project-type-${type.value}`}
                  className={isDarkMode ? "text-slate-300" : "text-gray-700"}
                >
                  {type.label}
                </Label>
              </div>
            </RadioGroup>
          </div>
        ))}
      </div>
      
      {/* Visual examples of building types */}
      <LazyMotion features={domAnimation}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {['residential-single', 'commercial-small', 'mixed-use'].map((type) => (
            <m.div
              key={type}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group cursor-pointer"
              onClick={() => onChange(type)}
            >
              <Card className={`overflow-hidden border ${
                selectedType === type 
                  ? "border-blue-500 shadow-md"
                  : isDarkMode 
                    ? "border-slate-700 hover:border-slate-600" 
                    : "border-gray-200 hover:border-blue-200"
              }`}>
                <div className="relative h-36 overflow-hidden">
                  <img 
                    src={PROJECT_TYPE_IMAGES[type] || ''}
                    alt={`Example of ${type}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end`}>
                    <div className="p-3">
                      <div className="flex items-center">
                        {getIconForType(type)}
                        <span className="text-white font-medium">{
                          type === 'residential-single' ? 'Residential House' :
                          type === 'commercial-small' ? 'Commercial Building' :
                          'Mixed-Use Building'
                        }</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </m.div>
          ))}
        </div>
      </LazyMotion>
    </div>
  );
} 