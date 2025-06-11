/**
 * ReviewSubmitForm.tsx
 * Final step of the project creation wizard
 * Shows summary of all entered information for review before submission
 */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ProjectFormValues } from '../../pages/CreateProject';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  Building, 
  MapPin, 
  Home, 
  DollarSign, 
  Layers, 
  Sparkles, 
  User, 
  Phone, 
  Mail,
  ChevronDown,
  ChevronUp,
  Edit
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

// Helper function to format currency
const formatCurrency = (value: string, currencyCode: string) => {
  if (!value) return '';
  
  const numericValue = parseFloat(value.replace(/,/g, ''));
  if (isNaN(numericValue)) return value;
  
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(numericValue);
};

export function ReviewSubmitForm() {
  const { getValues } = useFormContext<ProjectFormValues>();
  const formValues = getValues();
  
  // Format the expected start date
  const formattedStartDate = formValues.expectedStartDate ? 
    format(new Date(formValues.expectedStartDate), 'dd MMM yyyy') : 
    'Not specified';
  
  // Format the budget
  const formattedBudget = formValues.budget ? 
    formatCurrency(formValues.budget, formValues.currency) : 
    'Not specified';
  
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white font-inter mb-2">
          Review Your Project Details
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans max-w-2xl mx-auto">
          Please review all information before generating your project plan
        </p>
      </div>
      
      {/* Project Details Section */}
      <ReviewSection
        title="Project Details"
        icon={<Building className="h-5 w-5" />}
        editStep={1}
      >
        <div className="space-y-2">
          <ReviewItem label="Project Name" value={formValues.name} />
          <ReviewItem label="Project Type" value={formValues.type} />
          <ReviewItem label="Description" value={formValues.description || 'Not provided'} />
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <User className="h-4 w-4 mr-1" />
              Owner Information
            </h4>
            <div className="space-y-1 pl-5">
              <ReviewItem label="Owner" value={formValues.owner} />
              <div className="flex items-center text-sm">
                <Phone className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 mr-1.5" />
                <span className="text-gray-600 dark:text-gray-400 mr-1">Phone:</span>
                <span className="font-medium">{formValues.phoneNumber}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 mr-1.5" />
                <span className="text-gray-600 dark:text-gray-400 mr-1">Email:</span>
                <span className="font-medium">{formValues.email}</span>
              </div>
            </div>
          </div>
        </div>
      </ReviewSection>
      
      {/* Location Section */}
      <ReviewSection
        title="Location & Plot"
        icon={<MapPin className="h-5 w-5" />}
        editStep={2}
      >
        <div className="space-y-2">
          <ReviewItem label="Address" value={formValues.location} />
          <ReviewItem label="Region" value={formValues.region} />
          <ReviewItem 
            label="Plot Size" 
            value={`${formValues.plotSize} ${formValues.plotSizeUnit === 'sq-m' ? 'square meters' : 
                   formValues.plotSizeUnit === 'sq-ft' ? 'square feet' : 
                   formValues.plotSizeUnit === 'acres' ? 'acres' : 'hectares'}`} 
          />
          <ReviewItem 
            label="Terrain" 
            value={formValues.terrain || 'Not specified'} 
          />
          <ReviewItem 
            label="Nearby Landmarks" 
            value={formValues.nearbyLandmarks || 'None specified'} 
          />
        </div>
      </ReviewSection>
      
      {/* Building Specs Section */}
      <ReviewSection
        title="Building Specifications"
        icon={<Home className="h-5 w-5" />}
        editStep={3}
      >
        <div className="space-y-2">
          <ReviewItem 
            label="Building Size" 
            value={`${formValues.buildingSize} ${formValues.buildingSizeUnit === 'sq-m' ? 'square meters' : 'square feet'}`} 
          />
          <ReviewItem label="Storeys" value={formValues.storeys} />
          <ReviewItem label="Bedrooms" value={formValues.bedrooms} />
          <ReviewItem label="Bathrooms" value={formValues.bathrooms} />
          <ReviewItem label="Kitchens" value={formValues.kitchens || '1'} />
          <ReviewItem label="Living Areas" value={formValues.livingAreas || '1'} />
          <ReviewItem label="Building Style" value={formValues.buildingStyle || 'Not specified'} />
        </div>
      </ReviewSection>
      
      {/* Budget & Timeline Section */}
      <ReviewSection
        title="Budget & Timeline"
        icon={<DollarSign className="h-5 w-5" />}
        editStep={4}
      >
        <div className="space-y-2">
          <ReviewItem label="Total Budget" value={formattedBudget} />
          <ReviewItem label="Timeframe" value={formValues.timeframe ? `${formValues.timeframe} months` : 'Not specified'} />
          <ReviewItem label="Expected Start Date" value={formattedStartDate} />
        </div>
      </ReviewSection>
      
      {/* Materials Section */}
      <ReviewSection
        title="Materials & Construction"
        icon={<Layers className="h-5 w-5" />}
        editStep={5}
      >
        <div className="space-y-2">
          <ReviewItem label="Structure Type" value={formValues.structureType || 'Not specified'} />
          <ReviewItem label="Foundation Type" value={formValues.foundationType || 'Not specified'} />
          <ReviewItem label="Roof Type" value={formValues.roofType || 'Not specified'} />
          <ReviewItem label="Wall Material" value={formValues.wallMaterial || 'Not specified'} />
          <ReviewItem label="Floor Material" value={formValues.floorMaterial || 'Not specified'} />
        </div>
      </ReviewSection>
      
      {/* Features Section */}
      <ReviewSection
        title="Features & Sustainability"
        icon={<Sparkles className="h-5 w-5" />}
        editStep={6}
      >
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold mb-2 text-slate-900 dark:text-white font-inter">Special Features</h4>
            {formValues.specialFeatures && formValues.specialFeatures.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1 font-opensans">
                {formValues.specialFeatures.map((feature) => (
                  <li key={feature} className="text-slate-700 dark:text-slate-300 capitalize">
                    {feature.replace(/-/g, ' ')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 font-opensans">No special features selected</p>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-2 text-slate-900 dark:text-white font-inter">Sustainability Features</h4>
            {formValues.sustainabilityFeatures && formValues.sustainabilityFeatures.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1 font-opensans">
                {formValues.sustainabilityFeatures.map((feature) => (
                  <li key={feature} className="text-slate-700 dark:text-slate-300 capitalize">
                    {feature.replace(/-/g, ' ')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 font-opensans">No sustainability features selected</p>
            )}
          </div>
          
          <ReviewItem 
            label="Site Constraints" 
            value={formValues.siteConstraints || 'None specified'} 
          />
          
          <ReviewItem 
            label="Local Regulations" 
            value={formValues.localRegulations || 'None specified'} 
          />
        </div>
      </ReviewSection>
      
      {/* Final Confirmation */}
      <Card className="p-6 bg-[#2B6CB0]/5 dark:bg-[#2B6CB0]/10 border border-[#2B6CB0]/20 dark:border-[#2B6CB0]/30 rounded-xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#ED8936] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-inter mb-2">Ready to Generate Your Project Plan</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans leading-relaxed max-w-md mx-auto">
            Click the "Generate Plan" button below to save your project and start the AI generation process
          </p>
        </div>
      </Card>
    </div>
  );
}

// Component for each review section with collapsible content
interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  editStep: number;
}

function ReviewSection({ title, icon, children, editStep }: ReviewSectionProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  
  return (
    <Card className="overflow-hidden border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#2B6CB0] flex items-center justify-center text-white">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-inter">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-[#2B6CB0] dark:text-[#2B6CB0] hover:text-[#2B6CB0]/80 hover:bg-[#2B6CB0]/10 font-opensans"
              onClick={(e) => {
                e.stopPropagation();
                // This would be handled by the parent component to navigate to the specific step
                // For now, we'll just log it
                console.log(`Edit step ${editStep}`);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Edit</span>
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <div className="p-6 bg-white dark:bg-slate-800">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Component for each review item
interface ReviewItemProps {
  label: string;
  value: string;
}

function ReviewItem({ label, value }: ReviewItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline text-sm">
      <span className="text-slate-600 dark:text-slate-400 min-w-[140px] mb-0.5 sm:mb-0 font-opensans">
        {label}:
      </span>
      <span className="font-medium text-slate-900 dark:text-white font-opensans">
        {value}
      </span>
    </div>
  );
}
