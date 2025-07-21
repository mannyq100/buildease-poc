/**
 * Projects - Enhanced page with React 19 patterns and mobile optimization
 * Now uses the new progressive loading architecture
 */

import { ProjectsPage } from './Projects/ProjectsPage';

// Re-export the enhanced Projects page
export function Projects() {
  return <ProjectsPage />;
}

// Export as default for compatibility
export default Projects;