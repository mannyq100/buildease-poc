import React, { useState } from 'react';
import { ConstructionPlan } from '@/data/mock/generatedPlan/planData';
import { TeamMember as PlanTeamMember } from '@/data/mock/generatedPlan/planData'; // Keep original for initial data
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Mail, Phone, Plus, Edit, Trash } from 'lucide-react'; // Added Plus, Edit, Trash
import { motion } from 'framer-motion';
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
          item.id === currentItem?.id 
            ? { ...item, ...savedItem }
            : item
        );
      }
    });
    
    // Close modal after save
    setShowTeamModal(false);
  }

  function handleDeleteTeamMember(id: number | string) {
    setTeamMembers(prevItems => prevItems.filter(item => item.id !== id));
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#2B6CB0]/80 to-[#2B6CB0] p-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Project Team
            </CardTitle>
            {/* Add Member Button */}
            <Button size="sm" onClick={handleOpenAddModal} className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white shadow-sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent className="p-4">
             {teamMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                  <Users className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="font-medium text-base mb-1">No team members</p>
                <p className="text-sm mb-3">Start by adding your first team member</p>
                <Button
                  onClick={handleOpenAddModal}
                  size="sm"
                  className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Your First Member
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member, index) => (
                  <motion.div
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
                  </motion.div>
                ))}
              </div>
             )}
          </CardContent>
        </Card>
      </motion.div>

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
