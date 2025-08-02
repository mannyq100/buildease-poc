/**
 * Create Project Form Schema
 * Zod validation schema for the Create Project wizard
 */

import * as z from 'zod';

// Optimized Project form schema - Simplified for better UX
export const projectFormSchema = z.object({
  // Essential Information - Step 1
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100),
  description: z.string().optional(),
  projectType: z.string().min(1, 'Please select a project type'),
  owner: z.string().optional(), // Made optional - only required if different owner
  phoneNumber: z.string().optional(),
  email: z.string().optional(), // Made optional - only required if different owner
  
  // Location Essentials - Step 2
  location: z.string().min(1, 'Street address is required'),
  city: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  region: z.string().min(1, 'Region is required'),
  plotSize: z.string().min(1, 'Plot size is required'),
  plotSizeUnit: z.string().min(1, 'Unit is required'),
  terrain: z.string().optional(),
  nearbyLandmarks: z.string().optional(),
  
  // Core Building Requirements - Step 3
  buildingSize: z.string().min(1, 'Building size is required'),
  buildingSizeUnit: z.string().min(1, 'Unit is required'),
  storeys: z.string().min(1, 'Number of storeys is required'),
  bedrooms: z.string().min(1, 'Number of bedrooms is required'),
  bathrooms: z.string().min(1, 'Number of bathrooms is required'),
  kitchens: z.string().optional(),
  livingAreas: z.string().optional(),
  buildingStyle: z.string().optional(),
  
  // Budget Essentials - Step 4
  budget: z.string().min(1, 'Budget is required'),
  currency: z.string().min(1, 'Currency is required'),
  timeframe: z.string().optional(), // Made optional - AI can suggest
  expectedStartDate: z.string().optional(), // Made optional - flexible planning
  
  // Basic Materials - Step 5 (simplified - AI can suggest specifics)
  structureType: z.string().optional(), // Made optional - AI can recommend
  foundationType: z.string().optional(), // Made optional - based on terrain
  roofType: z.string().optional(), // Made optional - based on style/climate
  wallMaterial: z.string().optional(), // Made optional - AI recommendation
  floorMaterial: z.string().optional(), // Made optional - AI recommendation
  
  // Preferences & Features - Step 6 (all optional for customization)
  specialFeatures: z.array(z.string()).default([]).transform(arr => arr && arr.length > 0 ? arr : undefined),
  sustainabilityFeatures: z.array(z.string()).default([]).transform(arr => arr && arr.length > 0 ? arr : undefined),
  
  // Additional Context - Step 7 (optional details)
  siteConstraints: z.string().optional(),
  localRegulations: z.string().optional(),
  additionalNotes: z.string().optional(),
  
  // Inspiration Images
  images: z.array(z.string()).default([]).transform(arr => arr && arr.length > 0 ? arr : undefined),
  profileImage: z.string().optional(), // Selected profile/display image
});

// Form data type
export type CreateProjectFormValues = z.infer<typeof projectFormSchema>;
