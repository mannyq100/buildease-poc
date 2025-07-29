/**
 * Workflow Sections Component
 * Displays Progress & Execution, Team & Resources, and Settings sections
 */

import React from 'react';
import { Users, Settings, Clock } from 'lucide-react';
import type { Project } from '@/types/project';

interface WorkflowSectionsProps {
  project: Project;
  projectId: string;
}

export function WorkflowSections({ project: _project, projectId: _projectId }: WorkflowSectionsProps) {
  
  return (
    <div className="space-y-8">
      {/* Progress and Execution */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Progress & Execution</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mt-1"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600">Progress tracking coming soon...</p>
        </div>
      </section>

      {/* Team and Resources */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Team & Resources</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full mt-1"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600">Team management coming soon...</p>
        </div>
      </section>

      {/* Settings and Configuration */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Settings & Configuration</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-slate-500 to-blue-500 rounded-full mt-1"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600">Project settings coming soon...</p>
        </div>
      </section>
    </div>
  );
}