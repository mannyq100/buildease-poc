/**
 * Mock Project Service
 * Provides mock implementations of project-related services
 */
import { Project, ProjectStatus } from '@/types/project';
import { PlanPhase, PlanTask } from '@/types/projectInputs';
import projectsData from '../json/projects.json';

/**
 * Get all projects
 * @returns Promise that resolves to an array of projects
 */
export function getProjects(): Promise<Project[]> {
  // Convert the raw JSON data to the correct Project type with proper status enum
  const typedProjects: Project[] = projectsData.list.map(p => ({
    ...p,
    status: p.status as ProjectStatus
  }));
  return Promise.resolve(typedProjects);
}

/**
 * Get a project by ID
 * @param id Project ID
 * @returns Promise that resolves to a project or null if not found
 */
export function getProjectById(id: string): Promise<Project | null> {
  const project = projectsData.list.find(p => p.id === id);
  if (!project) return Promise.resolve(null);
  
  // Convert to Project type with proper status enum
  const typedProject: Project = {
    ...project,
    status: project.status as ProjectStatus
  };
  return Promise.resolve(typedProject);
}

/**
 * Get project sample plan
 * This is used for the project plan generation feature
 * @returns Promise that resolves to a sample project plan
 */
export function getProjectSamplePlan(): Promise<PlanPhase[]> {
  // Sample project plan phases and tasks
  const samplePlan: PlanPhase[] = [
    {
      id: 'phase-1',
      name: 'Planning and Design',
      description: 'Initial planning, conceptual design, and regulatory approvals',
      startDate: '2025-05-01',
      endDate: '2025-06-30',
      tasks: [
        {
          id: 'task-1-1',
          name: 'Site Analysis',
          description: 'Evaluate site conditions and constraints',
          assignedTo: '',
          startDate: '2025-05-01',
          endDate: '2025-05-10',
          status: 'not-started',
          priority: 'medium'
        },
        {
          id: 'task-1-2',
          name: 'Conceptual Design',
          description: 'Develop initial design concepts and sketches',
          assignedTo: '',
          startDate: '2025-05-11',
          endDate: '2025-05-25',
          status: 'not-started',
          priority: 'high'
        },
        {
          id: 'task-1-3',
          name: 'Regulatory Approvals',
          description: 'Obtain necessary permits and approvals',
          assignedTo: '',
          startDate: '2025-05-26',
          endDate: '2025-06-30',
          status: 'not-started',
          priority: 'high'
        }
      ]
    },
    {
      id: 'phase-2',
      name: 'Site Preparation',
      description: 'Clear site, establish utilities, and prepare foundation',
      startDate: '2025-07-01',
      endDate: '2025-08-15',
      tasks: [
        {
          id: 'task-2-1',
          name: 'Site Clearing',
          description: 'Clear vegetation and debris from construction site',
          assignedTo: '',
          startDate: '2025-07-01',
          endDate: '2025-07-10',
          status: 'not-started',
          priority: 'medium'
        },
        {
          id: 'task-2-2',
          name: 'Utility Connections',
          description: 'Establish water, power, and sewer connections',
          assignedTo: '',
          startDate: '2025-07-11',
          endDate: '2025-07-25',
          status: 'not-started',
          priority: 'high'
        },
        {
          id: 'task-2-3',
          name: 'Foundation Preparation',
          description: 'Excavate and prepare building foundation',
          assignedTo: '',
          startDate: '2025-07-26',
          endDate: '2025-08-15',
          status: 'not-started',
          priority: 'critical'
        }
      ]
    },
    {
      id: 'phase-3',
      name: 'Construction',
      description: 'Main construction phase including structure, systems, and finishes',
      startDate: '2025-08-16',
      endDate: '2026-02-28',
      tasks: [
        {
          id: 'task-3-1',
          name: 'Structural Framework',
          description: 'Erect main structural components',
          assignedTo: '',
          startDate: '2025-08-16',
          endDate: '2025-10-15',
          status: 'not-started',
          priority: 'critical'
        },
        {
          id: 'task-3-2',
          name: 'Electrical Systems',
          description: 'Install electrical wiring and systems',
          assignedTo: '',
          startDate: '2025-10-16',
          endDate: '2025-11-30',
          status: 'not-started',
          priority: 'high'
        },
        {
          id: 'task-3-3',
          name: 'Plumbing',
          description: 'Install water and waste systems',
          assignedTo: '',
          startDate: '2025-10-16',
          endDate: '2025-11-30',
          status: 'not-started',
          priority: 'high'
        },
        {
          id: 'task-3-4',
          name: 'Interior Finishes',
          description: 'Complete drywall, painting, flooring, and fixtures',
          assignedTo: '',
          startDate: '2025-12-01',
          endDate: '2026-02-28',
          status: 'not-started',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'phase-4',
      name: 'Testing and Completion',
      description: 'Final testing, inspections, and project handover',
      startDate: '2026-03-01',
      endDate: '2026-04-15',
      tasks: [
        {
          id: 'task-4-1',
          name: 'Systems Testing',
          description: 'Test all electrical, plumbing, and HVAC systems',
          assignedTo: '',
          startDate: '2026-03-01',
          endDate: '2026-03-15',
          status: 'not-started',
          priority: 'high'
        },
        {
          id: 'task-4-2',
          name: 'Final Inspections',
          description: 'Complete all regulatory inspections',
          assignedTo: '',
          startDate: '2026-03-16',
          endDate: '2026-03-31',
          status: 'not-started',
          priority: 'critical'
        },
        {
          id: 'task-4-3',
          name: 'Project Handover',
          description: 'Final documentation and client handover',
          assignedTo: '',
          startDate: '2026-04-01',
          endDate: '2026-04-15',
          status: 'not-started',
          priority: 'medium'
        }
      ]
    }
  ];
  
  return Promise.resolve(samplePlan);
}

/**
 * Get project statuses for filtering
 * @returns Promise that resolves to an array of status options
 */
export function getProjectStatuses(): Promise<string[]> {
  return Promise.resolve(projectsData.statuses);
}

/**
 * Get project types for filtering
 * @returns Promise that resolves to an array of project types
 */
export function getProjectTypes(): Promise<string[]> {
  return Promise.resolve(projectsData.types);
}

/**
 * Create a new project
 * @param project Project data to create
 * @returns Promise that resolves to the created project
 */
export function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  // In a real implementation, this would make an API call
  // For mock, we just return a new project with a generated ID
  const newId = String(Math.max(...projectsData.list.map(p => Number(p.id))) + 1);
  
  const newProject = {
    ...project,
    id: newId
  };
  
  return Promise.resolve(newProject as Project);
}

/**
 * Update an existing project
 * @param id Project ID
 * @param updates Partial project data to update
 * @returns Promise that resolves to the updated project or null if not found
 */
export function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const projectIndex = projectsData.list.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    return Promise.resolve(null);
  }
  
  // In a real implementation, this would make an API call
  // For mock, we just return the updated project
  const updatedProject = {
    ...projectsData.list[projectIndex],
    ...updates,
    id: projectsData.list[projectIndex].id // Ensure ID doesn't change
  };
  
  return Promise.resolve(updatedProject as Project);
}

/**
 * Delete a project
 * @param id Project ID
 * @returns Promise that resolves to a boolean indicating success
 */
export function deleteProject(id: string): Promise<boolean> {
  const projectExists = projectsData.list.some(p => p.id === id);
  return Promise.resolve(projectExists);
}
