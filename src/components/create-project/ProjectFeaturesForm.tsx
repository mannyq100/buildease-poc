/**
 * Project features and special requirements form component
 */
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building, Leaf, Sparkles, Info } from 'lucide-react';

interface ProjectFeaturesFormProps {
  specialFeatures: string[];
  sustainabilityFeatures: string[];
  accessibilityNeeds: string;
  traditionalElements: boolean;
  siteConstraints: string;
  additionalNotes: string;
  onInputChange: (field: string, value: string | boolean | string[]) => void;
  onArrayToggle: (field: 'specialFeatures' | 'sustainabilityFeatures', value: string) => void;
  isDarkMode: boolean;
}

// Feature categories with enhanced styling
const featureCategories = {
  sustainability: {
    title: "Sustainable Features",
    icon: <Leaf className="h-5 w-5 text-green-500" />,
    description: "Select environmentally friendly options for your project",
    activeClass: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    checkboxClass: "text-green-500 border-green-500",
    items: [
      { value: 'solar-power', label: 'Solar Power', icon: '☀️' },
      { value: 'rainwater-harvesting', label: 'Rainwater Harvesting', icon: '💧' },
      { value: 'natural-ventilation', label: 'Natural Ventilation', icon: '🌬️' },
      { value: 'energy-efficient', label: 'Energy Efficient Appliances', icon: '⚡' },
      { value: 'passive-cooling', label: 'Passive Cooling', icon: '❄️' },
      { value: 'green-roof', label: 'Green Roof', icon: '🌱' },
      { value: 'recycled-materials', label: 'Recycled Building Materials', icon: '♻️' },
      { value: 'water-efficient', label: 'Water Efficient Fixtures', icon: '🚿' }
    ]
  },
  special: {
    title: "Special Features",
    icon: <Sparkles className="h-5 w-5 text-blue-500" />,
    description: "Add special amenities to enhance your project",
    activeClass: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    checkboxClass: "text-blue-500 border-blue-500",
    items: [
      { value: 'pool', label: 'Swimming Pool', icon: '🏊‍♂️' },
      { value: 'garden', label: 'Garden', icon: '🌳' },
      { value: 'gym', label: 'Home Gym', icon: '🏋️‍♂️' },
      { value: 'outdoor-kitchen', label: 'Outdoor Kitchen', icon: '🍳' },
      { value: 'entertainment', label: 'Entertainment Room', icon: '🎮' },
      { value: 'study', label: 'Study/Library', icon: '📚' },
      { value: 'guest-house', label: 'Guest House', icon: '🏠' },
      { value: 'balcony', label: 'Balcony', icon: '🌇' },
      { value: 'rooftop', label: 'Rooftop Terrace', icon: '🏙️' },
      { value: 'smart-home', label: 'Smart Home Technology', icon: '📱' }
    ]
  }
};

export function ProjectFeaturesForm({
  specialFeatures,
  sustainabilityFeatures,
  accessibilityNeeds,
  traditionalElements,
  siteConstraints,
  additionalNotes,
  onInputChange,
  onArrayToggle,
  isDarkMode
}: ProjectFeaturesFormProps) {
  const textareaClass = `min-h-[80px] transition-all duration-300 ${
    isDarkMode 
      ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
      : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
  }`;
  
  const labelClass = `font-medium ${
    isDarkMode ? "text-slate-300" : "text-gray-900"
  }`;

  // Render a section of feature checkboxes
  const renderFeatureSection = (category: 'sustainability' | 'special', selectedFeatures: string[]) => {
    const categoryData = category === 'sustainability' ? featureCategories.sustainability : featureCategories.special;
    const field = category === 'sustainability' ? 'sustainabilityFeatures' as const : 'specialFeatures' as const;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-5">
          {categoryData.icon}
          <div>
            <h3 className={`font-medium text-lg ${isDarkMode ? "text-slate-200" : "text-gray-900"}`}>
              {categoryData.title}
            </h3>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
              {categoryData.description}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categoryData.items.map(feature => {
            const isSelected = selectedFeatures.includes(feature.value);
            
            return (
              <div 
                key={feature.value} 
                className={`flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                  isSelected
                    ? categoryData.activeClass
                    : 'border-gray-200 hover:border-gray-300 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
                onClick={() => onArrayToggle(field, feature.value)}
              >
                <Checkbox 
                  id={`feature-${feature.value}`} 
                  checked={isSelected}
                  onCheckedChange={() => onArrayToggle(field, feature.value)}
                  className={`mt-0.5 ${isSelected ? categoryData.checkboxClass : ''}`}
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor={`feature-${feature.value}`}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-lg">{feature.icon}</span>
                    <span className="font-medium">{feature.label}</span>
                  </Label>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                    {feature.value === 'solar-power' && "Generate clean electricity from sunlight"}
                    {feature.value === 'rainwater-harvesting' && "Collect and store rainwater for later use"}
                    {feature.value === 'pool' && "For leisure and exercise"}
                    {feature.value === 'garden' && "Landscaped outdoor green space"}
                    {/* Add descriptions for other features */}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Sustainable Features Section */}
      <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950">
        {renderFeatureSection('sustainability', sustainabilityFeatures)}
      </div>
      
      {/* Special Features Section */}
      <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950">
        {renderFeatureSection('special', specialFeatures)}
      </div>
      
      {/* Additional Requirements Section */}
      <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950">
        <h3 className={`font-medium text-lg mb-5 ${isDarkMode ? "text-slate-200" : "text-gray-900"}`}>
          Additional Requirements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="accessibilityNeeds" className={labelClass}>
              Accessibility Needs
            </Label>
            <Textarea
              id="accessibilityNeeds"
              placeholder="Describe any accessibility requirements (e.g., ramps, wider doorways)"
              value={accessibilityNeeds}
              onChange={(e) => onInputChange('accessibilityNeeds', e.target.value)}
              className={textareaClass}
            />
          </div>
          
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
              <Label className={`${labelClass} block mb-2`}>
                Traditional Elements
              </Label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={traditionalElements}
                  onCheckedChange={(checked) => onInputChange('traditionalElements', checked)}
                  className={traditionalElements ? "bg-amber-500" : ""}
                />
                <Label className="font-normal">
                  Include traditional Ghanaian architectural elements
                </Label>
              </div>
            </div>
            
            <div className="space-y-2 mt-3">
              <Label htmlFor="siteConstraints" className={labelClass}>
                Site Constraints
              </Label>
              <Textarea
                id="siteConstraints"
                placeholder="Describe any site constraints (e.g., access issues, neighboring structures)"
                value={siteConstraints}
                onChange={(e) => onInputChange('siteConstraints', e.target.value)}
                className={textareaClass}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <Label htmlFor="additionalNotes" className={labelClass}>
            Additional Notes or Requirements
          </Label>
          <Textarea
            id="additionalNotes"
            placeholder="Add any additional information that might be helpful for planning your project"
            value={additionalNotes}
            onChange={(e) => onInputChange('additionalNotes', e.target.value)}
            className={`min-h-[100px] ${textareaClass}`}
          />
        </div>
      </div>
      
      <div className="mt-6 p-5 border-l-4 border-l-green-500 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 text-blue-800 dark:text-blue-300">
        <h4 className="font-medium mb-2 flex items-center">
          <Building className="h-5 w-5 mr-2 text-green-500" />
          Ready to Generate Your Project Plan
        </h4>
        <p className="text-sm">
          After completing this form, our AI will generate a comprehensive construction project plan
          tailored to your specific requirements and local Ghanaian construction practices.
        </p>
      </div>
    </div>
  );
} 