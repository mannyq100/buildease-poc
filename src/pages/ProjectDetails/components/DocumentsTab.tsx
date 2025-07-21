/**
 * Documents Tab Component for ProjectDetails
 * Extracted from TeamAndResources for better organization
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocumentManager } from '@/components/project/DocumentManager';
import { FileText, Upload, Folder, Download } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { TabHeader } from './TabHeader';

interface DocumentsTabProps {
  projectId: string;
  projectName: string;
  className?: string;
}

export function DocumentsTab({ 
  projectId, 
  projectName, 
  className 
}: DocumentsTabProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Documents Summary Header */}
      <TabHeader
        icon={<FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />}
        title="Document Management"
        description="Manage files, drawings, specifications, and project documentation"
        gradient="bg-gradient-to-br from-slate-50/80 via-white to-slate-100/60 dark:from-slate-950/30 dark:via-slate-800/50 dark:to-slate-900/20 border-slate-200/40 dark:border-slate-700/40"
      >
        <div className="flex items-center gap-6 sm:gap-8">
          <div className="text-center group">
            <div className="text-2xl sm:text-3xl font-bold text-slate-600 dark:text-slate-400 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-300">
              12
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Total Files
            </div>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center group">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300">
              4
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Blueprints
            </div>
          </div>
        </div>
      </TabHeader>

      {/* Documents Summary Cards */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200/30 dark:border-slate-800/30">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/60 dark:bg-slate-950/30 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                12
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Total Files
              </div>
            </div>
            
            <div className="text-center p-4 bg-white/60 dark:bg-slate-950/30 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                4
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Blueprints
              </div>
            </div>
            
            <div className="text-center p-4 bg-white/60 dark:bg-slate-950/30 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                8
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Photos
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
            >
              <Folder className="h-4 w-4 mr-2" />
              Blueprints
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
            >
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Management Interface */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-white">
              Project Files
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Upload, organize, and share project documentation
            </p>
          </div>
          <Button
            size="default"
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-xl font-semibold"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </CardHeader>
        <CardContent>
          <DocumentManager projectId={projectId} hideUploadButton={true} />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-slate-500 to-buildease-orange-500 rounded-full" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Foundation_Plans_v2.pdf uploaded
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                2 hours ago by Project Manager
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
              Blueprint
            </Badge>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Progress_Report_Week12.pdf shared
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                1 day ago by Site Supervisor
              </p>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700">
              Report
            </Badge>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Download className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Material_Specs.zip downloaded
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                3 days ago by Contractor Team
              </p>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700">
              Specification
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}