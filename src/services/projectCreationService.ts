/**
 * Project Creation Service
 * Handles the database operations for creating new projects
 */
import { supabase } from '@/lib/supabase';
import { CreateProjectFormValues } from '@/pages/CreateProject';
import { validateBuildingPlotSizeRatio, validateStoreysBuildingSizeRatio } from '@/utils/projectFormUtils';
import { Currency, Project, ProjectInsert, TABLE_NAMES, UserRole } from '@/types/database';
import { AIPlanService } from './aiPlanService';

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
    // Prepare the project data to match the database schema
    const projectData: ProjectInsert = {
      name: formData.name,
      description: formData.description || null,
      status: 'PLANNING', // Match the enum from schema
      owner_id: userId,
      profile_image: formData.profileImage || null,
      inspiration_images: formData.images || [],
      
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
      .select('id, name, description, status, details, timeline, budget, owner_id, profile_image, inspiration_images, created_at, updated_at')
      .eq('id', projectId)
      .single();
      
    console.log('✅ Project retrieved from database:', {
      id: createdProject?.id,
      name: createdProject?.name,
      profile_image: createdProject?.profile_image,
      inspiration_images: createdProject?.inspiration_images,
      imagesCount: createdProject?.inspiration_images?.length || 0
    });
      
    
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
    
    // Log the project creation in audit log (non-blocking)
    logProjectCreation(createdProject.id, userId).catch(error => {
      console.warn('Audit log failed (non-critical):', error);
    });
    
    // Trigger AI plan generation (non-blocking)
    initiateAIPlanGeneration(createdProject as Project, formData).catch(error => {
      console.warn('AI plan generation failed to start (non-critical):', error);
    });
    
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
    console.log('📝 Attempting to log project creation to audit log...');
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
      console.error('❌ Audit log insertion failed:', error);
      if (error.message?.includes('policy')) {
        console.error('🔒 This appears to be a Row Level Security (RLS) policy issue');
        console.error('💡 To fix: Run the audit log permissions SQL script in Supabase');
      }
    } else {
      console.log('✅ Project creation logged to audit log successfully');
    }
  } catch (error) {
    // Don't fail the entire operation if audit logging fails
    console.warn('⚠️ Could not log project creation (non-critical):', error);
  }
}

/**
 * Initiates AI plan generation for a newly created project
 */
async function initiateAIPlanGeneration(project: Project, _formData: CreateProjectFormValues): Promise<void> {
  try {
    console.log('🤖 Initiating AI plan generation for project:', project.id);
    
    // Update project status to 'requested'
    await AIPlanService.updateProjectPlanStatus(project.id, 'requested');
    
    // Create notification for plan generation start
    try {
      console.log('🔔 AI plan generation started for project:', project.name);
      // TODO: Implement createAIPlanNotification method in NotificationService
    } catch (notificationError) {
      console.warn('Failed to create start notification (non-critical):', notificationError);
    }
    
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
    
    console.log('✅ AI plan generation started successfully. Job ID:', jobId);
    
    // Set up completion handling (in production, this would be handled by webhooks)
    const abortController = setupAIPlanCompletionHandler(project.owner_id, project.id, project.name, jobId);
    
    // Store abort controller for potential cleanup (could be stored in a Map for multiple projects)
    // In a real application, you might want to store this in a service or context
    console.log('🎯 AI plan completion handler set up with cleanup controller for job:', jobId);
    
  } catch (error) {
    console.error('❌ Failed to initiate AI plan generation:', error);
    
    // Update project status to 'failed' 
    await AIPlanService.updateProjectPlanStatus(project.id, 'failed');
    
    // Create failure notification
    try {
      console.log('🔔 AI plan generation failed for project:', project.name);
      // TODO: Implement createAIPlanNotification method in NotificationService
    } catch (notificationError) {
      console.warn('Failed to create failure notification (non-critical):', notificationError);
    }
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
        // Create completion notification
        console.log('🔔 AI plan generation completed for project:', projectName);
        // TODO: Implement createAIPlanNotification method in NotificationService
        
        console.log('✅ AI plan completion notification created');
        
        // Abort controller will automatically clean up the listener
        abortController.abort();
        
      } catch (error) {
        console.warn('Failed to create completion notification:', error);
        // Still abort to prevent memory leaks
        abortController.abort();
      }
    }
  };
  
  // Add event listener with AbortController signal for automatic cleanup
  window.addEventListener('ai-plan-completed', handleCompletion, { signal });
  
  // Set up timeout cleanup (10 minutes)
  const timeoutId = setTimeout(() => {
    console.warn(`AI plan generation timeout for job ${jobId}, cleaning up event listener`);
    abortController.abort();
  }, 10 * 60 * 1000);
  
  // Clean up timeout when aborted
  signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
    console.log(`AI plan completion handler cleaned up for job ${jobId}`);
  });
  
  return abortController;
}