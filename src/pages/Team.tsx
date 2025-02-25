import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Award,
  AlertCircle,
  UserX,
  Star
} from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  DashboardLayout, 
  DashboardSection, 
  Grid 
} from '@/components/layout/test';
import { 
  MetricCard,
  PageHeader,
  StatusBadge
} from '@/components/shared';

// Enhanced team member data with additional fields
const initialTeamMembers = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Project Manager',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    department: 'Management',
    projects: ['Villa Construction', 'Office Renovation'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    skills: ['Project Planning', 'Resource Management', 'Budgeting'],
    workload: 85,
    joinDate: '15 Jan 2023',
    certifications: ['PMP', 'LEED Green Associate'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Architect',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 987-6543',
    department: 'Design',
    projects: ['Villa Construction'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    skills: ['SketchUp', 'Revit', 'Architectural Design'],
    workload: 70,
    joinDate: '03 Mar 2023',
    certifications: ['Licensed Architect'],
    availability: 'Full-time',
    location: 'Tema, Ghana'
  },
  {
    id: 3,
    name: 'Robert Johnson',
    role: 'Civil Engineer',
    email: 'robert.johnson@example.com',
    phone: '+1 (555) 456-7890',
    department: 'Engineering',
    projects: ['Villa Construction', 'Office Renovation'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    skills: ['Structural Analysis', 'AutoCAD', 'Site Inspection'],
    workload: 60,
    joinDate: '10 Apr 2023',
    certifications: ['Civil Engineering License'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 4,
    name: 'Emily Davis',
    role: 'Interior Designer',
    email: 'emily.davis@example.com',
    phone: '+1 (555) 234-5678',
    department: 'Design',
    projects: ['Office Renovation'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    skills: ['Space Planning', 'Color Theory', 'Material Selection'],
    workload: 90,
    joinDate: '22 May 2023',
    certifications: ['NCIDQ'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 5,
    name: 'Michael Wilson',
    role: 'Construction Manager',
    email: 'michael.wilson@example.com',
    phone: '+1 (555) 876-5432',
    department: 'Construction',
    projects: ['Villa Construction'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    skills: ['Safety Protocols', 'Risk Assessment', 'OSHA Compliance'],
    workload: 65,
    joinDate: '14 Jun 2023',
    certifications: ['NEBOSH', 'First Aid'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 6,
    name: 'Sarah Brown',
    role: 'Procurement Specialist',
    email: 'sarah.brown@example.com',
    phone: '+1 (555) 345-6789',
    department: 'Procurement',
    projects: ['Office Renovation'],
    status: 'inactive',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    skills: ['Vendor Management', 'Negotiation', 'Supply Chain'],
    workload: 0,
    joinDate: '30 Jul 2023',
    certifications: ['CPSM'],
    availability: 'On leave',
    location: 'Accra, Ghana'
  },
  {
    id: 7,
    name: 'David Miller',
    role: 'Electrical Engineer',
    email: 'david.miller@example.com',
    phone: '+1 (555) 654-3210',
    department: 'Engineering',
    projects: ['Villa Construction'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    skills: ['Electrical Wiring', 'Circuit Design', 'Troubleshooting'],
    workload: 75,
    joinDate: '12 Aug 2023',
    certifications: ['Licensed Electrician'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 8,
    name: 'Lisa Taylor',
    role: 'Safety Officer',
    email: 'lisa.taylor@example.com',
    phone: '+1 (555) 789-0123',
    department: 'Safety',
    projects: ['Villa Construction', 'Office Renovation'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    skills: ['Safety Protocols', 'Risk Assessment', 'OSHA Compliance'],
    workload: 50,
    joinDate: '12 Aug 2023',
    certifications: ['NEBOSH', 'First Aid'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  }
];

// Department options for filtering and forms
const departments = [
  'All Departments',
  'Management',
  'Design',
  'Engineering',
  'Construction',
  'Procurement',
  'Safety'
];

// Role options for forms
const roles = [
  'Project Manager',
  'Architect',
  'Civil Engineer',
  'Electrical Engineer',
  'Interior Designer',
  'Construction Manager',
  'Procurement Specialist',
  'Safety Officer'
];

const Team = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewProfileDialogOpen, setViewProfileDialogOpen] = useState(false);
  const [confirmRemoveDialogOpen, setConfirmRemoveDialogOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    department: '',
    projects: []
  });

  // Open member profile dialog
  const openViewProfile = (member) => {
    setSelectedMember(member);
    setViewProfileDialogOpen(true);
  };

  // Open confirm remove dialog
  const openConfirmRemoveDialog = (member) => {
    setSelectedMember(member);
    setConfirmRemoveDialogOpen(true);
  };

  // Filter team members based on search query and department filter
  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.skills && member.skills.some(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    const matchesDepartment = 
      departmentFilter === 'All Departments' || 
      member.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Count active team members
  const activeTeamMembers = teamMembers.filter(member => member.status === 'active').length;

  // Calculate average workload
  const avgWorkload = Math.round(
    teamMembers
      .filter(member => member.status === 'active')
      .reduce((sum, member) => sum + member.workload, 0) / activeTeamMembers
  );

  // Count total certifications
  const totalCertifications = teamMembers.reduce(
    (total, member) => total + (member.certifications ? member.certifications.length : 0), 
    0
  );

  // Handle adding a new team member
  const handleAddMember = () => {
    const id = Math.max(...teamMembers.map(m => m.id)) + 1;
    const newTeamMember = {
      ...newMember,
      id,
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMember.name.split(' ')[0]}`,
      skills: [],
      workload: 0,
      joinDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      certifications: [],
      availability: 'Full-time',
      location: 'Accra, Ghana'
    };
    
    setTeamMembers([...teamMembers, newTeamMember]);
    setNewMember({
      name: '',
      role: '',
      email: '',
      phone: '',
      department: '',
      projects: []
    });
    setIsAddMemberOpen(false);
  };

  // Handle changing member status (active/inactive)
  const handleStatusChange = (id, newStatus) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, status: newStatus } : member
    ));
  };

  // Handle deleting a team member
  const handleDeleteMember = (id) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
    setConfirmRemoveDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Team Management" 
        subtitle="Manage your project team members"
        action={
          <Button onClick={() => setIsAddMemberOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        }
      />
      
      <DashboardLayout>
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Team Statistics */}
          <Grid cols={4} className="w-full">
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Members</p>
                  <p className="text-xl font-semibold">{teamMembers.length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Projects</p>
                  <p className="text-xl font-semibold">2</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg. Workload</p>
                  <p className="text-xl font-semibold">{avgWorkload}%</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Certifications</p>
                  <p className="text-xl font-semibold">{totalCertifications}</p>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </div>
        
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              className="pl-10" 
              placeholder="Search team members by name, role, or skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select 
              value={departmentFilter} 
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(department => (
                  <SelectItem key={department} value={department}>{department}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="villa">Villa Construction</SelectItem>
                <SelectItem value="office">Office Renovation</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <DashboardSection>
          <Tabs defaultValue="grid">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              
              <Select defaultValue="name">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="workload">Workload</SelectItem>
                  <SelectItem value="date">Join Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <TabsContent value="grid">
              <Grid cols={3} gap="lg" className="mt-2">
                {filteredTeamMembers.map(member => (
                  <TeamMemberCard 
                    key={member.id} 
                    member={member} 
                    onView={() => openViewProfile(member)}
                    onRemove={() => openConfirmRemoveDialog(member)}
                  />
                ))}
              </Grid>
              {filteredTeamMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No team members found matching your search criteria.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="list">
              <div className="space-y-2 mt-2">
                {filteredTeamMembers.map(member => (
                  <TeamMemberListItem 
                    key={member.id} 
                    member={member} 
                    onView={() => openViewProfile(member)}
                    onRemove={() => openConfirmRemoveDialog(member)}
                  />
                ))}
                {filteredTeamMembers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No team members found matching your search criteria.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DashboardSection>
      </DashboardLayout>
      
      {/* Add Team Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your project team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input placeholder="First name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input placeholder="Last name" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="email@example.com" 
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input 
                placeholder="Phone number" 
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select 
                onValueChange={(value) => setNewMember({...newMember, role: value})}
                value={newMember.role}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select 
                onValueChange={(value) => setNewMember({...newMember, department: value})}
                value={newMember.department}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.filter(d => d !== 'All Departments').map(department => (
                    <SelectItem key={department} value={department}>{department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign to Project</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa">Villa Construction</SelectItem>
                  <SelectItem value="office">Office Renovation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>
              Add Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Team Member Profile Dialog */}
      {selectedMember && (
        <Dialog open={viewProfileDialogOpen} onOpenChange={setViewProfileDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Team Member Profile</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-32 w-32 border-2 border-gray-200">
                    <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                    <AvatarFallback>{selectedMember.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <h3 className="mt-4 text-xl font-semibold text-center">{selectedMember.name}</h3>
                  <p className="text-gray-600">{selectedMember.role}</p>
                  
                  <div className="mt-4 flex gap-2 items-center justify-center">
                    <Badge className={`${selectedMember.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedMember.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-600">
                      {selectedMember.availability}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{selectedMember.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{selectedMember.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{selectedMember.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Current Projects</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.projects.map(project => (
                        <Badge key={project} className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                          {project}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Skills & Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.skills && selectedMember.skills.map(skill => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.certifications && selectedMember.certifications.map(cert => (
                        <div key={cert} className="flex items-center text-sm">
                          <Award className="w-4 h-4 text-yellow-500 mr-1" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Current Workload</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Allocation</span>
                        <span className={`font-medium ${
                          selectedMember.workload > 80 ? 'text-red-600' : 
                          selectedMember.workload > 60 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {selectedMember.workload}%
                        </span>
                      </div>
                      <Progress 
                        value={selectedMember.workload} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setViewProfileDialogOpen(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Manage Assignments
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Confirm Remove Team Member Dialog */}
      {selectedMember && (
        <Dialog open={confirmRemoveDialogOpen} onOpenChange={setConfirmRemoveDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Remove Team Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {selectedMember.name} from your team? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Warning</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This team member is currently assigned to {selectedMember.projects.length} projects. 
                    Removing them will require reassigning their tasks.
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmRemoveDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleDeleteMember(selectedMember.id)}
              >
                <UserX className="w-4 h-4 mr-2" />
                Remove Team Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Team member card component for grid view
const TeamMemberCard = ({ member, onView, onRemove }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-0">
        <div className="p-4 flex flex-col items-center border-b">
          <Avatar className="h-20 w-20">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <h3 className="mt-3 font-semibold text-center">{member.name}</h3>
          <p className="text-sm text-gray-600">{member.role}</p>
          
          <div className="mt-2">
            <Badge className={`${member.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
              {member.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Department</h4>
            <p className="text-sm">{member.department}</p>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Projects</h4>
            <div className="flex flex-wrap gap-1">
              {member.projects.map(project => (
                <Badge key={project} variant="outline" className="text-xs">
                  {project}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Workload</h4>
            <div className="space-y-1">
              <Progress 
                value={member.workload} 
                className="h-1.5" 
              />
              <div className="flex justify-between text-xs">
                <span>Allocation</span>
                <span className={`font-medium ${
                  member.workload > 80 ? 'text-red-600' : 
                  member.workload > 60 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {member.workload}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 border-t flex justify-between">
          <Button variant="ghost" size="sm" onClick={onView}>View Profile</Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="w-4 h-4 mr-2" />
                Manage Assignments
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={onRemove}>
                <UserX className="w-4 h-4 mr-2" />
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

// Team member list item component for list view
const TeamMemberListItem = ({ member, onView, onRemove }) => {
  return (
    <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-all gap-4">
      <Avatar>
        <AvatarImage src={member.avatar} alt={member.name} />
        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <h4 className="font-medium truncate mr-2">{member.name}</h4>
          <Badge className={`${member.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
            {member.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{member.role} • {member.department}</p>
      </div>
      
      <div className="flex items-center gap-2 min-w-0 max-w-[180px] w-full">
        <div className="text-sm text-gray-600 mr-2">Projects:</div>
        <div className="flex flex-wrap gap-1 overflow-hidden">
          {member.projects.map(project => (
            <Badge key={project} variant="outline" className="text-xs">
              {project}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="w-32">
        <div className="text-xs mb-1 flex justify-between">
          <span>Workload</span>
          <span className={
            member.workload > 80 ? 'text-red-600' : 
            member.workload > 60 ? 'text-yellow-600' : 
            'text-green-600'
          }>
            {member.workload}%
          </span>
        </div>
        <Progress value={member.workload} className="h-1.5" />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onView}>
          View
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="w-4 h-4 mr-2" />
              Manage Assignments
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={onRemove}>
              <UserX className="w-4 h-4 mr-2" />
              Remove Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Team; 