import { Project, ProjectStatus, Phase, Task, Material } from '../types/project';

/**
 * Adapts Supabase project data to the frontend Project interface
 */
export function adaptSupabaseProjectToProject(supabaseProject: any): Project {
  return {
    id: supabaseProject.id,
    name: supabaseProject.name,
    description: supabaseProject.description || '',
    status: supabaseProject.status as ProjectStatus,
    client: supabaseProject.client_name || 'Unknown Client',
    type: supabaseProject.project_type || 'renovation',
    location: supabaseProject.location || 'Not specified',
    budget: supabaseProject.budget || 0,
    spent: supabaseProject.spent_amount || 0,
    timeline: {
      start: supabaseProject.start_date || new Date().toISOString(),
      end: supabaseProject.end_date || new Date().toISOString(),
      duration: supabaseProject.duration_weeks || 0
    },
    progress: supabaseProject.progress_percentage || 0,
    phases: [], // Will be populated separately
    teamMembers: [], // Will be populated separately
    materials: [], // Will be populated separately
    documents: [], // Will be populated separately
    details: supabaseProject.details || {},
    profileImage: supabaseProject.profile_image,
    inspirationImages: supabaseProject.inspiration_images || [],
    createdAt: supabaseProject.created_at,
    updatedAt: supabaseProject.updated_at,
    ownerId: supabaseProject.owner_id
  };
}

/**
 * Adapts Supabase phase data to the frontend Phase interface
 */
export function adaptSupabasePhaseToPhase(supabasePhase: any): Phase {
  return {
    id: supabasePhase.id,
    name: supabasePhase.name,
    description: supabasePhase.description || '',
    status: supabasePhase.status,
    startDate: supabasePhase.start_date,
    endDate: supabasePhase.end_date,
    duration: supabasePhase.duration_weeks || 0,
    progress: supabasePhase.progress_percentage || 0,
    tasks: [], // Will be populated separately
    materials: [], // Will be populated separately
    order: supabasePhase.order_index || 0,
    projectId: supabasePhase.project_id,
    createdAt: supabasePhase.created_at,
    updatedAt: supabasePhase.updated_at
  };
}

/**
 * Adapts Supabase task data to the frontend Task interface
 */
export function adaptSupabaseTaskToTask(supabaseTask: any): Task {
  return {
    id: supabaseTask.id,
    name: supabaseTask.name,
    description: supabaseTask.description || '',
    status: supabaseTask.status,
    priority: supabaseTask.priority || 'medium',
    assignedTo: supabaseTask.assigned_to,
    dueDate: supabaseTask.due_date,
    estimatedHours: supabaseTask.estimated_hours || 0,
    actualHours: supabaseTask.actual_hours || 0,
    progress: supabaseTask.progress_percentage || 0,
    dependencies: supabaseTask.dependencies || [],
    phaseId: supabaseTask.phase_id,
    projectId: supabaseTask.project_id,
    createdAt: supabaseTask.created_at,
    updatedAt: supabaseTask.updated_at
  };
}

/**
 * Adapts Supabase material data to the frontend Material interface
 */
export function adaptSupabaseMaterialToMaterial(supabaseMaterial: any): Material {
  return {
    id: supabaseMaterial.id,
    name: supabaseMaterial.name,
    description: supabaseMaterial.description || '',
    category: supabaseMaterial.category,
    unit: supabaseMaterial.unit,
    quantity: supabaseMaterial.quantity || 0,
    unitCost: supabaseMaterial.unit_cost || 0,
    totalCost: supabaseMaterial.total_cost || 0,
    supplier: supabaseMaterial.supplier_name,
    status: supabaseMaterial.status || 'pending',
    orderDate: supabaseMaterial.order_date,
    deliveryDate: supabaseMaterial.delivery_date,
    phaseId: supabaseMaterial.phase_id,
    projectId: supabaseMaterial.project_id,
    createdAt: supabaseMaterial.created_at,
    updatedAt: supabaseMaterial.updated_at
  };
}

/**
 * Legacy adapter for modal compatibility - converts Project to Plan format
 */
export function adaptProjectToPlan(project: Project) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    details: project.details,
    timeline: project.timeline,
    budget: project.budget,
    owner_id: project.ownerId,
    profile_image: project.profileImage,
    inspiration_images: project.inspirationImages,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
    phases: project.phases
  };
}
