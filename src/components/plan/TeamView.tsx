import React from 'react';
import { TeamMember, ConstructionPlan } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Mail, Phone } from 'lucide-react';
import { motion as m } from 'framer-motion';

interface TeamViewProps {
  plan: ConstructionPlan;
}

export function TeamView({ plan }: TeamViewProps) {
  const teamMembers = plan.team;
  
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

  return (
    <div className="space-y-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700 pb-3">
            <CardTitle className="text-lg font-semibold text-[#2B6CB0] dark:text-[#93C5FD] flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Project Team
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member, index) => (
                <m.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
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
          </CardContent>
        </Card>
      </m.div>
    </div>
  );
}
