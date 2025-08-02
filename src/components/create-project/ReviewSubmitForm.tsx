/**
 * ReviewSubmitForm.tsx
 * Final step of the project creation wizard - Redesigned for BuildEase
 * Features a stunning image gallery, professional layout, and comprehensive project summary
 * Utilizes Zustand store for state management
 */
import React, { useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { CreateProjectFormValues } from '../../pages/CreateProject/schema';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { cn } from '@/utils/core/ui';
import { 
  Building, 
  MapPin, 
  Home, 
  DollarSign, 
  Layers, 
  Sparkles, 
  User,
  Camera,
  Check,
  Lightbulb,
  FileText,
  Info,
  Star,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';

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

// Helper function to capitalize text
const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/-/g, ' ');
};

// Optional form field options
const STRUCTURE_TYPES = [
  { value: 'ai-recommend', label: 'Let AI recommend' },
  { value: 'concrete-frame', label: 'Concrete Frame' },
  { value: 'steel-frame', label: 'Steel Frame' },
  { value: 'masonry', label: 'Masonry' },
  { value: 'wood-frame', label: 'Wood Frame' },
  { value: 'hybrid', label: 'Hybrid Construction' }
];

const FOUNDATION_TYPES = [
  { value: 'ai-recommend', label: 'Let AI recommend' },
  { value: 'strip-foundation', label: 'Strip Foundation' },
  { value: 'pad-foundation', label: 'Pad Foundation' },
  { value: 'raft-foundation', label: 'Raft Foundation' },
  { value: 'pile-foundation', label: 'Pile Foundation' }
];

const ROOF_TYPES = [
  { value: 'ai-recommend', label: 'Let AI recommend' },
  { value: 'gable', label: 'Gable Roof' },
  { value: 'hip', label: 'Hip Roof' },
  { value: 'flat', label: 'Flat Roof' },
  { value: 'shed', label: 'Shed Roof' },
  { value: 'mansard', label: 'Mansard Roof' }
];

const WALL_MATERIALS = [
  { value: 'ai-recommend', label: 'Let AI recommend' },
  { value: 'concrete-blocks', label: 'Concrete Blocks' },
  { value: 'clay-bricks', label: 'Clay Bricks' },
  { value: 'sandcrete-blocks', label: 'Sandcrete Blocks' },
  { value: 'stone', label: 'Natural Stone' },
  { value: 'compressed-earth', label: 'Compressed Earth Blocks' }
];

const FLOOR_MATERIALS = [
  { value: 'ai-recommend', label: 'Let AI recommend' },
  { value: 'ceramic-tiles', label: 'Ceramic Tiles' },
  { value: 'porcelain-tiles', label: 'Porcelain Tiles' },
  { value: 'concrete-screed', label: 'Concrete Screed' },
  { value: 'terrazzo', label: 'Terrazzo' },
  { value: 'natural-stone', label: 'Natural Stone' },
  { value: 'hardwood', label: 'Hardwood' }
];

const SPECIAL_FEATURES = [
  'swimming-pool', 'garage', 'basement', 'attic', 'balcony', 'patio', 
  'garden', 'security-system', 'cctv', 'generator-room', 'water-tank',
  'solar-panels', 'backup-power', 'home-office', 'gym', 'library',
  'entertainment-room', 'guest-house', 'servants-quarters', 'laundry-room'
];

const SUSTAINABILITY_FEATURES = [
  'solar-panels', 'rainwater-harvesting', 'energy-efficient-lighting',
  'double-glazed-windows', 'insulation', 'natural-ventilation',
  'green-roof', 'recycled-materials', 'low-flow-fixtures',
  'smart-home-systems', 'waste-management', 'native-landscaping'
];

// Section component for organized display
interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function ReviewSection({ title, icon, children, className = '' }: ReviewSectionProps) {
  return (
    <Card className={cn("border border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800 rounded-lg", className)}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#2B6CB0]/10 dark:bg-[#2B6CB0]/20 rounded-lg flex items-center justify-center border border-[#2B6CB0]/20">
            <div className="text-[#2B6CB0]">
              {icon}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
            {title}
          </h3>
        </div>
        {children}
      </div>
    </Card>
  );
}

// Info item component
interface InfoItemProps {
  label: string;
  value: string | number;
  className?: string;
}

function InfoItem({ label, value, className = '' }: InfoItemProps) {
  return (
    <div className={cn("p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 space-y-2", className)}>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-opensans">
        {label}
      </p>
      <p className="text-base font-semibold text-slate-900 dark:text-white font-inter">
        {value || <span className="text-slate-400 dark:text-slate-500 font-normal">Not specified</span>}
      </p>
    </div>
  );
}

function ReviewSubmitForm() {
  const { control, watch } = useFormContext<CreateProjectFormValues>();
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  
  // Watch form values to get reactive updates without causing infinite loops
  const formValues = watch();
  
  // Memoize computed values to prevent unnecessary recalculations
  const formattedStartDate = useMemo(() => {
    return formValues.expectedStartDate ? 
      format(new Date(formValues.expectedStartDate), 'dd MMM yyyy') : 
      'To be determined';
  }, [formValues.expectedStartDate]);

  // For now, we'll skip the image gallery to avoid store issues
  // This can be re-enabled once the store architecture is stabilized
  const localFiles: { id: string; previewUrl: string; file: File }[] = [];
  const localProfileImageId: string | null = null;
  const profileImage = null;

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-8">
        {/* Header Section */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#2B6CB0] to-[#ED8936] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-inter mb-2">
            Review Your Project
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-opensans max-w-2xl mx-auto">
            Please review all the details below. Once you submit, our AI will start generating 
            a comprehensive construction plan tailored to your requirements.
          </p>
        </m.div>

        {/* Project Images Gallery */}
        {localFiles.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ReviewSection
              title="Inspiration Images"
              icon={<Camera className="h-4 w-4" />}
            >
              <div className="space-y-4">
                {/* Main Image Display */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  {profileImage && (
                    <>
                      <img
                        src={profileImage.previewUrl}
                        alt="Main inspiration"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white border-0">
                          <Star className="h-3 w-3 mr-1" />
                          Main Image
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                {/* Simple Thumbnail Gallery */}
                {localFiles.length > 1 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 font-opensans">
                      All Images ({localFiles.length})
                    </h4>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {localFiles.map((file, index) => (
                        <div
                          key={file.id}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden border-2",
                            file.id === localProfileImageId
                              ? "border-[#ED8936]"
                              : "border-slate-200 dark:border-slate-600"
                          )}
                        >
                          <img
                            src={file.previewUrl}
                            alt={`Inspiration ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {file.id === localProfileImageId && (
                            <div className="absolute top-1 right-1">
                              <div className="w-4 h-4 bg-[#ED8936] rounded-full flex items-center justify-center">
                                <Star className="h-2 w-2 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-opensans">
                    <Info className="h-4 w-4 text-[#2B6CB0]" />
                    <span>
                      {localFiles.length} inspiration image{localFiles.length !== 1 ? 's' : ''} uploaded
                      {profileImage && ' • Main image selected'}
                    </span>
                  </div>
                </div>
              </div>
            </ReviewSection>
          </m.div>
        )}

        {/* Project Overview */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ReviewSection
            title="Project Overview"
            icon={<Building className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Project Name" value={formValues.name} />
              <InfoItem label="Project Type" value={capitalize(formValues.projectType)} />
              {formValues.description && (
                <div className="md:col-span-2">
                  <InfoItem label="Description" value={formValues.description} />
                </div>
              )}
            </div>
            
            {/* Owner Details */}
            {(formValues.owner || formValues.email || formValues.phoneNumber) && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 font-inter">
                  <div className="w-8 h-8 bg-[#2B6CB0]/10 dark:bg-[#2B6CB0]/20 rounded-lg flex items-center justify-center border border-[#2B6CB0]/20">
                    <User className="h-4 w-4 text-[#2B6CB0]" />
                  </div>
                  Owner Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formValues.owner && <InfoItem label="Owner" value={formValues.owner} />}
                  {formValues.email && <InfoItem label="Email" value={formValues.email} />}
                  {formValues.phoneNumber && <InfoItem label="Phone" value={formValues.phoneNumber} />}
                </div>
              </div>
            )}
          </ReviewSection>
        </m.div>

        {/* Location Details */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ReviewSection
            title="Location & Site"
            icon={<MapPin className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoItem label="Location" value={formValues.location} />
              <InfoItem label="Region" value={capitalize(formValues.region)} />
              <InfoItem label="Country" value={capitalize(formValues.country)} />
              <InfoItem 
                label="Plot Size" 
                value={`${formValues.plotSize} ${formValues.plotSizeUnit?.replace('-', ' ')}`} 
              />
              {formValues.terrain && <InfoItem label="Terrain" value={capitalize(formValues.terrain)} />}
              {formValues.nearbyLandmarks && (
                <div className="lg:col-span-3">
                  <InfoItem label="Nearby Landmarks" value={formValues.nearbyLandmarks} />
                </div>
              )}
            </div>
          </ReviewSection>
        </m.div>

        {/* Building Specifications */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ReviewSection
            title="Building Specifications"
            icon={<Home className="h-4 w-4" />}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <InfoItem 
                label="Building Size" 
                value={`${formValues.buildingSize} ${formValues.buildingSizeUnit?.replace('-', ' ')}`} 
              />
              <InfoItem label="Storeys" value={formValues.storeys} />
              <InfoItem label="Bedrooms" value={formValues.bedrooms} />
              <InfoItem label="Bathrooms" value={formValues.bathrooms} />
              {formValues.kitchens && <InfoItem label="Kitchens" value={formValues.kitchens} />}
              {formValues.livingAreas && <InfoItem label="Living Areas" value={formValues.livingAreas} />}
              {formValues.buildingStyle && (
                <div className="col-span-2">
                  <InfoItem label="Building Style" value={capitalize(formValues.buildingStyle)} />
                </div>
              )}
            </div>
          </ReviewSection>
        </m.div>

        {/* Budget & Timeline */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ReviewSection
            title="Budget & Timeline"
            icon={<DollarSign className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoItem 
                label="Total Budget" 
                value={formatCurrency(formValues.budget, formValues.currency)} 
              />
              {formValues.timeframe && <InfoItem label="Timeframe" value={formValues.timeframe} />}
              <InfoItem label="Expected Start" value={formattedStartDate} />
            </div>
          </ReviewSection>
        </m.div>

        {/* Materials & Construction */}
        {(formValues.structureType || formValues.foundationType || formValues.roofType || formValues.wallMaterial || formValues.floorMaterial) && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ReviewSection
              title="Materials & Construction"
              icon={<Layers className="h-4 w-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formValues.structureType && <InfoItem label="Structure Type" value={capitalize(formValues.structureType)} />}
                {formValues.foundationType && <InfoItem label="Foundation" value={capitalize(formValues.foundationType)} />}
                {formValues.roofType && <InfoItem label="Roof Type" value={capitalize(formValues.roofType)} />}
                {formValues.wallMaterial && <InfoItem label="Wall Material" value={capitalize(formValues.wallMaterial)} />}
                {formValues.floorMaterial && <InfoItem label="Floor Material" value={capitalize(formValues.floorMaterial)} />}
              </div>
            </ReviewSection>
          </m.div>
        )}

        {/* Special Features */}
        {(formValues.specialFeatures?.length || formValues.sustainabilityFeatures?.length) && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <ReviewSection
              title="Special Features"
              icon={<Sparkles className="h-4 w-4" />}
            >
              <div className="space-y-6">
                {(formValues.specialFeatures?.length ?? 0) > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Special Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formValues.specialFeatures?.map((feature: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-[#2B6CB0]/10 text-[#2B6CB0] border-[#2B6CB0]/20"
                        >
                          {capitalize(feature)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {(formValues.sustainabilityFeatures?.length ?? 0) > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Sustainability Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formValues.sustainabilityFeatures?.map((feature: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300"
                        >
                          {capitalize(feature)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ReviewSection>
          </m.div>
        )}

        {/* Additional Notes */}
        {(formValues.siteConstraints || formValues.localRegulations || formValues.additionalNotes) && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <ReviewSection
              title="Additional Information"
              icon={<FileText className="h-4 w-4" />}
            >
              <div className="space-y-6">
                {formValues.siteConstraints && (
                  <InfoItem label="Site Constraints" value={formValues.siteConstraints} />
                )}
                {formValues.localRegulations && (
                  <InfoItem label="Local Regulations" value={formValues.localRegulations} />
                )}
                {formValues.additionalNotes && (
                  <InfoItem label="Additional Notes" value={formValues.additionalNotes} />
                )}
              </div>
            </ReviewSection>
          </m.div>
        )}

        {/* Optional Details Section - Expandable Form */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="border border-slate-200 dark:border-slate-700 bg-[#ED8936]/5 dark:bg-[#ED8936]/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ED8936]/20 dark:bg-[#ED8936]/30 rounded-lg flex items-center justify-center border border-[#ED8936]/30">
                    <Settings className="h-4 w-4 text-[#ED8936]" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                    Optional Specifications
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="flex items-center gap-2 border border-[#ED8936]/30 text-[#ED8936] hover:bg-[#ED8936]/10"
                >
                  {showOptionalFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showOptionalFields ? 'Hide Details' : 'Add Preferences'}
                </Button>
              </div>
              
              <div className="text-sm text-slate-600 dark:text-slate-400 font-opensans mb-4">
                Our AI will make smart recommendations, but you can specify preferences below if you have specific requirements.
              </div>
              
              {showOptionalFields && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-600"
                >
                  {/* Materials & Construction */}
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Materials & Construction
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={control}
                        name="structureType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Structure Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {STRUCTURE_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="foundationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Foundation Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {FOUNDATION_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="roofType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Roof Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ROOF_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="wallMaterial"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Wall Material</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {WALL_MATERIALS.map((material) => (
                                  <SelectItem key={material.value} value={material.value}>
                                    {material.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="floorMaterial"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Floor Material</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {FLOOR_MATERIALS.map((material) => (
                                  <SelectItem key={material.value} value={material.value}>
                                    {material.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Special Features */}
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Special Features
                    </h4>
                    
                    <FormField
                      control={control}
                      name="specialFeatures"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {SPECIAL_FEATURES.map((feature) => (
                              <FormField
                                key={feature}
                                control={control}
                                name="specialFeatures"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={feature}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(feature)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, feature])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== feature
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {capitalize(feature)}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Sustainability Features */}
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter flex items-center gap-2">
                      🌱 Sustainability Features
                    </h4>
                    
                    <FormField
                      control={control}
                      name="sustainabilityFeatures"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {SUSTAINABILITY_FEATURES.map((feature) => (
                              <FormField
                                key={feature}
                                control={control}
                                name="sustainabilityFeatures"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={feature}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(feature)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, feature])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== feature
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {capitalize(feature)}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white font-inter flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Additional Information
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="siteConstraints"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Site Constraints</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any site limitations, access issues, etc."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="localRegulations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Local Regulations</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any local building codes or regulations to consider"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={control}
                      name="additionalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any other requirements, preferences, or important information"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </m.div>
              )}

              {/* Show current selections if fields are filled */}
              {!showOptionalFields && (formValues.structureType || formValues.specialFeatures?.length || formValues.sustainabilityFeatures?.length || formValues.siteConstraints || formValues.additionalNotes) && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Selections:</p>
                  
                  {/* Material Preferences */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formValues.structureType && (
                      <InfoItem label="Structure Type" value={capitalize(formValues.structureType)} />
                    )}
                    {formValues.foundationType && (
                      <InfoItem label="Foundation Type" value={capitalize(formValues.foundationType)} />
                    )}
                    {formValues.roofType && (
                      <InfoItem label="Roof Type" value={capitalize(formValues.roofType)} />
                    )}
                    {formValues.wallMaterial && (
                      <InfoItem label="Wall Material" value={capitalize(formValues.wallMaterial)} />
                    )}
                    {formValues.floorMaterial && (
                      <InfoItem label="Floor Material" value={capitalize(formValues.floorMaterial)} />
                    )}
                  </div>
                  
                  {/* Special Features */}
                  {(formValues.specialFeatures && formValues.specialFeatures.length > 0) && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-opensans">
                        Special Features
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formValues.specialFeatures.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="bg-[#2B6CB0]/10 text-[#2B6CB0] border-[#2B6CB0]/20">
                            {capitalize(feature)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Sustainability Features */}
                  {(formValues.sustainabilityFeatures && formValues.sustainabilityFeatures.length > 0) && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-opensans">
                        Sustainability Features
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formValues.sustainabilityFeatures.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {capitalize(feature)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </m.div>

        {/* Submission Information */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="border-2 border-[#2B6CB0]/20 bg-gradient-to-br from-[#2B6CB0]/5 to-[#ED8936]/5">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2B6CB0] to-[#ED8936] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
                    Ready to Generate Your Plan?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-opensans">
                    Our AI will analyze your requirements and create a detailed construction plan including 
                    phases, timelines, material estimates, and cost breakdowns. This process typically takes 
                    a few minutes.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Info className="h-4 w-4" />
                    <span className="font-opensans">
                      You can modify your project details even after submission.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </m.div>
      </div>
    </LazyMotion>
  );
}

// Export for both named and default
export { ReviewSubmitForm };
export default ReviewSubmitForm;