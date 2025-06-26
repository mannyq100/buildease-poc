/**
 * ReviewSubmitForm.tsx
 * Final step of the project creation wizard - Redesigned for BuildEase
 * Features a stunning image gallery, professional layout, and comprehensive project summary
 * Utilizes Zustand store for state management
 */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { CreateProjectFormValues } from '../../pages/CreateProject';
import { useCreateProjectImages } from '@/stores/createProjectStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Star
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

export function ReviewSubmitForm() {
  const { getValues } = useFormContext<CreateProjectFormValues>();
  const { localFiles, localProfileImageId } = useCreateProjectImages();
  
  // Get current form values from react-hook-form
  const formValues = getValues();
  
  // Format the expected start date
  const formattedStartDate = formValues.expectedStartDate ? 
    format(new Date(formValues.expectedStartDate), 'dd MMM yyyy') : 
    'To be determined';

  // Get profile image
  const profileImage = localFiles.find(file => file.id === localProfileImageId);

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