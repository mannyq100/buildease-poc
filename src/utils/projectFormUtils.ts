/**
 * Utility functions for project form handling
 */
import { ProjectFormValues } from '@/pages/CreateProject';

/**
 * Calculates form completion percentage
 */
export function calculateFormProgress(data: ProjectFormValues): number {
  const requiredFields = [
    'name', 'type', 'location', 'country', 'region', 
    'plotSize', 'plotSizeUnit', 'buildingSize', 'buildingSizeUnit',
    'storeys', 'bedrooms', 'bathrooms', 'budget', 'currency'
  ];
  
  const optionalFields = [
    'description', 'owner', 'phoneNumber', 'email', 'terrain',
    'nearbyLandmarks', 'kitchens', 'livingAreas', 'buildingStyle',
    'timeframe', 'expectedStartDate', 'structureType', 'foundationType',
    'roofType', 'wallMaterial', 'floorMaterial', 'specialFeatures',
    'sustainabilityFeatures', 'siteConstraints', 'localRegulations',
    'additionalNotes', 'images'
  ];
  
  let filledFields = 0;
  
  // Count required fields (weight: 2)
  requiredFields.forEach(field => {
    const value = data[field as keyof ProjectFormValues];
    if (value && value !== '' && (!Array.isArray(value) || value.length > 0)) {
      filledFields += 2;
    }
  });
  
  // Count optional fields (weight: 1)
  optionalFields.forEach(field => {
    const value = data[field as keyof ProjectFormValues];
    if (value && value !== '' && (!Array.isArray(value) || value.length > 0)) {
      filledFields += 1;
    }
  });
  
  const maxScore = (requiredFields.length * 2) + optionalFields.length;
  return Math.round((filledFields / maxScore) * 100);
}

/**
 * Formats currency display
 */
export function formatCurrencyDisplay(amount: string, currency: string): string {
  if (!amount) return '';
  
  try {
    const numericValue = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numericValue)) return amount;
    
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(numericValue);
  } catch {
    return amount;
  }
}

/**
 * Validates step-specific data
 */
export function validateStepData(data: ProjectFormValues, step: number): string[] {
  const errors: string[] = [];
  
  switch (step) {
    case 1: // Project Details
      if (!data.name || data.name.trim().length < 3) {
        errors.push('Project name must be at least 3 characters');
      }
      if (!data.type) {
        errors.push('Please select a project type');
      }
      break;
      
    case 2: // Location
      if (!data.location?.trim()) {
        errors.push('Location is required');
      }
      if (!data.country) {
        errors.push('Country is required');
      }
      if (!data.region) {
        errors.push('Region is required');
      }
      if (!data.plotSize || parseFloat(data.plotSize) <= 0) {
        errors.push('Valid plot size is required');
      }
      break;
      
    case 3: // Building Specs
      if (!data.buildingSize || parseFloat(data.buildingSize) <= 0) {
        errors.push('Valid building size is required');
      }
      if (!data.storeys || parseInt(data.storeys) < 1) {
        errors.push('Number of storeys is required');
      }
      if (!data.bedrooms || parseInt(data.bedrooms) < 1) {
        errors.push('Number of bedrooms is required');
      }
      if (!data.bathrooms || parseInt(data.bathrooms) < 1) {
        errors.push('Number of bathrooms is required');
      }
      break;
      
    case 4: // Budget
      if (!data.budget || parseFloat(data.budget.replace(/,/g, '')) <= 0) {
        errors.push('Valid budget amount is required');
      }
      if (!data.currency) {
        errors.push('Currency is required');
      }
      break;
      
    case 5: // Materials (optional)
    case 6: // Features (optional)
    case 7: // Review (no validation)
      break;
  }
  
  return errors;
}

/**
 * Gets step title and description
 */
export function getStepInfo(step: number): { title: string; description: string } {
  const stepMap = {
    1: { title: 'Project Details', description: 'Basic project information' },
    2: { title: 'Location', description: 'Location and plot details' },
    3: { title: 'Building', description: 'Building specifications' },
    4: { title: 'Budget', description: 'Budget and timeline' },
    5: { title: 'Materials', description: 'Construction materials' },
    6: { title: 'Features', description: 'Special features' },
    7: { title: 'Review', description: 'Review and submit' }
  };
  
  return stepMap[step as keyof typeof stepMap] || { title: 'Unknown', description: '' };
}

/**
 * Estimates project timeline based on specs
 */
export function estimateProjectTimeline(data: ProjectFormValues): string {
  const buildingSize = data.buildingSize ? parseFloat(data.buildingSize) : 0;
  const storeys = data.storeys ? parseInt(data.storeys) : 1;
  
  // Basic estimation formula (this would be enhanced with AI)
  let baseMonths = 6; // Minimum project duration
  
  // Add time based on building size
  if (buildingSize > 100) baseMonths += 2;
  if (buildingSize > 200) baseMonths += 3;
  if (buildingSize > 300) baseMonths += 4;
  
  // Add time for multiple storeys
  if (storeys > 1) baseMonths += (storeys - 1) * 2;
  
  // Add time for complex features
  const hasComplexFeatures = data.specialFeatures?.some(feature => 
    ['swimming-pool', 'outdoor-kitchen', 'gym'].includes(feature)
  );
  if (hasComplexFeatures) baseMonths += 2;
  
  return `${Math.min(baseMonths, 24)} months (estimated)`;
}