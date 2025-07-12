/**
 * Mock Project Service
 * Provides mock implementations of project-related services
 */
import rawProjectsData from '../json/projects.json';
import { Project, ProjectStatus, Phase, PriorityLevel, Task } from '@/types';
import { TaskStatus } from '@/types/common';
import { PlanPhase, PlanTask } from '@/types/projectInputs';
import { delay } from '../utils';

// Define types for the raw data from JSON to avoid using 'any'
interface RawTask {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  status?: string;
  priority?: string;
  progress?: number;
  phaseId: string;
}

interface RawPhase {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  completion?: number;
  budget?: string | number;
  tasks?: RawTask[];
}

interface RawProject {
  id: string;
  name: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  progress?: number;
  phases?: RawPhase[];
  teamMembers?: string[];
  tags?: string[];
  imageUrl?: string;
  type?: string;
  location?: string;
  client?: string;
}

// Type definition for projects.json structure
interface RawProjectData {
  list: RawProject[];
  statuses: string[];
  types: string[];
}

// Helper functions for status and priority mapping
function mapToTaskStatus(status: string): TaskStatus {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'completed';
    case 'in-progress':
      return 'in-progress';
    case 'delayed':
      return 'delayed';
    case 'not-started':
    case 'pending':
    default:
      return 'not-started';
  }
}

function mapStatus(status: string): ProjectStatus {
  switch (status.toLowerCase()) {
    case 'active':
      return 'active';
    case 'completed':
      return 'completed';
    case 'planning':
      return 'planning';
    case 'on-hold':
      return 'on-hold';
    default:
      return 'active';
  }
}

function mapTaskStatusToPlanStatus(status: string): 'not-started' | 'in-progress' | 'completed' | 'on-hold' {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'in-progress':
      return 'in-progress';
    case 'delayed':
      return 'on-hold';
    case 'not-started':
    default:
      return 'not-started';
  }
}

function mapPlanStatusToTaskStatus(status: 'not-started' | 'in-progress' | 'completed' | 'on-hold'): TaskStatus {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'in-progress':
      return 'in-progress';
    case 'on-hold':
      return 'delayed';
    case 'not-started':
    default:
      return 'not-started';
  }
}

function mapPriorityToPlanPriority(priority: PriorityLevel): 'low' | 'medium' | 'high' | 'critical' {
  switch (priority) {
    case 'High':
      return 'high';
    case 'Medium':
      return 'medium';
    case 'Low':
      return 'low';
    default:
      return 'medium';
  }
}

function mapPlanPriorityToPriority(priority: 'low' | 'medium' | 'high' | 'critical'): PriorityLevel {
  switch (priority) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    case 'critical':
      return 'High';
    default:
      return 'Medium';
  }
}

// Parse the raw project data from JSON
const projectData = rawProjectsData as RawProjectData;
const projects: Project[] = (projectData.list || []).map((rawProject: RawProject): Project => ({
  id: rawProject.id,
  name: rawProject.name,
  description: rawProject.description || '',
  status: mapStatus(rawProject.status || 'active'),
  dueDate: rawProject.endDate ? new Date(rawProject.endDate) : new Date(),
  phases: (rawProject.phases || []).map((phase: RawPhase): Phase => ({
    id: phase.id,
    name: phase.name,
    description: phase.description || '',
    startDate: phase.startDate ? new Date(phase.startDate) : new Date(),
    endDate: phase.endDate ? new Date(phase.endDate) : new Date(),
    status: mapToTaskStatus(phase.status || 'pending'),
    completion: phase.completion || 0,
    budget: typeof phase.budget === 'number' ? String(phase.budget) : (phase.budget || '0'), 
    tasks: (phase.tasks || []).map((task: RawTask): Task => ({
      id: task.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: task.name,
      description: task.description || '',
      startDate: task.startDate ? new Date(task.startDate) : new Date(),
      endDate: task.endDate ? new Date(task.endDate) : new Date(),
      assignedTo: task.assignedTo || '',
      status: mapToTaskStatus(task.status || 'not-started'),
      priority: task.priority as PriorityLevel || 'Medium',
      progress: 0,
      phaseId: phase.id
    }))
  }))
}));

export async function getProjects(): Promise<Project[]> {
  await delay(500);
  return projects;
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  await delay(200);
  return projects.find(project => project.id === projectId) || null;
}

/**
 * Get the plan for a specific project by ID
 * This converts internal Phase objects to external PlanPhase objects
 */
export async function getProjectPlan(projectId: string): Promise<PlanPhase[]> {
  await delay(500);
  // Find the project directly from the projects array
  const project = projects.find(p => p.id === projectId);
  if (!project) return [];
  
  // Convert Phase objects to PlanPhase objects
  return project.phases.map((phase: Phase): PlanPhase => {
    // Ensure dates are valid Date objects before using them
    const startDate = phase.startDate instanceof Date ? phase.startDate : new Date();
    const endDate = phase.endDate instanceof Date ? phase.endDate : new Date();
    
    // Convert tasks to PlanTask format
    const planTasks = phase.tasks.map(task => {
      // Ensure task dates are valid Date objects
      const taskStartDate = task.startDate instanceof Date ? task.startDate : new Date();
      const taskEndDate = task.endDate instanceof Date ? task.endDate : new Date();
      
      return {
        id: String(task.id),
        name: task.name,
        description: task.description || '',
        assignedTo: task.assignedTo || '',
        startDate: taskStartDate.toISOString(),
        endDate: taskEndDate.toISOString(),
        status: mapTaskStatusToPlanStatus(task.status),
        priority: mapPriorityToPlanPriority(task.priority || 'Medium')
      };
    });
    
    // Create PlanPhase with all required properties
    return {
      id: String(phase.id),
      name: phase.name,
      description: phase.description || '',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      tasks: planTasks
    };
  });
}

/**
 * Update or insert a phase for a project
 * Converts between external PlanPhase and internal Phase formats
 */
export async function upsertPhase(projectId: string, planPhase: PlanPhase): Promise<PlanPhase> {
  await delay(500); // Simulate API delay
  
  // Find the project by projectId
  const project = projects.find(p => p.id === projectId);
  
  if (!project && !projects.length) {
    throw new Error('No projects found');
  }
  
  // Use the first project if we can't find the matching one
  const targetProject = project || projects[0];
  
  // Convert PlanPhase to Phase for internal storage
  const phaseForStorage: Phase = {
    id: planPhase.id || `phase-${Date.now()}`,
    name: planPhase.name,
    description: planPhase.description || '',
    startDate: new Date(planPhase.startDate),
    endDate: new Date(planPhase.endDate),
    status: 'not-started' as TaskStatus, // Use a valid TaskStatus value
    completion: 0, // Default completion value
    budget: '0', // Default budget as string
    tasks: (planPhase.tasks || []).map((planTask: PlanTask): Task => ({
      id: planTask.id,
      name: planTask.name,
      description: planTask.description || '',
      startDate: new Date(planTask.startDate),
      endDate: new Date(planTask.endDate),
      assignedTo: planTask.assignedTo || '',
      status: mapPlanStatusToTaskStatus(planTask.status),
      priority: planTask.priority === 'critical' ? 'High' : mapPlanPriorityToPriority(planTask.priority),
      progress: 0,
      phaseId: planPhase.id
    }))
  };
  
  const existingPhaseIndex = targetProject.phases.findIndex(p => p.id === planPhase.id);
  
  if (existingPhaseIndex >= 0 && project) {
    // Update existing phase with proper typecasting for interface compatibility
    project.phases[existingPhaseIndex] = phaseForStorage;
  } else {
    // Add new phase
    targetProject.phases.push(phaseForStorage);
  }
  
  // Ensure we have valid Date objects
  const phaseStartDate = phaseForStorage.startDate instanceof Date ? phaseForStorage.startDate : new Date();
  const phaseEndDate = phaseForStorage.endDate instanceof Date ? phaseForStorage.endDate : new Date();
  
  // Create tasks for the response with proper types
  const responseTasks = phaseForStorage.tasks.map(task => {
    // Ensure task dates are valid Date objects
    const taskStartDate = task.startDate instanceof Date ? task.startDate : new Date();
    const taskEndDate = task.endDate instanceof Date ? task.endDate : new Date();
    
    return {
      id: task.id,
      name: task.name,
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      startDate: taskStartDate.toISOString(),
      endDate: taskEndDate.toISOString(),
      status: mapTaskStatusToPlanStatus(task.status),
      priority: mapPriorityToPlanPriority(task.priority || 'Medium')
    };
  });

  // Return a properly formed PlanPhase object - only include fields expected in PlanPhase interface
  return {
    id: phaseForStorage.id,
    name: phaseForStorage.name,
    description: phaseForStorage.description || '',
    startDate: phaseStartDate.toISOString(),
    endDate: phaseEndDate.toISOString(),
    tasks: responseTasks
  };
}

/**
 * Get project sample plan for new projects
 * @returns Promise that resolves to an array of PlanPhases representing a sample plan
 */
export async function getProjectSamplePlan(): Promise<PlanPhase[]> {
  await delay(300);
  
  // Create a simple sample plan with common construction phases
  const today = new Date();
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);
  
  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(today.getDate() + 14);
  
  const threeWeeksLater = new Date(today);
  threeWeeksLater.setDate(today.getDate() + 21);
  
  const fourWeeksLater = new Date(today);
  fourWeeksLater.setDate(today.getDate() + 28);
  
  // Define common phases for a construction project
  return [
    {
      id: 'sample-phase-1',
      name: 'Planning and Design',
      description: 'Initial planning, permits, and architectural design',
      startDate: today.toISOString(),
      endDate: oneWeekLater.toISOString(),
      tasks: [
        {
          id: 'sample-task-1',
          name: 'Architectural Plans',
          description: 'Create initial architectural plans',
          assignedTo: 'Architect',
          startDate: today.toISOString(),
          endDate: oneWeekLater.toISOString(),
          status: 'not-started',
          priority: 'high'
        },
        {
          id: 'sample-task-2',
          name: 'Obtain Permits',
          description: 'Submit plans for permits and approvals',
          assignedTo: 'Project Manager',
          startDate: today.toISOString(),
          endDate: oneWeekLater.toISOString(),
          status: 'not-started',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'sample-phase-2',
      name: 'Foundation',
      description: 'Site preparation and foundation work',
      startDate: oneWeekLater.toISOString(),
      endDate: twoWeeksLater.toISOString(),
      tasks: [
        {
          id: 'sample-task-3',
          name: 'Site Excavation',
          description: 'Prepare the site and excavate for foundation',
          assignedTo: 'Construction Team',
          startDate: oneWeekLater.toISOString(),
          endDate: twoWeeksLater.toISOString(),
          status: 'not-started',
          priority: 'high'
        },
        {
          id: 'sample-task-4',
          name: 'Pour Foundation',
          description: 'Pour concrete foundation',
          assignedTo: 'Foundation Contractor',
          startDate: oneWeekLater.toISOString(),
          endDate: twoWeeksLater.toISOString(),
          status: 'not-started',
          priority: 'critical'
        }
      ]
    },
    {
      id: 'sample-phase-3',
      name: 'Framing',
      description: 'Building structural framing',
      startDate: twoWeeksLater.toISOString(),
      endDate: threeWeeksLater.toISOString(),
      tasks: [
        {
          id: 'sample-task-5',
          name: 'Structural Framing',
          description: 'Construct main structural elements',
          assignedTo: 'Framing Crew',
          startDate: twoWeeksLater.toISOString(),
          endDate: threeWeeksLater.toISOString(),
          status: 'not-started',
          priority: 'high'
        }
      ]
    },
    {
      id: 'sample-phase-4',
      name: 'Finishing',
      description: 'Interior and exterior finishes',
      startDate: threeWeeksLater.toISOString(),
      endDate: fourWeeksLater.toISOString(),
      tasks: [
        {
          id: 'sample-task-6',
          name: 'Interior Work',
          description: 'Drywall, painting, and trim',
          assignedTo: 'Interior Team',
          startDate: threeWeeksLater.toISOString(),
          endDate: fourWeeksLater.toISOString(),
          status: 'not-started',
          priority: 'medium'
        }
      ]
    }
  ];
}

/**
 * Get available project statuses
 * @returns Promise that resolves to an array of status options
 */
export async function getProjectStatuses(): Promise<string[]> {
  await delay(100);
  return projectData.statuses || ['planning', 'active', 'on-hold', 'completed'];
}

/**
 * Get available project types
 * @returns Promise that resolves to an array of project types
 */
export async function getProjectTypes(): Promise<string[]> {
  await delay(100);
  return projectData.types || ['residential', 'commercial', 'renovation', 'new-build'];
}

/**
 * Create a new project
 * @param project Project data to create (without ID)
 * @returns Promise that resolves to the created project with an ID
 */
export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  await delay(800);
  
  // Generate a new unique ID
  const newId = `project-${Date.now()}`;
  
  // Create a new project with the provided data and generated ID
  const newProject: Project = {
    id: newId,
    ...project,
    phases: project.phases || [],
  };
  
  // Add to our projects array
  projects.push(newProject);
  
  return newProject;
}

/**
 * Update an existing project
 * @param id Project ID
 * @param updates Partial project data to update
 * @returns Promise that resolves to the updated project or null if not found
 */
export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  await delay(500);
  
  // Find the project to update
  const projectIndex = projects.findIndex(p => p.id === id);
  
  // If project not found, return null
  if (projectIndex === -1) {
    return null;
  }
  
  // Update the project with the provided data
  const updatedProject = {
    ...projects[projectIndex],
    ...updates,
    // Ensure ID doesn't change
    id: projects[projectIndex].id
  };
  
  // Replace the project in our array
  projects[projectIndex] = updatedProject;
  
  return updatedProject;
}

/**
 * Delete a project
 * @param id Project ID
 * @returns Promise that resolves to a boolean indicating success
 */
export async function deleteProject(id: string): Promise<boolean> {
  await delay(500);
  
  // Find the project index
  const projectIndex = projects.findIndex(p => p.id === id);
  
  // If project not found, return false
  if (projectIndex === -1) {
    return false;
  }
  
  // Remove the project from our array
  projects.splice(projectIndex, 1);
  
  return true;
}

/**
 * Get project phases
 * @param projectId Project ID
 * @returns Promise that resolves to an array of phases
 */
export async function getProjectPhases(projectId: string): Promise<Phase[]> {
  await delay(300);
  
  // Find the project
  const project = await getProjectById(projectId);
  
  // If project not found, return empty array
  if (!project) {
    return [];
  }
  
  return project.phases;
}
