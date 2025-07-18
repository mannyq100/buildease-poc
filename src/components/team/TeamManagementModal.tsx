import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/core/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BaseModal } from '@/components/ui/BaseModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  UserPlus, 
  UserMinus, 
  Search, 
  Settings2,
  Mail,
  Activity,
  AlertCircle,
  CheckCircle2,
  Phone
} from 'lucide-react';
import teamData from '@/data/mock/json/team.json';

// Type definition based on existing team.json structure
interface TeamMember {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  completedTasks: number;
  totalTasks: number;
  performance: number;
  availability: string;
  status: string;
  isTopPerformer: boolean;
  joinDate: string;
}

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onTeamUpdate?: () => void;
}

export function TeamManagementModal({ 
  isOpen, 
  onClose, 
  projectId, 
  onTeamUpdate 
}: TeamManagementModalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // Available roles from existing departments
  const roles = teamData.departments.filter(dept => dept !== 'All');

  useEffect(() => {
    if (isOpen) {
      loadTeamMembers();
    }
  }, [isOpen, projectId]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setTeamMembers(teamData.members);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail || !newMemberRole) return;

    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newMember: TeamMember = {
        id: Math.max(...teamMembers.map(m => m.id)) + 1,
        name: newMemberEmail.split('@')[0].replace(/[.-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        position: newMemberRole,
        email: newMemberEmail,
        phone: '(555) 000-0000',
        avatar: '/api/placeholder/32/32',
        department: newMemberRole,
        completedTasks: 0,
        totalTasks: 0,
        performance: 85,
        availability: 'available',
        status: 'active',
        isTopPerformer: false,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };
      
      setTeamMembers(prev => [...prev, newMember]);
      setNewMemberEmail('');
      setNewMemberRole('');
      setShowAddMember(false);
      onTeamUpdate?.();
    } catch (error) {
      console.error('Failed to add team member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (confirm(`Are you sure you want to remove ${member.name} from the project?`)) {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setTeamMembers(prev => prev.filter(m => m.id !== member.id));
        onTeamUpdate?.();
      } catch (error) {
        console.error('Failed to remove team member:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRoleChange = async (member: TeamMember, newRole: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setTeamMembers(prev => prev.map(m => 
        m.id === member.id 
          ? { ...m, position: newRole, department: newRole }
          : m
      ));
      onTeamUpdate?.();
    } catch (error) {
      console.error('Failed to update member role:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-meeting':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'away':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'do-not-disturb':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    const variants = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'in-meeting': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      away: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'do-not-disturb': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };

    return (
      <Badge variant="outline" className={cn('text-xs', variants[availability as keyof typeof variants])}>
        {availability.replace('-', ' ')}
      </Badge>
    );
  };

  const getPerformanceBadge = (performance: number) => {
    if (performance >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (performance >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    if (performance >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Management"
      description="Manage project team members, roles, and permissions."
      size="4xl"
    >
      <div className="space-y-4">
          {/* Search and Add Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowAddMember(!showAddMember)}
              className="bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          {/* Add Member Form */}
          {showAddMember && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
              <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Add New Team Member</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddMember}
                    disabled={!newMemberEmail || !newMemberRole || loading}
                    size="sm"
                    className="bg-buildease-blue-600 hover:bg-buildease-blue-700"
                  >
                    Add
                  </Button>
                  <Button
                    onClick={() => setShowAddMember(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Team Members Table */}
          <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role & Department</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-buildease-blue-600"></div>
                        <span className="ml-2">Loading team members...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      {searchTerm ? 'No team members match your search.' : 'No team members found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={member.avatar || '/api/placeholder/32/32'}
                              alt={member.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            {member.isTopPerformer && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 bg-buildease-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">★</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {member.name}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Select
                            value={member.position}
                            onValueChange={(value) => handleRoleChange(member, value)}
                            disabled={loading}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Badge variant="outline" className="text-xs">
                            {member.department}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAvailabilityIcon(member.availability)}
                          {getAvailabilityBadge(member.availability)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{member.performance}%</span>
                            <Badge 
                              variant="outline" 
                              className={cn('text-xs', getPerformanceBadge(member.performance))}
                            >
                              {member.performance >= 90 ? 'Excellent' : 
                               member.performance >= 80 ? 'Good' : 
                               member.performance >= 70 ? 'Average' : 'Needs Improvement'}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {member.completedTasks}/{member.totalTasks}
                          </div>
                          <div className="text-slate-500">
                            {member.totalTasks > 0 
                              ? `${Math.round((member.completedTasks / member.totalTasks) * 100)}% complete`
                              : 'No tasks'
                            }
                          </div>
                          <div className="text-xs text-slate-400">
                            Joined {member.joinDate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Member settings"
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveMember(member)}
                            disabled={loading}
                            title="Remove member"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
    </BaseModal>
  );
}