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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  UserPlus, 
  Users, 
  ChevronRight, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Briefcase, 
  Clock, 
  CalendarDays, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Award, 
  Calendar, 
  Building, 
  Shield, 
  Wrench, 
  Download, 
  Edit, 
  Trash, 
  User, 
  Eye, 
  List, 
  Grid as GridIcon,
  Tag,
  UserCheck,
  UserX,
  Plus, 
  FileText,
  Radar,
  PieChart,
  Upload,
  DollarSign,
  ChevronDown,
  ArrowUpDown,
  Check,
  ChevronsUpDown,
  UserCog,
  Settings
} from 'lucide-react';
import { DashboardLayout, DashboardSection, Grid } from '@/components/layout/test';
import { PageHeader } from '@/components/shared';
import MainNavigation from '@/components/layout/MainNavigation';
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

// Define the TeamMember interface
interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  projects: string[];
  status: 'active' | 'inactive';
  avatar: string;
  skills: string[];
  workload: number;
  joinDate: string;
  certifications: string[];
  availability: string;
  location: string;
}

// Define props interfaces for the card and list components
interface TeamMemberCardProps {
  member: TeamMember;
  onView: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
}

interface TeamMemberListItemProps {
  member: TeamMember;
  onView: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
}

const initialTeamMembers: TeamMember[] = [
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
    name: 'Sarah Chen',
    role: 'Architect',
    email: 'sarah.chen@example.com',
    phone: '+1 (555) 234-5678',
    department: 'Design',
    projects: ['Villa Construction'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    skills: ['AutoCAD', 'Sustainable Design', '3D Modeling'],
    workload: 75,
    joinDate: '3 Mar 2023',
    certifications: ['Licensed Architect', 'LEED AP'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 3,
    name: 'Michael Osei',
    role: 'Civil Engineer',
    email: 'm.osei@example.com',
    phone: '+1 (555) 345-6789',
    department: 'Engineering',
    projects: ['Office Renovation'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    skills: ['Structural Analysis', 'Site Planning', 'Construction Management'],
    workload: 90,
    joinDate: '22 Feb 2023',
    certifications: ['PE', 'Construction Safety Certificate'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 4,
    name: 'Emma Thompson',
    role: 'Interior Designer',
    email: 'emma.t@example.com',
    phone: '+1 (555) 456-7890',
    department: 'Design',
    projects: ['Villa Construction', 'Office Renovation'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    skills: ['Space Planning', 'Color Theory', 'Material Selection'],
    workload: 65,
    joinDate: '10 Apr 2023',
    certifications: ['NCIDQ', 'Sustainable Interior Design'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 5,
    name: 'David Kwesi',
    role: 'Safety Officer',
    email: 'd.kwesi@example.com',
    phone: '+1 (555) 567-8901',
    department: 'Safety',
    projects: ['Villa Construction'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    skills: ['Risk Assessment', 'Safety Training', 'Compliance Management'],
    workload: 70,
    joinDate: '5 May 2023',
    certifications: ['OSHA Certified', 'First Aid Trainer'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 6,
    name: 'Lisa Mensah',
    role: 'Procurement Specialist',
    email: 'lisa.m@example.com',
    phone: '+1 (555) 678-9012',
    department: 'Procurement',
    projects: ['Office Renovation'],
    status: 'inactive',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    skills: ['Vendor Management', 'Contract Negotiation', 'Supply Chain'],
    workload: 0,
    joinDate: '15 Jan 2023',
    certifications: ['CPSM', 'Contract Management'],
    availability: 'On Leave',
    location: 'Accra, Ghana'
  },
  {
    id: 7,
    name: 'James Addo',
    role: 'Electrical Engineer',
    email: 'j.addo@example.com',
    phone: '+1 (555) 789-0123',
    department: 'Engineering',
    projects: ['Villa Construction', 'Office Renovation'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    skills: ['Power Systems', 'Lighting Design', 'Energy Efficiency'],
    workload: 80,
    joinDate: '20 Mar 2023',
    certifications: ['Licensed Electrician', 'Energy Auditor'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  }
];


// Define interface for new team members
interface NewTeamMember {
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  projects: string[];
  location?: string;
  skills?: string[];
  certifications?: string[];
  workload?: number;
  joinDate?: string;
  availability?: string;
}

const Team = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [newMember, setNewMember] = useState<NewTeamMember>({
    name: '',
    role: '',
    email: '',
    phone: '',
    department: '',
    projects: []
  });

  // Function to open the view profile dialog
  const openViewProfile = (member: TeamMember) => {
    setCurrentMember(member);
    setIsViewProfileOpen(true);
  };

  // Function to open the confirm remove dialog
  const openConfirmRemoveDialog = (member: TeamMember) => {
    setCurrentMember(member);
    setIsConfirmRemoveOpen(true);
  };

  // Filter team members based on search and filters
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      departmentFilter === 'All' || 
      member.department === departmentFilter;
    
    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Active' && member.status === 'active') ||
      (statusFilter === 'Inactive' && member.status === 'inactive');
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Handle adding a new team member
  const handleAddMember = () => {
    const id = Math.max(...teamMembers.map(m => m.id), 0) + 1;
    const newTeamMember: TeamMember = {
      id,
      name: newMember.name,
      role: newMember.role,
      email: newMember.email,
      phone: newMember.phone,
      department: newMember.department,
      projects: newMember.projects,
      status: 'active',
      avatar: '',
      skills: newMember.skills || [],
      workload: newMember.workload || 0,
      joinDate: newMember.joinDate || new Date().toISOString().split('T')[0],
      certifications: newMember.certifications || [],
      availability: newMember.availability || 'Full-time',
      location: newMember.location || 'Accra, Ghana'
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

  // Handle changing a team member's status
  const handleStatusChange = (id: number, newStatus: 'active' | 'inactive') => {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, status: newStatus } : member
    ));
  };

  // Handle deleting a team member
  const handleDeleteMember = (id: number) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
    setIsConfirmRemoveOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <MainNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Team Management"
          subtitle="Manage your construction project team members"
          icon={<Users className="h-6 w-6" />}
          actions={[
            {
              label: "Add Team Member",
              icon: <UserPlus />,
              variant: "construction",
              onClick: () => setIsAddMemberOpen(true)
            },
            {
              label: "Export",
              icon: <Download />,
              variant: "blueprint",
              onClick: () => {/* Export functionality */}
            }
          ]}
        />

        {/* Team Statistics */}
        <div className="mt-8 mb-6">
          <Grid cols={4} className="w-full gap-6">
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
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-xl font-semibold">{teamMembers.filter(m => m.status === 'active').length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Departments</p>
                  <p className="text-xl font-semibold">
                    {new Set(teamMembers.map(m => m.department)).size}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Radar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg. Workload</p>
                  <p className="text-xl font-semibold">
                    {teamMembers.length > 0 
                      ? Math.round(teamMembers.reduce((acc, m) => acc + m.workload, 0) / teamMembers.length) 
                      : 0}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  variant="modern"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Departments</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <GridIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredMembers.length === 0 ? (
              <Card className="col-span-full p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Users className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No team members found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your filters or add a new team member</p>
                  <Button onClick={() => setIsAddMemberOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
              </Card>
            ) : (
              filteredMembers.map(member => (
                <TeamMemberCard 
                  key={member.id} 
                  member={member} 
                  onView={() => openViewProfile(member)}
                  onRemove={() => openConfirmRemoveDialog(member)}
                />
              ))
            )}
          </div>
        ) : (
          <Card className="mb-8 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Workload</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-xl font-medium mb-2">No team members found</h3>
                          <p className="text-gray-500 mb-4">Try adjusting your filters or add a new team member</p>
                          <Button onClick={() => setIsAddMemberOpen(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Team Member
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map(member => (
                      <TeamMemberListItem 
                        key={member.id} 
                        member={member} 
                        onView={() => openViewProfile(member)}
                        onRemove={() => openConfirmRemoveDialog(member)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* Add Team Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your construction project team. Fill in all required information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Personal Information Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <User className="h-4 w-4 mr-2" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile image upload */}
                <div className="space-y-2 md:col-span-2 flex flex-col items-center">
                  <Avatar className="h-24 w-24 border-2 border-muted">
                    <AvatarFallback className="text-2xl">{newMember.name ? newMember.name.charAt(0) : 'T'}</AvatarFallback>
                  </Avatar>
                  
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    Full Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    id="name" 
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    placeholder="Enter full name"
                    className="focus:ring-1 focus:ring-deepblue"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="Enter location (city, country)"
                    value={newMember.location || ''}
                    onChange={(e) => setNewMember({...newMember, location: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    Email <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
            
            {/* Job Information Section */}
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Job Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center">
                    Role <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    id="role" 
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                    placeholder="Enter role (e.g. Project Manager)"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center">
                    Department <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select 
                    value={newMember.department} 
                    onValueChange={(value) => setNewMember({...newMember, department: value})}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Procurement">Procurement</SelectItem>
                      <SelectItem value="Quality Control">Quality Control</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="join-date">Join Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      id="join-date" 
                      type="date" 
                      className="pl-10"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select defaultValue="Full-time">
                    <SelectTrigger id="availability">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="projects" className="flex items-center">
                    Assigned Projects <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="villa-project"
                        onCheckedChange={(checked) => {
                          const updatedProjects = checked ? 
                            [...(newMember.projects || []), 'Villa Construction'] :
                            (newMember.projects || []).filter(p => p !== 'Villa Construction');
                          setNewMember({...newMember, projects: updatedProjects});
                        }}
                      />
                      <label htmlFor="villa-project" className="text-sm cursor-pointer">Villa Construction</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="office-project"
                        onCheckedChange={(checked) => {
                          const updatedProjects = checked ? 
                            [...(newMember.projects || []), 'Office Renovation'] :
                            (newMember.projects || []).filter(p => p !== 'Office Renovation');
                          setNewMember({...newMember, projects: updatedProjects});
                        }}
                      />
                      <label htmlFor="office-project" className="text-sm cursor-pointer">Office Renovation</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Skills & Qualifications Section */}
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Skills & Qualifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input 
                    id="skills" 
                    placeholder="Enter skills (e.g. Project Planning, AutoCAD)"
                    onChange={(e) => {
                      const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
                      setNewMember({...newMember, skills: skillsArray});
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications (comma separated)</Label>
                  <Input 
                    id="certifications" 
                    placeholder="Enter certifications (e.g. PMP, LEED)"
                    onChange={(e) => {
                      const certsArray = e.target.value.split(',').map(cert => cert.trim()).filter(Boolean);
                      setNewMember({...newMember, certifications: certsArray});
                    }}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="workload">Initial Workload (%)</Label>
                  <div className="flex items-center space-x-4">
                    <Input 
                      id="workload" 
                      type="number" 
                      min="0"
                      max="100"
                      defaultValue="0"
                      className="w-24"
                      onChange={(e) => setNewMember({...newMember, workload: parseInt(e.target.value) || 0})}
                    />
                    <Slider 
                      defaultValue={[0]} 
                      max={100} 
                      step={5}
                      className="flex-1"
                      onValueChange={(value) => setNewMember({...newMember, workload: value[0]})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted-foreground">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddMember}
                disabled={!newMember.name || !newMember.role || !newMember.email || !newMember.department || !newMember.projects || newMember.projects.length === 0}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={isViewProfileOpen} onOpenChange={setIsViewProfileOpen}>
        <DialogContent className="max-w-2xl">
          {currentMember && (
            <>
              <DialogHeader>
                <DialogTitle>Team Member Profile</DialogTitle>
              </DialogHeader>
              
              <div className="flex flex-col md:flex-row gap-6 py-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentMember.avatar} alt={currentMember.name} />
                    <AvatarFallback className="text-2xl">{currentMember.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Badge variant={currentMember.status === 'active' ? "success" : "secondary"}>
                    {currentMember.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold">{currentMember.name}</h2>
                    <p className="text-gray-500">{currentMember.role}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {currentMember.email}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {currentMember.phone}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {currentMember.department}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {currentMember.location}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-gray-400" />
                        Join Date: {new Date(currentMember.joinDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        Availability: {currentMember.availability}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Award className="h-4 w-4 mr-2 text-gray-400" />
                        Certifications: {currentMember.certifications.join(', ') || 'None'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Projects</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentMember.projects.map((project, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50">
                          {project}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentMember.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Workload</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Current allocation</span>
                        <span className="text-sm font-medium">{currentMember.workload}%</span>
                      </div>
                      <Progress value={currentMember.workload} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Dialog */}
      <AlertDialog open={isConfirmRemoveOpen} onOpenChange={setIsConfirmRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove {currentMember?.name} from the team. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => currentMember && handleDeleteMember(currentMember.id)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Team Member Card Component
const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onView, onRemove }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        </div>
        <Badge variant={member.status === 'active' ? "success" : "secondary"}>
          {member.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-gray-600">{member.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-gray-600">{member.phone}</span>
          </div>
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-gray-600">{member.department}</span>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Workload</span>
              <span className="font-medium">{member.workload}%</span>
            </div>
            <Progress value={member.workload} className="h-1.5" />
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Projects</h4>
            <div className="flex flex-wrap gap-1">
              {member.projects.map((project, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {project}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-800/50 flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => onView(member)}>
          <Eye className="h-4 w-4 mr-1" />
          View Profile
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(member)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Member
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 dark:text-red-400"
              onClick={() => onRemove(member)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Remove Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

// Team Member List Item Component
const TeamMemberListItem: React.FC<TeamMemberListItemProps> = ({ member, onView, onRemove }) => {
  return (
    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{member.name}</p>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>{member.role}</TableCell>
      <TableCell>{member.department}</TableCell>
      <TableCell>
        <Badge variant={member.status === 'active' ? "success" : "secondary"}>
          {member.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>{member.projects.length}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Progress value={member.workload} className="w-16 h-1.5" />
          <span className="text-sm">{member.workload}%</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onView(member)}>
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(member)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Member
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400"
                onClick={() => onRemove(member)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Team; 