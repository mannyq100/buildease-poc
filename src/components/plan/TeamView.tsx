import React, { useState } from 'react';
import { ConstructionPlan } from '@/data/mock/generatedPlan/planData';
import { TeamMember as PlanTeamMember } from '@/data/mock/generatedPlan/planData'; // Keep original for initial data
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Mail, Phone, Plus, Edit, Trash } from 'lucide-react'; // Added Plus, Edit, Trash
import { motion as m } from 'framer-motion';
import { Button } from '@/components/ui/button'; // Import Button
import { TeamModal } from '@/components/shared/modals/TeamModal'; // Import TeamModal
import { TeamMember } from '@/types/team'; // Import the type from types/team.ts

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
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<TeamMember | null>(null);
  const [isNewItem, setIsNewItem] = useState(true);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500 dark:bg-blue-600',
      'bg-purple-500 dark:bg-purple-600',
      'bg-green-500 dark:bg-green-600',
      'bg-orange-500 dark:bg-orange-600',
      'bg-red-500 dark:bg-red-600',
      'bg-indigo-500 dark:bg-indigo-600',
      'bg-teal-500 dark:bg-teal-600',
    ];
    
    // Use the first character's charcode to determine the color
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // --- Modal Handling Functions ---
  function handleOpenAddModal() {
    setCurrentItem(null); // Clear previous data
    setIsNewItem(true);
    setShowTeamModal(true);
  }

  function handleOpenEditModal(item: TeamMember) {
    setCurrentItem(item);
    setIsNewItem(false);
    setShowTeamModal(true);
  }

  function handleSaveTeamMember(savedItem: Partial<TeamMember>) {
    setTeamMembers(prevItems => {
      if (isNewItem) {
        // Add new item (assign temporary ID for mock, ensure required fields)
        const newItemWithDefaults: TeamMember = {
          id: Date.now() + Math.random(), // Simple unique ID for demo
          name: savedItem.name || 'Unknown Name',
          role: savedItem.role || 'Unknown Role', // Role is required in the updated type
          email: savedItem.email || 'unknown@example.com',
          phone: savedItem.phone || '', // Optional phone
          status: savedItem.status || 'active',
          department: 'Unassigned', // Default required field
          joinDate: new Date().toISOString(), // Default required field
          availability: 'Unknown', // Default required field
          permissions: savedItem.permissions || 'Viewer', // Provide default permissions
          avatar: undefined, // Default avatar if not handled
          // --- Other optional fields from TeamMember can default to undefined or empty arrays ---
          projects: [], 
          skills: [],
          certifications: [],
          tags: [],
          location: undefined,
          workload: undefined,
          completedTasks: undefined,
          totalTasks: undefined,
          performance: undefined,
          isTopPerformer: undefined,
        };
        return [...prevItems, newItemWithDefaults];
      } else {
        // Update existing item
        return prevItems.map(item => item.id === savedItem.id ? { ...item, ...savedItem } : item);
      }
    });
    setShowTeamModal(false); // Close modal after save
    setCurrentItem(null);
  }
  
  function handleDeleteTeamMember(id: number | string) {
    // Add confirmation dialog in real app
    setTeamMembers(prevItems => prevItems.filter(item => item.id !== id));
  }
  // --- End Modal Handling ---


  return (
    <div className="space-y-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#2B6CB0] dark:text-[#93C5FD] flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Project Team
            </CardTitle>
            {/* Add Member Button */}
            <Button size="sm" onClick={handleOpenAddModal} className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent className="p-4">
             {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No team members added yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member, index) => (
                  <m.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative group"
                  >
                    {/* Edit/Delete Buttons (Appear on Hover) */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50" onClick={() => handleOpenEditModal(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50" onClick={() => handleDeleteTeamMember(member.id)}>
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
                        <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>
                  
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <a href={`mailto:${member.email}`} className="hover:text-[#2B6CB0] dark:hover:text-[#93C5FD] transition-colors">
                          {member.email}
                        </a>
                      </div>
                      {member.phone && (
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                          <a href={`tel:${member.phone.replace(/[^0-9]/g, '')}`} className="hover:text-[#2B6CB0] dark:hover:text-[#93C5FD] transition-colors">
                            {member.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </m.div>
                ))}
              </div>
             )}
          </CardContent>
        </Card>
      </m.div>

      {/* Render the TeamModal */}
      <TeamModal
        show={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        onSave={handleSaveTeamMember}
        initialData={currentItem}
        isNewItem={isNewItem}
      />
    </div>
  );
}
