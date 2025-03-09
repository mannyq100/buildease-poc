import { v4 as uuidv4 } from 'uuid';
import { Phase, Task, Material } from '@/types/projectInputs';

/**
 * Creates a default phase with a given number
 */
export function createDefaultPhase(phaseNumber: number): Phase {
  return {
    id: uuidv4(),
    title: `Phase ${phaseNumber}`,
    description: 'Description of this phase',
    tasks: [],
    materials: []
  };
}

/**
 * Parses plan content in markdown format into structured Phase objects
 */
export function parsePlanContentToPhases(content: string): Phase[] {
  const phases: Phase[] = [];
  
  // Split by phase headers (## Phase X)
  const phaseRegex = /## Phase (\d+): ([^\n]+)(?:\(([^)]+)\))?\n([\s\S]*?)(?=## Phase \d+:|$)/g;
  
  let match;
  while ((match = phaseRegex.exec(content)) !== null) {
    const phaseNumber = match[1];
    const phaseTitle = match[2].trim();
    const phaseDuration = match[3]?.trim() || '';
    const phaseContent = match[4].trim();
    
    // Extract tasks
    const tasks: Task[] = [];
    const taskRegex = /- ([^\n:]+)(?:: ([^\n]+))?/g;
    let taskMatch;
    while ((taskMatch = taskRegex.exec(phaseContent)) !== null) {
      tasks.push({
        id: uuidv4(),
        title: taskMatch[1].trim(),
        description: taskMatch[2]?.trim() || '',
        status: 'pending'
      });
    }
    
    // Extract materials
    const materials: Material[] = [];
    const materialRegex = /- (\d+) ([^\n]+)/g;
    let materialMatch;
    while ((materialMatch = materialRegex.exec(phaseContent)) !== null) {
      materials.push({
        id: uuidv4(),
        quantity: materialMatch[1].trim(),
        name: materialMatch[2].trim(),
        unit: 'pcs'
      });
    }
    
    // Extract dates from duration if possible
    let startDate, endDate;
    if (phaseDuration) {
      const dateMatch = phaseDuration.match(/Weeks (\d+)-(\d+)/);
      if (dateMatch) {
        startDate = `Week ${dateMatch[1]}`;
        endDate = `Week ${dateMatch[2]}`;
      }
    }
    
    phases.push({
      id: uuidv4(),
      title: `Phase ${phaseNumber}: ${phaseTitle}`,
      description: phaseContent,
      tasks,
      materials,
      startDate,
      endDate
    });
  }
  
  return phases;
}

/**
 * Converts structured Phase objects back to markdown content
 */
export function phasesToMarkdown(phases: Phase[]): string {
  let markdown = '';
  
  phases.forEach((phase, index) => {
    // Extract phase number and title
    const phaseMatch = phase.title.match(/Phase (\d+): (.*)/);
    const phaseNumber = phaseMatch ? phaseMatch[1] : index + 1;
    const phaseTitle = phaseMatch ? phaseMatch[2] : phase.title;
    
    // Add phase header
    markdown += `## Phase ${phaseNumber}: ${phaseTitle}`;
    
    // Add dates if available
    if (phase.startDate && phase.endDate) {
      markdown += ` (${phase.startDate} to ${phase.endDate})`;
    }
    
    markdown += '\n\n';
    
    // Add description
    if (phase.description) {
      markdown += `${phase.description}\n\n`;
    }
    
    // Add tasks
    if (phase.tasks.length > 0) {
      markdown += '### Tasks:\n\n';
      phase.tasks.forEach(task => {
        markdown += `- ${task.title}`;
        if (task.description) {
          markdown += `: ${task.description}`;
        }
        markdown += '\n';
      });
      markdown += '\n';
    }
    
    // Add materials
    if (phase.materials.length > 0) {
      markdown += '### Materials:\n\n';
      phase.materials.forEach(material => {
        markdown += `- ${material.quantity} ${material.name} (${material.unit})\n`;
      });
      markdown += '\n';
    }
    
    // Add a separator between phases
    if (index < phases.length - 1) {
      markdown += '\n---\n\n';
    }
  });
  
  return markdown;
}

/**
 * Force a complete page refresh
 */
export function forceRefresh() {
  console.log('Forcing page refresh')
  window.location.href = window.location.href + '?refresh=' + Date.now()
}