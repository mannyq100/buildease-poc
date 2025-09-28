/**
 * Project Creation Service
 * Handles the database operations for creating new projects
 */
import { supabase } from '@/lib/supabase';
import { CreateProjectFormValues } from '@/pages/CreateProject/schema';
import { validateBuildingPlotSizeRatio, validateStoreysBuildingSizeRatio } from '@/utils/projectFormUtils';
import { Currency, Project, ProjectInsert, TABLE_NAMES, UserRole } from '@/types/database';
import { AIPlanService } from './aiPlanService';
import { generateUniqueProjectSlug } from '@/utils/project/slug';

export interface CreateProjectResult {
  success: boolean;
  project?: Project;
  error?: string;
}

/**
 * Creates a new project in the database with all form data
 */
export async function createProject(formData: CreateProjectFormValues, userId: string): Promise<CreateProjectResult> {
  try {
    // Generate URL-friendly unique slug for the project
    const slug = await generateUniqueProjectSlug(formData.name);

    // Prepare the project data to match the database schema
    const projectData: ProjectInsert = {
      name: formData.name,
      description: formData.description || null,
      status: 'PLANNING', // Match the enum from schema
      owner_id: userId,
      slug,
      // Media files (profile_image, inspiration_images) now handled by be_document table
      
      // Structure details in JSONB format according to schema
      details: {
        // Location information - new structured format
        location: {
          street_address: formData.location || undefined,
          city: formData.city || undefined,
          region_or_state: formData.region || undefined,
          country: formData.country || undefined,
          gps_coordinates: undefined, // Can be added later via geocoding
          // Additional location metadata
          terrain: formData.terrain || undefined,
          nearby_landmarks: formData.nearbyLandmarks || undefined
        },
        
        // Specifications - Safe numeric parsing with NaN checks
        specs: {
          plot_size: (() => {
            if (!formData.plotSize || !formData.plotSize.trim()) return null;
            const value = parseFloat(formData.plotSize.trim());
            return !isNaN(value) && value > 0 ? { value, unit: formData.plotSizeUnit } : null;
          })(),
          building_size: (() => {
            if (!formData.buildingSize || !formData.buildingSize.trim()) return null;
            const value = parseFloat(formData.buildingSize.trim());
            return !isNaN(value) && value > 0 ? { value, unit: formData.buildingSizeUnit } : null;
          })(),
          floors: (() => {
            if (!formData.storeys || !formData.storeys.trim()) return null;
            const value = parseInt(formData.storeys.trim());
            return !isNaN(value) && value > 0 ? value : null;
          })(),
          rooms: {
            bedrooms: (() => {
              if (!formData.bedrooms || !formData.bedrooms.trim()) return null;
              const value = parseInt(formData.bedrooms.trim());
              return !isNaN(value) && value > 0 ? value : null;
            })(),
            bathrooms: (() => {
              if (!formData.bathrooms || !formData.bathrooms.trim()) return null;
              const value = parseInt(formData.bathrooms.trim());
              return !isNaN(value) && value > 0 ? value : null;
            })(),
            kitchens: (() => {
              if (!formData.kitchens || !formData.kitchens.trim()) return 1;
              const value = parseInt(formData.kitchens.trim());
              return !isNaN(value) && value > 0 ? value : 1;
            })(),
            living_areas: (() => {
              if (!formData.livingAreas || !formData.livingAreas.trim()) return 1;
              const value = parseInt(formData.livingAreas.trim());
              return !isNaN(value) && value > 0 ? value : 1;
            })()
          }
        },
        
        // Project type and style
        project_type: formData.projectType,
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
        
      },
      
      // Timeline information
      timeline: (() => {
        const timeframeMonths = (() => {
          if (!formData.timeframe || !formData.timeframe.trim()) return null;
          const value = parseInt(formData.timeframe.trim());
          return !isNaN(value) && value > 0 ? value : null;
        })();
        
        // Calculate planned end date if we have both start date and timeframe
        let plannedEnd = null;
        if (formData.expectedStartDate && timeframeMonths) {
          const startDate = new Date(formData.expectedStartDate);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + timeframeMonths);
          plannedEnd = endDate.toISOString();
        }
        
        return {
          planned_start: formData.expectedStartDate || null,
          planned_end: plannedEnd,
          actual_start: null,
          actual_end: null,
          timeframe_months: timeframeMonths
        };
      })(),
      
      // Budget information
      budget: {
        allocated: (() => {
          if (!formData.budget || !formData.budget.trim()) return 0;
          const value = parseFloat(formData.budget.replace(/,/g, '').trim());
          return !isNaN(value) && value >= 0 ? value : 0;
        })(),
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
      return {
        success: false,
        error: `Database error: ${insertError.message}`
      };
    }
    
    // Fetch the project by the known ID
    const { data: createdProject, error: fetchError } = await supabase
      .from(TABLE_NAMES.PROJECTS)
      .select('id, name, description, status, details, timeline, budget, owner_id, slug, created_at, updated_at')
      .eq('id', projectId)
      .single();
      
    // Project successfully retrieved from database
      
    
    if (fetchError || !createdProject) {
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
      // Don't fail the entire operation for this non-critical error
    }
    
    // Log the project creation in audit log (non-blocking)
    logProjectCreation(createdProject.id, userId).catch(() => {
      // Audit log failure is non-critical, operation continues
    });
    
    // Trigger AI plan generation (non-blocking)
    initiateAIPlanGeneration(createdProject as Project, formData).catch(() => {
      // AI plan generation failure is non-critical, operation continues
    });
    
    return {
      success: true,
      project: createdProject as Project
    };
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while creating the project';
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Validates project form data before submission
 */
export function validateProjectData(formData: CreateProjectFormValues): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields validation
  if (!formData.name || formData.name.trim().length < 3) {
    errors.push('Project name must be at least 3 characters long');
  }
  
  if (!formData.projectType) {
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
    const { error } = await supabase
      .from(TABLE_NAMES.AUDIT_LOG)
      .insert([{
        user_id: userId,
        action: 'CREATE_PROJECT',
        entity_type: 'project',
        entity_id: projectId,
        details: {
          description: 'New project created through wizard',
          timestamp: new Date().toISOString(),
          projectId,
          userId
        }
      }]);
      
    if (error) {
      // Audit log insertion failed - this is non-critical
      throw new Error(`Audit log failed: ${error.message}`);
    }
  } catch (error) {
    // Don't fail the entire operation if audit logging fails
    throw error;
  }
}

/**
 * Initiates AI plan generation for a newly created project
 */
async function initiateAIPlanGeneration(project: Project, _formData: CreateProjectFormValues): Promise<void> {
  try {
    // Update project status to 'requested'
    await AIPlanService.updateProjectPlanStatus(project.id, 'requested');
    
    // Plan generation notifications handled by background service
    
    // Prepare AI plan generation request
    const aiRequest = {
      projectId: project.id,
      projectDetails: {
        name: project.name,
        description: project.description || undefined,
        type: project.details?.project_type || '',
        location: project.details?.location?.street_address || project.details?.location?.city || '',
        budget: project.budget?.allocated || 0,
        specs: {
          plotSize: project.details?.specs?.plot_size || null,
          buildingSize: project.details?.specs?.building_size || null,
          floors: project.details?.specs?.floors || null,
          rooms: project.details?.specs?.rooms || null
        },
        features: [
          ...(project.details?.features?.special_features || []),
          ...(project.details?.features?.sustainability_features || [])
        ],
        materials: project.details?.materials || {}
      }
    };
    
    // Request AI plan generation
    const jobId = await AIPlanService.requestPlanGeneration(aiRequest);
    
    // Update project status to 'processing'
    await AIPlanService.updateProjectPlanStatus(project.id, 'processing');
    
    // Set up completion handling (in production, this would be handled by webhooks)
    const abortController = setupAIPlanCompletionHandler(project.owner_id, project.id, project.name, jobId);
    
    // Store abort controller for potential cleanup (could be stored in a Map for multiple projects)
    // In a real application, you might want to store this in a service or context
    
  } catch (error) {
    // Update project status to 'failed' 
    await AIPlanService.updateProjectPlanStatus(project.id, 'failed');
    
    // Failure notifications handled by background service
    
    throw error;
  }
}

/**
 * Set up completion handler for AI plan generation
 * In production, this would be replaced by webhook handlers
 * Uses AbortController for proper cleanup and memory leak prevention
 */
function setupAIPlanCompletionHandler(
  _userId: string, 
  _projectId: string, 
  projectName: string, 
  jobId: string
): AbortController {
  // Create AbortController for proper cleanup
  const abortController = new AbortController();
  const { signal } = abortController;
  
  // Listen for the custom completion event from AIPlanService
  const handleCompletion = async (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.jobId === jobId) {
      try {
        // Completion notifications handled by background service
        
        // Abort controller will automatically clean up the listener
        abortController.abort();
        
      } catch (error) {
        // Still abort to prevent memory leaks
        abortController.abort();
      }
    }
  };
  
  // Add event listener with AbortController signal for automatic cleanup
  window.addEventListener('ai-plan-completed', handleCompletion, { signal });
  
  // Set up timeout cleanup (10 minutes)
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 10 * 60 * 1000);
  
  // Clean up timeout when aborted
  signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });
  
  return abortController;
}