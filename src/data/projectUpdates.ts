import { ProjectUpdate } from '@/types/update';

/**
 * Mock data for project updates
 */
export const PROJECT_UPDATES: Record<string, ProjectUpdate[]> = {
  '1': [
    {
      id: '1',
      projectId: '1',
      title: 'Foundation work completed',
      content: 'The foundation work for the villa has been completed ahead of schedule. Concrete has cured properly and passed all inspections. Ready to move to the framing phase next week.',
      type: 'milestone',
      createdAt: '2025-03-15T14:30:00Z',
      createdBy: 'John Carpenter',
    },
    {
      id: '2',
      projectId: '1',
      title: 'Potential delay in material delivery',
      content: 'Our supplier has informed us that there might be a 2-day delay in the delivery of framing lumber due to transportation issues. We are working on alternatives to avoid any project delays.',
      type: 'issue',
      createdAt: '2025-03-18T09:15:00Z',
      createdBy: 'Sarah Mason',
    },
    {
      id: '3',
      projectId: '1',
      title: 'Weekly progress report',
      content: 'This week we completed the following:\n- Foundation work (100%)\n- Site drainage (90%)\n- Material procurement for framing (75%)\n\nOverall, the project is on track with the timeline.',
      type: 'progress',
      createdAt: '2025-03-19T16:45:00Z',
      createdBy: 'Mike Builder',
    },
  ],
  '2': [
    {
      id: '4',
      projectId: '2',
      title: 'Project kickoff meeting scheduled',
      content: 'The project kickoff meeting has been scheduled for March 25th at 10:00 AM. All stakeholders are requested to attend to discuss project scope, timeline, and responsibilities.',
      type: 'general',
      createdAt: '2025-03-17T11:20:00Z',
      createdBy: 'Emma Project',
    },
  ],
};

/**
 * Get updates for a specific project
 */
export const getProjectUpdates = (projectId: string): ProjectUpdate[] => {
  return PROJECT_UPDATES[projectId] || [];
};

/**
 * Add a new update to a project
 */
export const addProjectUpdate = (update: Omit<ProjectUpdate, 'id' | 'createdAt'>): ProjectUpdate => {
  const newUpdate: ProjectUpdate = {
    ...update,
    id: Math.random().toString(36).substring(2, 9), // Generate a random ID
    createdAt: new Date().toISOString(),
  };

  if (!PROJECT_UPDATES[update.projectId]) {
    PROJECT_UPDATES[update.projectId] = [];
  }

  PROJECT_UPDATES[update.projectId].unshift(newUpdate); // Add to beginning of array
  return newUpdate;
};
