import { useState } from 'react';
import { cn } from '@/utils/core/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamMembersSection } from '@/components/project/TeamMembersSection';
import { BudgetOverview } from '@/components/project/BudgetOverview';
import { DocumentManager } from '@/components/project/DocumentManager';
import { 
  Users, 
  DollarSign, 
  FileText,
  Upload,
  TrendingUp
} from 'lucide-react';
import type { TeamMember } from '@/types/project';

interface TeamAndResourcesProps {
  projectId: string;
  projectName: string;
  teamMembers: TeamMember[];
  budget?: {
    allocated?: number;
    spent?: number;
  };
  onManageTeam: () => void;
  className?: string;
}

export function TeamAndResources({ 
  projectId,
  projectName,
  teamMembers,
  budget,
  onManageTeam,
  className 
}: TeamAndResourcesProps) {
  const [activeTab, setActiveTab] = useState('team');

  // Calculate team stats
  const activeMembers = teamMembers.filter(member => member.status === 'active').length;
  const totalMembers = teamMembers.length;
  
  // Calculate budget stats  
  const budgetUtilization = budget?.allocated && budget?.spent 
    ? Math.round((budget.spent / budget.allocated) * 100)
    : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Enhanced Header with Team & Resource Summary */}
      <div className="relative overflow-hidden bg-gradient-to-br from-buildease-blue-50/80 via-white to-buildease-orange-50/60 dark:from-buildease-blue-950/30 dark:via-slate-800/50 dark:to-buildease-orange-950/20 rounded-2xl border border-buildease-blue-200/40 dark:border-buildease-blue-700/40 shadow-lg backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-buildease-blue-500/5 to-buildease-orange-500/5 dark:from-buildease-blue-400/10 dark:to-buildease-orange-400/10" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-buildease-blue-100 dark:bg-buildease-blue-900/30 rounded-xl">
                  <Users className="h-6 w-6 text-buildease-blue-600 dark:text-buildease-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Team & Resources
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    Manage collaboration, documents, and project budget
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 sm:gap-8">
              <div className="text-center group">
                <div className="text-2xl sm:text-3xl font-bold text-buildease-blue-600 dark:text-buildease-blue-400 transition-colors group-hover:text-buildease-blue-700 dark:group-hover:text-buildease-blue-300">
                  {activeMembers}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Active Members
                </div>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center group">
                <div className={cn(
                  "text-2xl sm:text-3xl font-bold transition-colors",
                  budgetUtilization > 90 ? "text-red-600 dark:text-red-400" :
                  budgetUtilization > 75 ? "text-amber-600 dark:text-amber-400" :
                  "text-emerald-600 dark:text-emerald-400"
                )}>
                  {budgetUtilization}%
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Budget Used
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabbed Content */}
      <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-buildease-blue-950/10 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/80 to-buildease-blue-50/40 dark:from-slate-800/80 dark:to-buildease-blue-950/40">
              <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0 rounded-none">
                <TabsTrigger 
                  value="team" 
                  className={cn(
                    "relative py-4 px-6 rounded-none transition-all duration-300",
                    "data-[state=active]:bg-gradient-to-b data-[state=active]:from-buildease-blue-50 data-[state=active]:to-white",
                    "dark:data-[state=active]:from-buildease-blue-950/30 dark:data-[state=active]:to-slate-800",
                    "data-[state=active]:text-buildease-blue-700 dark:data-[state=active]:text-buildease-blue-300",
                    "data-[state=active]:shadow-sm",
                    "hover:bg-slate-50/50 dark:hover:bg-slate-800/50",
                    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
                    "data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-buildease-blue-500 data-[state=active]:after:to-buildease-orange-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Team</span>
                    <Badge variant="outline" className="bg-buildease-blue-50 text-buildease-blue-700 border-buildease-blue-200 dark:bg-buildease-blue-900/20 dark:text-buildease-blue-300 dark:border-buildease-blue-700">
                      {totalMembers}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="budget" 
                  className={cn(
                    "relative py-4 px-6 rounded-none transition-all duration-300",
                    "data-[state=active]:bg-gradient-to-b data-[state=active]:from-emerald-50 data-[state=active]:to-white",
                    "dark:data-[state=active]:from-emerald-950/30 dark:data-[state=active]:to-slate-800",
                    "data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300",
                    "data-[state=active]:shadow-sm",
                    "hover:bg-slate-50/50 dark:hover:bg-slate-800/50",
                    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
                    "data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-emerald-500 data-[state=active]:after:to-buildease-orange-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">Budget</span>
                    <Badge variant="outline" className={cn(
                      "border",
                      budgetUtilization > 90 ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700" :
                      budgetUtilization > 75 ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700" :
                      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700"
                    )}>
                      {budgetUtilization}%
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  className={cn(
                    "relative py-4 px-6 rounded-none transition-all duration-300",
                    "data-[state=active]:bg-gradient-to-b data-[state=active]:from-slate-50 data-[state=active]:to-white",
                    "dark:data-[state=active]:from-slate-800/50 dark:data-[state=active]:to-slate-800",
                    "data-[state=active]:text-slate-700 dark:data-[state=active]:text-slate-300",
                    "data-[state=active]:shadow-sm",
                    "hover:bg-slate-50/50 dark:hover:bg-slate-800/50",
                    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
                    "data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-slate-500 data-[state=active]:after:to-buildease-orange-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Documents</span>
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700">
                      12
                    </Badge>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="team" className="p-6 sm:p-8 mt-0">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-buildease-blue-500 to-buildease-orange-500 rounded-full" />
                      Team Collaboration
                    </h4>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                      Manage team members, roles, and responsibilities for optimal project coordination
                    </p>
                  </div>
                  <Button
                    onClick={onManageTeam}
                    size="default"
                    className="bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 hover:from-buildease-blue-700 hover:to-buildease-blue-800 text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-xl font-semibold"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Team
                  </Button>
                </div>

                <div className="bg-gradient-to-br from-slate-50/50 to-buildease-blue-50/30 dark:from-slate-800/50 dark:to-buildease-blue-950/30 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
                  <TeamMembersSection 
                    members={teamMembers} 
                    onManageTeam={undefined} // Remove duplicate button
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="budget" className="p-6 mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Financial Management</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Track budget allocation, expenses, and financial health
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      budgetUtilization > 90 ? "bg-red-100 text-red-700 border-red-300" :
                      budgetUtilization > 75 ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
                      "bg-green-100 text-green-700 border-green-300"
                    )}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {budgetUtilization > 90 ? "Over Budget" : 
                       budgetUtilization > 75 ? "High Usage" : "On Track"}
                    </Badge>
                  </div>
                </div>

                <BudgetOverview projectName={projectName} />
              </div>
            </TabsContent>

            <TabsContent value="documents" className="p-6 sm:p-8 mt-0">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-slate-500 to-buildease-orange-500 rounded-full" />
                      Project Documents
                    </h4>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                      Manage files, drawings, specifications, and project documentation
                    </p>
                  </div>
                  <Button
                    onClick={() => {/* Upload functionality handled by DocumentManager */}}
                    size="default"
                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-xl font-semibold"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>

                <div className="bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-800/50 dark:to-slate-900/30 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
                  <DocumentManager projectId={projectId} hideUploadButton={true} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}