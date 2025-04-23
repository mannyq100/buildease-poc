/**
 * Project Service
 * Provides methods for working with project data
 */
import { Project } from '@/types/project'
import { Phase } from '@/types/projectInputs'
import { projectsData } from '@/data/mock/project/projectsData'
import { SAMPLE_PROJECT_PLAN } from '@/data/mock/project/sampleProjectPlan'

/**
 * Get all projects
 * @returns Promise that resolves to an array of projects
 */
export async function getProjects(): Promise<Project[]> {
  // In a real app, this would be an API call
  return Promise.resolve(projectsData)
}

/**
 * Get a project by ID
 * @param id Project ID
 * @returns Promise that resolves to a project or null if not found
 */
export async function getProjectById(id: string): Promise<Project | null> {
  // In a real app, this would be an API call
  const project = projectsData.find(p => p.id === id)
  return Promise.resolve(project || null)
}

/**
 * Get project sample plan
 * For use in the generated plan feature
 * @returns Promise that resolves to an array of phases
 */
export async function getProjectSamplePlan(): Promise<Phase[]> {
  // In a real app, this would be an API call
  return Promise.resolve(SAMPLE_PROJECT_PLAN)
}

/**
 * Create a new project
 * @param project Project data
 * @returns Promise that resolves to the created project
 */
export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  // In a real app, this would be an API call
  const newProject: Project = {
    ...project,
    id: `${projectsData.length + 1}`,
  }
  
  // This is just for mock purposes
  // In a real app, this would be persisted to a database
  return Promise.resolve(newProject)
}

/**
 * Update a project
 * @param id Project ID
 * @param updates Partial project data to update
 * @returns Promise that resolves to the updated project
 */
export async function updateProject(
  id: string, 
  updates: Partial<Project>
): Promise<Project | null> {
  // In a real app, this would be an API call
  const projectIndex = projectsData.findIndex(p => p.id === id)
  
  if (projectIndex === -1) {
    return Promise.resolve(null)
  }
  
  const updatedProject: Project = {
    ...projectsData[projectIndex],
    ...updates,
  }
  
  // This is just for mock purposes
  // In a real app, this would be persisted to a database
  return Promise.resolve(updatedProject)
}

/**
 * Delete a project
 * @param id Project ID
 * @returns Promise that resolves to a boolean indicating success
 */
export async function deleteProject(id: string): Promise<boolean> {
  // In a real app, this would be an API call
  const projectIndex = projectsData.findIndex(p => p.id === id)
  
  if (projectIndex === -1) {
    return Promise.resolve(false)
  }
  
  // This is just for mock purposes
  // In a real app, this would be persisted to a database
  return Promise.resolve(true)
}
