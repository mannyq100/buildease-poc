/**
 * Details Section with progressive loading
 * Shows project details accordion with smart data fetching
 */


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Users, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { Project } from '@/types/project';

interface DetailsSectionProps {
  project: Project;
  projectId: string;
}

export function DetailsSection({ project, projectId: _projectId }: DetailsSectionProps) {
  const handleEditProject = () => {
    toast.info('Edit project functionality coming soon');
  };
  
  const handleTeamManagement = () => {
    toast.info('Team management functionality coming soon');
  };
  
  const handleProjectSettings = () => {
    toast.info('Project settings functionality coming soon');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">Project Name</h3>
              <p className="text-slate-600">{project.name}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Status</h3>
              <p className="text-slate-600">{project.status}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Type</h3>
              <p className="text-slate-600">{project.project_type || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Location</h3>
              <p className="text-slate-600">{project.location}</p>
            </div>
          </div>
          
          {project.description && (
            <div>
              <h3 className="font-semibold text-slate-900">Description</h3>
              <p className="text-slate-600">{project.description}</p>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleEditProject} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
            <Button onClick={handleTeamManagement} variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
            <Button onClick={handleProjectSettings} variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}