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

// --- Area and Ratio Validation Utilities ---

export type AreaUnit = 'sq-m' | 'sq-ft' | 'acres' | 'hectare';

export const AREA_UNITS_CONVERSION_TO_SQM: Record<AreaUnit, number> = {
  'sq-m': 1,
  'sq-ft': 0.092903,
  'acres': 4046.86,
  'hectare': 10000,
};

interface ConversionResult {
  valueInSqM?: number;
  error?: string;
}

/**
 * Converts an area value from a given unit to square meters.
 */
export function convertToSquareMeters(
  valueStr: string | undefined,
  unit: string | undefined,
  fieldName: string // e.g., 'Plot Size', 'Building Size'
): ConversionResult {
  if (valueStr === undefined || valueStr.trim() === '') {
    return { error: `${fieldName} value is missing.` };
  }
  if (unit === undefined || unit.trim() === '') {
    return { error: `${fieldName} unit is missing.` };
  }

  const valueNum = parseFloat(valueStr);
  if (isNaN(valueNum)) {
    return { error: `${fieldName} must be a valid number.` };
  }
  if (valueNum <= 0) {
    return { error: `${fieldName} must be a positive number.` };
  }

  const lowerUnit = unit.toLowerCase() as AreaUnit;
  if (!AREA_UNITS_CONVERSION_TO_SQM[lowerUnit]) {
    return {
      error: `${fieldName} unit '${unit}' is not supported. Supported units: ${Object.keys(AREA_UNITS_CONVERSION_TO_SQM).join(', ')}.`,
    };
  }

  return { valueInSqM: valueNum * AREA_UNITS_CONVERSION_TO_SQM[lowerUnit] };
}

/**
 * Validates that the building size is not larger than the plot size.
 */
export function validateBuildingPlotSizeRatio(
  formData: Pick<ProjectFormValues, 'buildingSize' | 'buildingSizeUnit' | 'plotSize' | 'plotSizeUnit'>,
  errors: string[]
): void {
  const buildingConversion = convertToSquareMeters(formData.buildingSize, formData.buildingSizeUnit, 'Building Size');
  const plotConversion = convertToSquareMeters(formData.plotSize, formData.plotSizeUnit, 'Plot Size');

  if (buildingConversion.error) {
    errors.push(buildingConversion.error);
  }
  if (plotConversion.error) {
    errors.push(plotConversion.error);
  }

  if (buildingConversion.valueInSqM !== undefined && plotConversion.valueInSqM !== undefined) {
    if (buildingConversion.valueInSqM > plotConversion.valueInSqM) {
      errors.push('Building size cannot be larger than plot size when converted to common units.');
    }
  }
}

/**
 * Validates the number of storeys against the building size.
 * For example, a multi-storey building should have a reasonable minimum footprint.
 */
export function validateStoreysBuildingSizeRatio(
  formData: Pick<ProjectFormValues, 'storeys' | 'buildingSize' | 'buildingSizeUnit'>,
  errors: string[]
): void {
  if (formData.storeys && formData.buildingSize) {
    const storeys = parseInt(formData.storeys);
    if (isNaN(storeys) || storeys <= 0) {
      errors.push('Number of storeys must be a valid positive number.');
      return; // No further validation if storeys is invalid
    }

    const buildingConversion = convertToSquareMeters(formData.buildingSize, formData.buildingSizeUnit, 'Building Size');

    if (buildingConversion.error) {
      errors.push(buildingConversion.error);
      return; // No further validation if building size is invalid
    }

    if (buildingConversion.valueInSqM !== undefined) {
      // Example validation: Multi-storey buildings should have at least 50 sq-m footprint
      if (storeys > 1 && buildingConversion.valueInSqM < 50) {
        errors.push('Building size is too small for a multi-storey building (min 50 sq-m footprint).');
      }
      // Example validation: Very large buildings should likely be multi-storey
      if (storeys === 1 && buildingConversion.valueInSqM > 500) {
        errors.push('Single-storey building seems unusually large (over 500 sq-m). Consider if storeys count is correct.');
      }
    }
  }
}