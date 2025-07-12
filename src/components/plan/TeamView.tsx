import React, { useState, useMemo, useCallback } from 'react';
import { ConstructionPlan } from '@/data/mock/generatedPlan/planData';
import { TeamMember as PlanTeamMember } from '@/data/mock/generatedPlan/planData'; // Keep original for initial data
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Mail, Phone, Plus, Edit, Trash } from 'lucide-react'; // Added Plus, Edit, Trash
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'; // Import Button
import { TeamModal } from '@/components/shared/modals/TeamModal'; // Import TeamModal
import { TeamMember } from '@/types/team'; // Import the type from types/team.ts
import { VirtualizedTeamGrid } from './VirtualizedTeamGrid';
import { useDebounceSearch, searchTeamMembers } from '@/hooks/useDebounceSearch';
import { SearchInput } from '@/components/shared/SearchInput';
import { useTeamModal } from '@/stores/modalStore';

interface TeamViewProps {
  plan: ConstructionPlan;
}

export function TeamView({ plan }: TeamViewProps) {
  // Initialize state with plan data, ensuring compatibility with our TeamMember type
  const initialTeamMembers: TeamMember[] = plan.team.map((member: PlanTeamMember): TeamMember => {
    // Spread existing fields from PlanTeamMember
    // Provide defaults for required fields in types/team.ts TeamMember that are missing
    return {
      ...member, // Includes id, name, role, email, phone?, avatar?
      // Defaults for required fields missing in PlanTeamMember
      department: 'Unassigned', 
      status: 'active', 
      joinDate: new Date().toISOString(), 
      availability: 'Full-time', 
    };
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers); // State for team members
  
  // Use Zustand modal hook
  const teamModal = useTeamModal();

  // Search functionality with debouncing
  const teamSearchFunction = useCallback((members: TeamMember[], searchTerm: string) => 
    searchTeamMembers(members, searchTerm), []);

  const {
    searchTerm,
    filteredResults: filteredTeamMembers,
    isSearching,
    setSearchTerm,
    clearSearch,
    searchStats
  } = useDebounceSearch(teamMembers, teamSearchFunction, {
    delay: 300,
    minLength: 1
  });

  // Use virtualization for large team lists (threshold: 15+ members)
  const shouldUseVirtualization = filteredTeamMembers.length > 15;

  // Convert team members to virtualization format
  const virtualizedTeamMembers = useMemo(() => filteredTeamMembers.map(member => ({
    ...member,
    status: member.status as 'active' | 'inactive' | 'busy',
    joinDate: member.joinDate || new Date().toISOString(),
    taskCount: undefined, // Could be populated from actual data
    completedTasks: undefined // Could be populated from actual data
  })), [filteredTeamMembers]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-buildease-blue-500 dark:bg-buildease-blue-600',
      'bg-buildease-earth-600 dark:bg-buildease-earth-700',
      'bg-buildease-orange-500 dark:bg-buildease-orange-600',
      'bg-buildease-blue-600 dark:bg-buildease-blue-700',
      'bg-buildease-earth-700 dark:bg-buildease-earth-800',
      'bg-buildease-blue-700 dark:bg-buildease-blue-800',
      'bg-buildease-earth-500 dark:bg-buildease-earth-600',
    ];
    
    // Use the first character's charcode to determine the color
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // --- Modal Handling Functions ---
  function handleOpenAddModal() {
    teamModal.actions.open(undefined, true);
  }

  function handleOpenEditModal(item: TeamMember) {
    teamModal.actions.open(item, false);
  }

  function handleSaveTeamMember(savedItem: Partial<TeamMember>) {
    setTeamMembers(prevItems => {
      if (teamModal.isNew) {
        // Add new item (assign temporary ID for mock, ensure required fields)
        const newItemWithDefaults: TeamMember = {
          id: Date.now() + Math.random(), // Simple unique ID for demo
          name: savedItem.name || 'Unknown Name',
          role: savedItem.role || 'Unknown Role', // Role is required in the updated type
          email: savedItem.email || 'unknown@example.com',
          phone: savedItem.phone || '', // Optional phone
          status: savedItem.status || 'active',
          department: savedItem.department || 'Unassigned', // Default required field
          joinDate: savedItem.joinDate || new Date().toISOString(), // Default required field
          availability: savedItem.availability || 'Full-time', // Default required field
          permissions: savedItem.permissions || 'Viewer', // Provide default permissions
          avatar: undefined, // Default avatar if not handled
        };
        return [...prevItems, newItemWithDefaults];
      } else {
        // Update existing item
        return prevItems.map(item => 
          item.id === teamModal.data?.id 
            ? { ...item, ...savedItem }
            : item
        );
      }
    });
    
    // Close modal after save
    teamModal.actions.close();
  }

  function handleDeleteTeamMember(id: number | string) {
    setTeamMembers(prevItems => prevItems.filter(item => item.id !== id));
  }

  const handleContactMember = (member: TeamMember, type: 'email' | 'phone') => {
    if (type === 'email') {
      window.open(`mailto:${member.email}`, '_blank');
    } else if (type === 'phone' && member.phone) {
      window.open(`tel:${member.phone.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-white via-buildease-blue-50/20 to-buildease-earth-50/20 dark:from-gray-900 dark:via-buildease-blue-950/10 dark:to-buildease-earth-950/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-buildease-blue-50/50 via-white/80 to-buildease-earth-50/40 dark:from-buildease-blue-950/30 dark:via-gray-800/40 dark:to-buildease-earth-950/20 border-b border-buildease-blue-200/40 dark:border-buildease-blue-800/40 p-5 backdrop-blur-sm">
            <CardTitle className="text-xl font-bold text-buildease-blue-800 dark:text-buildease-blue-200 flex items-center gap-2 tracking-tight">
              <Users className="h-5 w-5 text-buildease-blue-600 dark:text-buildease-blue-400" />
              Project Team
            </CardTitle>
            {/* Add Member Button */}
            <Button size="sm" onClick={handleOpenAddModal} className="bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 border-0">
              <Plus className="h-4 w-4 mr-1" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search Input */}
            {teamMembers.length > 0 && (
              <div className="mb-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClear={clearSearch}
                  placeholder="Search team members, roles, email..."
                  isSearching={isSearching}
                  searchStats={searchStats}
                  size="sm"
                />
              </div>
            )}
            
             {teamMembers.length === 0 ? (
              <div className="text-center py-12 text-buildease-earth-600 dark:text-buildease-earth-400 bg-gradient-to-br from-buildease-blue-50/40 to-white/60 dark:from-buildease-blue-950/20 dark:to-gray-800/40 rounded-xl border border-dashed border-buildease-blue-300/60 dark:border-buildease-blue-700/60 backdrop-blur-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-buildease-blue-100/60 dark:bg-buildease-blue-900/40 mb-4 shadow-sm ring-2 ring-buildease-blue-200/50 dark:ring-buildease-blue-800/50">
                  <Users className="h-8 w-8 text-buildease-blue-600 dark:text-buildease-blue-400" />
                </div>
                <p className="font-medium text-base mb-1">No team members</p>
                <p className="text-sm mb-3">Start by adding your first team member</p>
                <Button
                  onClick={handleOpenAddModal}
                  size="sm"
                  className="bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 border-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Your First Member
                </Button>
              </div>
            ) : filteredTeamMembers.length === 0 ? (
              <div className="text-center py-12 text-buildease-earth-600 dark:text-buildease-earth-400 bg-gradient-to-br from-buildease-blue-50/40 to-white/60 dark:from-buildease-blue-950/20 dark:to-gray-800/40 rounded-xl border border-dashed border-buildease-blue-300/60 dark:border-buildease-blue-700/60 backdrop-blur-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-buildease-blue-100/60 dark:bg-buildease-blue-900/40 mb-4 shadow-sm ring-2 ring-buildease-blue-200/50 dark:ring-buildease-blue-800/50">
                  <Users className="h-8 w-8 text-buildease-blue-600 dark:text-buildease-blue-400" />
                </div>
                <p className="font-medium text-base mb-1">
                  {searchStats.hasActiveSearch ? 'No matching team members' : 'No team members found'}
                </p>
                <p className="text-sm mb-3">
                  {searchStats.hasActiveSearch 
                    ? `No team members found matching "${searchTerm}"`
                    : 'This should not happen - there were team members before'
                  }
                </p>
              </div>
            ) : shouldUseVirtualization ? (
              <VirtualizedTeamGrid
                teamMembers={virtualizedTeamMembers}
                onEditMember={(id) => {
                  const member = teamMembers.find(m => m.id === id);
                  if (member) handleOpenEditModal(member);
                }}
                onDeleteMember={handleDeleteTeamMember}
                onContactMember={handleContactMember}
                height={500}
                itemWidth={320}
                itemHeight={220}
                columnsCount={3}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-5 bg-white/90 dark:bg-gray-800/90 border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 relative group backdrop-blur-md ring-1 ring-buildease-blue-100/20 dark:ring-buildease-blue-900/20 hover:ring-buildease-blue-200/30 dark:hover:ring-buildease-blue-800/30"
                  >
                    {/* Edit/Delete Buttons (Appear on Hover) */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-buildease-earth-600 dark:text-buildease-earth-400 hover:text-buildease-blue-700 dark:hover:text-buildease-blue-300 hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-900/20 rounded-md transition-all duration-200" onClick={() => handleOpenEditModal(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-buildease-earth-600 dark:text-buildease-earth-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200" onClick={() => handleDeleteTeamMember(member.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className={getAvatarColor(member.name)}>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-buildease-blue-800 dark:text-buildease-blue-200">{member.name}</h3>
                        <p className="text-sm text-buildease-earth-600 dark:text-buildease-earth-400 font-medium">{member.role}</p>
                      </div>
                    </div>
                  
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center text-secondary dark:text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2 text-buildease-blue-600 dark:text-buildease-blue-400" />
                        <a href={`mailto:${member.email}`} className="hover:text-buildease-blue-700 dark:hover:text-buildease-blue-300 transition-colors font-medium">
                          {member.email}
                        </a>
                      </div>
                      {member.phone && (
                        <div className="flex items-center text-secondary dark:text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                          <a href={`tel:${member.phone.replace(/[^0-9]/g, '')}`} className="hover:text-[#2B6CB0] dark:hover:text-[#93C5FD] transition-colors">
                            {member.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
             )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Render the TeamModal */}
      <TeamModal
        show={teamModal.isOpen}
        onClose={teamModal.actions.close}
        onSave={handleSaveTeamMember}
        initialData={teamModal.data}
        isNewItem={teamModal.isNew}
      />
    </div>
  );
}
