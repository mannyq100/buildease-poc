import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  Phone,
  Building,
  Award,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Briefcase,
  User,
  Activity,
  Info
} from 'lucide-react';
import type { TeamMember } from '@/types/team';

interface TeamMemberDetailProps {
  member: TeamMember | null;
  open: boolean;
  onClose: () => void;
  onEdit: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
}

/**
 * TeamMemberDetail - Displays detailed information about a team member in a modal dialog
 * 
 * Following Buildese UI design principles:
 * - Card-based UI with subtle shadows
 * - Clear visual feedback
 * - Consistent spacing
 * - Modern, aesthetic look with warm blue accents
 * - Progressive disclosure for complex information
 */
export function TeamMemberDetail({ 
  member, 
  open, 
  onClose, 
  onEdit, 
  onRemove 
}: TeamMemberDetailProps) {
  if (!member) return null;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name} />
                ) : null}
                <AvatarFallback className="text-lg bg-blue-600 text-white">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-semibold">{member.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <span>{member.role}</span>
                  <span className="text-gray-300">•</span>
                  <Badge variant={member.status === 'active' ? 'success' : 'secondary'}>
                    {member.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                  <div className="font-medium">{member.email}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                  <div className="font-medium">{member.phone}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Department</div>
                  <div className="font-medium">{member.department}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Location</div>
                  <div className="font-medium">{member.location || 'Not specified'}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Joined</div>
                  <div className="font-medium">{formatDate(member.joinDate)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <Award className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Experience</div>
                  <div className="font-medium">{member.experience} years</div>
                </div>
              </div>
            </div>
            
            {member.bio && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">About</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{member.bio}</p>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {member.skills?.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Projects</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                {member.projects?.length || 0} Projects
              </Badge>
            </div>
            
            <div className="space-y-3">
              {member.projects?.length ? (
                member.projects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{project.role}</div>
                      </div>
                    </div>
                    <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No projects assigned</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Workload</h3>
                  <span className="text-sm font-medium">{member.workload}%</span>
                </div>
                <Progress value={member.workload} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Performance Rating</div>
                    <div className="font-medium">{member.performanceRating}/5</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Hours/Week</div>
                    <div className="font-medium">{member.hoursPerWeek || '40'} hours</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Communication</div>
                    <div className="font-medium">{member.communicationRating || '4'}/5</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Documentation</div>
                    <div className="font-medium">{member.documentationRating || '3.5'}/5</div>
                  </div>
                </div>
              </div>
              
              {member.notes && (
                <div className="mt-4 p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Performance Notes</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{member.notes}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onEdit(member)}>
            Edit Profile
          </Button>
          <Button variant="destructive" onClick={() => onRemove(member)}>
            Remove Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
