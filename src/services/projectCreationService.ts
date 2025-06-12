/**
 * Project Creation Service
 * Handles the database operations for creating new projects
 */
import { supabase } from '@/lib/supabase';
import { ProjectFormValues } from '@/pages/CreateProject';
import { validateBuildingPlotSizeRatio, validateStoreysBuildingSizeRatio } from '@/utils/projectFormUtils';
import { Currency, Project, ProjectInsert, TABLE_NAMES, UserRole } from '@/types/database';

export interface CreateProjectResult {
  success: boolean;
  project?: Project;
  error?: string;
}

/**
 * Creates a new project in the database with all form data
 */
export async function createProject(formData: ProjectFormValues, userId: string): Promise<CreateProjectResult> {
  try {
    // Prepare the project data to match the database schema
    const projectData: ProjectInsert = {
      name: formData.name,
      description: formData.description || null,
      status: 'PLANNING', // Match the enum from schema
      owner_id: userId,
      plan_approved: false,
      
      // Structure details in JSONB format according to schema
      details: {
        // Location information
        location: {
          address: formData.location,
          country: formData.country,
          region: formData.region,
          terrain: formData.terrain || null,
          nearby_landmarks: formData.nearbyLandmarks || null,
          coordinates: null // Could be added later with geocoding
        },
        
        // Specifications
        specs: {
          plot_size: formData.plotSize ? {
            value: parseFloat(formData.plotSize),
            unit: formData.plotSizeUnit
          } : null,
          building_size: formData.buildingSize ? {
            value: parseFloat(formData.buildingSize), 
            unit: formData.buildingSizeUnit
          } : null,
          floors: formData.storeys ? parseInt(formData.storeys) : null,
          rooms: {
            bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
            bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
            kitchens: formData.kitchens ? parseInt(formData.kitchens) : 1,
            living_areas: formData.livingAreas ? parseInt(formData.livingAreas) : 1
          }
        },
        
        // Project type and style
        project_type: formData.type,
        building_style: formData.buildingStyle || null,
        
        // Materials and construction
        materials: {
          structure_type: formData.structureType || null,
          foundation_type: formData.foundationType || null,
          roof_type: formData.roofType || null,
          wall_material: formData.wallMaterial || null,
          floor_material: formData.floorMaterial || null
        },
        
        // Features
        features: {
          special_features: formData.specialFeatures || [],
          sustainability_features: formData.sustainabilityFeatures || []
        },
        
        // Additional information
        constraints: {
          site_constraints: formData.siteConstraints || null,
          local_regulations: formData.localRegulations || null,
          additional_notes: formData.additionalNotes || null
        },
        
        // Owner information if different
        owner_info: formData.owner || formData.phoneNumber || formData.email ? {
          name: formData.owner || null,
          phone: formData.phoneNumber || null,
          email: formData.email || null
        } : null,
        
        // References
        images: formData.images || []
      },
      
      // Timeline information
      timeline: {
        planned_start: formData.expectedStartDate || null,
        planned_end: null, // Will be calculated by AI based on phases
        actual_start: null,
        actual_end: null,
        timeframe_months: formData.timeframe ? parseInt(formData.timeframe) : null
      },
      
      // Budget information
      budget: {
        allocated: formData.budget ? parseFloat(formData.budget.replace(/,/g, '')) : 0,
        spent: 0,
        currency: (formData.currency as Currency) || 'GHS'
      }
    };
    
    // Generate a UUID for the project to ensure we can retrieve it reliably
    const projectId = crypto.randomUUID();
    const projectDataWithId = { ...projectData, id: projectId };
    
    // Insert project with known ID
    const { error: insertError } = await supabase
      .from(TABLE_NAMES.PROJECTS)
      .insert([projectDataWithId]);
      
    if (insertError) {
      console.error('Error inserting project:', insertError);
      return {
        success: false,
        error: `Database error: ${insertError.message}`
      };
    }
    
    // Fetch the project by the known ID
    const { data: createdProject, error: fetchError } = await supabase
      .from(TABLE_NAMES.PROJECTS)
      .select('id, name, description, status, details, timeline, budget, owner_id, plan_approved, created_at, updated_at')
      .eq('id', projectId)
      .single();
      
    
    if (fetchError || !createdProject) {
      console.error('Error fetching created project:', fetchError);
      return {
        success: false,
        error: fetchError?.message || 'Could not retrieve created project'
      };
    }
    
    // Add the current user as project owner in project members table
    const { error: memberError } = await supabase
      .from(TABLE_NAMES.PROJECT_MEMBERS)
      .insert([{
        project_id: createdProject.id,
        user_id: userId,
        role: 'OWNER' as UserRole
      }]);
      
    if (memberError) {
      console.warn('Warning: Could not add user as project member:', memberError);
      // Don't fail the entire operation for this
    }
    
    // Log the project creation in audit log
    await logProjectCreation(createdProject.id, userId);
    
    return {
      success: true,
      project: createdProject as Project
    };
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while creating the project';
    console.error('Error in createProject service:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Validates project form data before submission
 */
export function validateProjectData(formData: ProjectFormValues): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields validation
  if (!formData.name || formData.name.trim().length < 3) {
    errors.push('Project name must be at least 3 characters long');
  }
  
  if (!formData.type) {
    errors.push('Project type is required');
  }
  
  if (!formData.location) {
    errors.push('Location is required');
  }
  
  if (!formData.country) {
    errors.push('Country is required');
  }
  
  if (!formData.region) {
    errors.push('Region is required');
  }
  
  if (!formData.plotSize) {
    errors.push('Plot size is required');
  }
  
  if (!formData.buildingSize) {
    errors.push('Building size is required');
  }
  
  if (!formData.storeys) {
    errors.push('Number of storeys is required');
  }
  
  if (!formData.bedrooms) {
    errors.push('Number of bedrooms is required');
  }
  
  if (!formData.bathrooms) {
    errors.push('Number of bathrooms is required');
  }
  
  if (!formData.budget) {
    errors.push('Budget is required');
  }
  
  if (!formData.currency) {
    errors.push('Currency is required');
  }
  
  // Numeric validation
  if (formData.plotSize && (isNaN(parseFloat(formData.plotSize)) || parseFloat(formData.plotSize) <= 0)) {
    errors.push('Plot size must be a valid positive number');
  }
  
  if (formData.buildingSize && (isNaN(parseFloat(formData.buildingSize)) || parseFloat(formData.buildingSize) <= 0)) {
    errors.push('Building size must be a valid positive number');
  }
  
  if (formData.budget && (isNaN(parseFloat(formData.budget.replace(/,/g, ''))) || parseFloat(formData.budget.replace(/,/g, '')) <= 0)) {
    errors.push('Budget must be a valid positive number');
  }
  
  // Logical validation
  // Validate building size vs. plot size ratio
  validateBuildingPlotSizeRatio(formData, errors);
  
  // Validate storeys vs. building size ratio
  validateStoreysBuildingSizeRatio(formData, errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Logs project creation in the audit log
 */
async function logProjectCreation(projectId: string, userId: string): Promise<void> {
  try {
    await supabase
      .from(TABLE_NAMES.AUDIT_LOG)
      .insert([{
        user_id: userId,
        action: 'CREATE_PROJECT',
        entity_type: 'project',
        entity_id: projectId,
        details: {
          description: 'New project created through wizard',
          timestamp: new Date().toISOString()
        }
      }]);
  } catch (error) {
    // Don't fail the entire operation if audit logging fails
    console.warn('Could not log project creation:', error);
  }
}