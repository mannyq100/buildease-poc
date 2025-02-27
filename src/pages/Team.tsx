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
          // theme="blue"
          gradient={true}
          animated={true}
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
              variant: "construction",
              onClick: () => {/* Export functionality */}
            }
          ]}
        />

        {/* Team Statistics */}
        <div className="mt-8 mb-6">
          <Grid cols={4} className="w-full gap-6">
            <Card className="bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>
                  <p className="text-xl font-semibold dark:text-white">{teamMembers.length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-xl font-semibold dark:text-white">{teamMembers.filter(m => m.status === 'active').length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                  <Briefcase className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
                  <p className="text-xl font-semibold dark:text-white">
                    {new Set(teamMembers.map(m => m.department)).size}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                  <Radar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Workload</p>
                  <p className="text-xl font-semibold dark:text-white">
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
        <Card className="mb-6 dark:bg-slate-800 border dark:border-slate-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  variant="modern"
                  icon={<Search className="h-4 w-4 dark:text-gray-500" />}
                />
              </div>
              <div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectItem value="All" className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white">All Departments</SelectItem>
                    <SelectItem value="Management" className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white">Management</SelectItem>
                    <SelectItem value="Engineering" className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white">Engineering</SelectItem>
                    <SelectItem value="Construction" className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white">Construction</SelectItem>
                    <SelectItem value="Design" className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectItem value="All" className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white">All Status</SelectItem>
                    <SelectItem value="Active" className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white">Active</SelectItem>
                    <SelectItem value="Inactive" className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' 
                      ? 'dark:bg-blue-600 dark:hover:bg-blue-700' 
                      : 'dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'}
                  >
                    <GridIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' 
                      ? 'dark:bg-blue-600 dark:hover:bg-blue-700' 
                      : 'dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredMembers.length === 0 ? (
              <Card className="col-span-full p-8 text-center dark:bg-slate-800 border dark:border-slate-700">
                <div className="flex flex-col items-center justify-center">
                  <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-xl font-medium mb-2 dark:text-white">No team members found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or add a new team member</p>
                  <Button 
                    onClick={() => setIsAddMemberOpen(true)}
                    className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                  >
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
          <Card className="mb-8 overflow-hidden dark:bg-slate-800 border dark:border-slate-700">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="dark:bg-slate-800/50">
                  <TableRow className="dark:hover:bg-transparent dark:border-slate-700">
                    <TableHead className="dark:text-gray-400 dark:border-slate-700">Name</TableHead>
                    <TableHead className="dark:text-gray-400 dark:border-slate-700">Role</TableHead>
                    <TableHead className="dark:text-gray-400 dark:border-slate-700">Department</TableHead>
                    <TableHead className="dark:text-gray-400 dark:border-slate-700">Status</TableHead>
                    <TableHead className="dark:text-gray-400 dark:border-slate-700">Projects</TableHead>
                    <TableHead className="dark:text-gray-400 dark:border-slate-700">Workload</TableHead>
                    <TableHead className="text-right dark:text-gray-400 dark:border-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="dark:bg-slate-800">
                  {filteredMembers.length === 0 ? (
                    <TableRow className="dark:hover:bg-transparent dark:border-slate-700">
                      <TableCell colSpan={7} className="text-center py-8 dark:border-slate-700">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                          <h3 className="text-xl font-medium mb-2 dark:text-white">No team members found</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or add a new team member</p>
                          <Button 
                            onClick={() => setIsAddMemberOpen(true)}
                            className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                          >
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
        <DialogContent className="sm:max-w-2xl dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add Team Member</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Add a new member to your construction project team. Fill in all required information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Personal Information Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <User className="h-4 w-4 mr-2 dark:text-blue-400" />
                <span className="dark:text-gray-400">Personal Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile image upload */}
                <div className="space-y-2 md:col-span-2 flex flex-col items-center">
                  <Avatar className="h-24 w-24 border-2 border-muted dark:border-slate-700 dark:bg-slate-800">
                    <AvatarFallback className="text-2xl dark:bg-blue-700 text-white">{newMember.name ? newMember.name.charAt(0) : 'T'}</AvatarFallback>
                  </Avatar>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-600"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center dark:text-gray-300">
                    Full Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    id="name" 
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    placeholder="Enter full name"
                    className="focus:ring-1 focus:ring-deepblue dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="dark:text-gray-300">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="Enter location (city, country)"
                    value={newMember.location || ''}
                    onChange={(e) => setNewMember({...newMember, location: e.target.value})}
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center dark:text-gray-300">
                    Email <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    placeholder="Enter email address"
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="dark:text-gray-300">Phone</Label>
                  <Input 
                    id="phone" 
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Job Information Section */}
            <Separator className="dark:bg-slate-700" />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Briefcase className="h-4 w-4 mr-2 dark:text-amber-400" />
                <span className="dark:text-gray-400">Job Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center dark:text-gray-300">
                    Role <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    id="role" 
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                    placeholder="Enter role (e.g. Project Manager)"
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center dark:text-gray-300">
                    Department <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select 
                    value={newMember.department} 
                    onValueChange={(value) => setNewMember({...newMember, department: value})}
                  >
                    <SelectTrigger id="department" className="dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem value="Management" className="dark:text-gray-300 dark:focus:bg-slate-700">Management</SelectItem>
                      <SelectItem value="Engineering" className="dark:text-gray-300 dark:focus:bg-slate-700">Engineering</SelectItem>
                      <SelectItem value="Construction" className="dark:text-gray-300 dark:focus:bg-slate-700">Construction</SelectItem>
                      <SelectItem value="Design" className="dark:text-gray-300 dark:focus:bg-slate-700">Design</SelectItem>
                      <SelectItem value="Procurement" className="dark:text-gray-300 dark:focus:bg-slate-700">Procurement</SelectItem>
                      <SelectItem value="Quality Control" className="dark:text-gray-300 dark:focus:bg-slate-700">Quality Control</SelectItem>
                      <SelectItem value="Safety" className="dark:text-gray-300 dark:focus:bg-slate-700">Safety</SelectItem>
                      <SelectItem value="Administration" className="dark:text-gray-300 dark:focus:bg-slate-700">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="join-date" className="dark:text-gray-300">Join Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input 
                      id="join-date" 
                      type="date" 
                      className="pl-10 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="availability" className="dark:text-gray-300">Availability</Label>
                  <Select defaultValue="Full-time">
                    <SelectTrigger id="availability" className="dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem value="Full-time" className="dark:text-gray-300 dark:focus:bg-slate-700">Full-time</SelectItem>
                      <SelectItem value="Part-time" className="dark:text-gray-300 dark:focus:bg-slate-700">Part-time</SelectItem>
                      <SelectItem value="Contract" className="dark:text-gray-300 dark:focus:bg-slate-700">Contract</SelectItem>
                      <SelectItem value="Consultant" className="dark:text-gray-300 dark:focus:bg-slate-700">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="projects" className="flex items-center dark:text-gray-300">
                    Assigned Projects <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="villa-project"
                        className="dark:border-slate-600 dark:data-[state=checked]:bg-blue-600 dark:data-[state=checked]:border-blue-600"
                        onCheckedChange={(checked) => {
                          const updatedProjects = checked ? 
                            [...(newMember.projects || []), 'Villa Construction'] :
                            (newMember.projects || []).filter(p => p !== 'Villa Construction');
                          setNewMember({...newMember, projects: updatedProjects});
                        }}
                      />
                      <label htmlFor="villa-project" className="text-sm cursor-pointer dark:text-gray-300">Villa Construction</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="office-project"
                        className="dark:border-slate-600 dark:data-[state=checked]:bg-blue-600 dark:data-[state=checked]:border-blue-600"
                        onCheckedChange={(checked) => {
                          const updatedProjects = checked ? 
                            [...(newMember.projects || []), 'Office Renovation'] :
                            (newMember.projects || []).filter(p => p !== 'Office Renovation');
                          setNewMember({...newMember, projects: updatedProjects});
                        }}
                      />
                      <label htmlFor="office-project" className="text-sm cursor-pointer dark:text-gray-300">Office Renovation</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Skills & Qualifications Section */}
            <Separator className="dark:bg-slate-700" />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Award className="h-4 w-4 mr-2 dark:text-green-400" />
                <span className="dark:text-gray-400">Skills & Qualifications</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skills" className="dark:text-gray-300">Skills (comma separated)</Label>
                  <Input 
                    id="skills" 
                    placeholder="Enter skills (e.g. Project Planning, AutoCAD)"
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    onChange={(e) => {
                      const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
                      setNewMember({...newMember, skills: skillsArray});
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certifications" className="dark:text-gray-300">Certifications (comma separated)</Label>
                  <Input 
                    id="certifications" 
                    placeholder="Enter certifications (e.g. PMP, LEED)"
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    onChange={(e) => {
                      const certsArray = e.target.value.split(',').map(cert => cert.trim()).filter(Boolean);
                      setNewMember({...newMember, certifications: certsArray});
                    }}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="workload" className="dark:text-gray-300">Initial Workload (%)</Label>
                  <div className="flex items-center space-x-4">
                    <Input 
                      id="workload" 
                      type="number" 
                      min="0"
                      max="100"
                      defaultValue="0"
                      className="w-24 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      onChange={(e) => setNewMember({...newMember, workload: parseInt(e.target.value) || 0})}
                    />
                    <Slider 
                      defaultValue={[0]} 
                      max={100} 
                      step={5}
                      className="flex-1 dark:bg-slate-700"
                      onValueChange={(value) => setNewMember({...newMember, workload: value[0]})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted-foreground dark:text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAddMemberOpen(false)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddMember}
                className="dark:bg-blue-600 dark:hover:bg-blue-700"
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
        <DialogContent className="max-w-2xl dark:bg-slate-800 dark:border-slate-700">
          {currentMember && (
            <>
              <DialogHeader>
                <DialogTitle className="dark:text-white">Team Member Profile</DialogTitle>
              </DialogHeader>
              
              <div className="flex flex-col md:flex-row gap-6 py-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24 ring-2 ring-white/10 dark:ring-slate-700/50 shadow-md">
                    <AvatarImage src={currentMember.avatar} alt={currentMember.name} />
                    <AvatarFallback className="text-2xl bg-blue-600 dark:bg-blue-700 text-white">{currentMember.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Badge 
                    variant={currentMember.status === 'active' ? "success" : "secondary"}
                    className={currentMember.status === 'active' 
                      ? 'dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30' 
                      : 'dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/30'}
                  >
                    {currentMember.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">{currentMember.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{currentMember.role}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center group">
                        <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                        {currentMember.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center group">
                        <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                        {currentMember.phone}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center group">
                        <Building className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                        {currentMember.department}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center group">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                        {currentMember.location}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center group">
                        <CalendarDays className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                        Join Date: {new Date(currentMember.joinDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center group">
                        <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                        Availability: {currentMember.availability}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center group">
                        <Award className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                        Certifications: {currentMember.certifications.join(', ') || 'None'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">Projects</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentMember.projects.map((project, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300"
                        >
                          {project}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentMember.skills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="dark:bg-slate-700 dark:text-gray-300"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">Workload</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Current allocation</span>
                        <span className="text-sm font-medium dark:text-white">{currentMember.workload}%</span>
                      </div>
                      <Progress 
                        value={currentMember.workload} 
                        className="h-2 dark:bg-slate-700"
                        style={{
                          background: document.documentElement.classList.contains('dark') ? 'rgba(30, 41, 59, 0.7)' : undefined,
                          '--progress-background': currentMember.workload > 80 
                            ? (document.documentElement.classList.contains('dark') ? '#ef4444' : '#ef4444') 
                            : currentMember.workload > 60 
                              ? (document.documentElement.classList.contains('dark') ? '#f59e0b' : '#f59e0b')
                              : (document.documentElement.classList.contains('dark') ? '#3b82f6' : '#3b82f6')
                        } as React.CSSProperties}
                      />
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
        <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              This action will remove {currentMember?.name} from the team. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 dark:border-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
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
    <Card className="overflow-hidden hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-deepblue-dark/10 transition-all duration-300 border dark:border-slate-700 dark:bg-slate-800/90">
      {/* Header with gradient background in dark mode */}
      <div className={`p-4 border-b dark:border-slate-700 flex justify-between items-center ${
        member.status === 'active' 
          ? 'dark:bg-gradient-to-r dark:from-slate-800 dark:to-deepblue-dark/30'
          : 'dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-700/30'
      }`}>
        <div className="flex items-center space-x-3">
          <Avatar className="ring-2 ring-white/10 dark:ring-slate-700/50">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className={`${
              member.status === 'active'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-gray-400 dark:bg-slate-600 text-white'
            }`}>
              {member.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg dark:text-white">{member.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
          </div>
        </div>
        <Badge variant={member.status === 'active' ? "success" : "secondary"}
          className={member.status === 'active' 
            ? 'dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30' 
            : 'dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/30'}>
          {member.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      
      <CardContent className="pt-4 dark:bg-slate-800">
        <div className="space-y-3">
          <div className="flex items-center text-sm group">
            <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
            <span className="text-gray-600 dark:text-gray-300">{member.email}</span>
          </div>
          <div className="flex items-center text-sm group">
            <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
            <span className="text-gray-600 dark:text-gray-300">{member.phone}</span>
          </div>
          <div className="flex items-center text-sm group">
            <Building className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
            <span className="text-gray-600 dark:text-gray-300">{member.department}</span>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Workload</span>
              <span className="font-medium dark:text-white">{member.workload}%</span>
            </div>
            <Progress 
              value={member.workload} 
              className="h-1.5 dark:bg-slate-700"
              // Different colors based on workload percentage
              style={{
                background: document.documentElement.classList.contains('dark') ? 'rgba(30, 41, 59, 0.7)' : undefined,
                '--progress-background': member.workload > 80 
                  ? (document.documentElement.classList.contains('dark') ? '#ef4444' : '#ef4444') 
                  : member.workload > 60 
                    ? (document.documentElement.classList.contains('dark') ? '#f59e0b' : '#f59e0b')
                    : (document.documentElement.classList.contains('dark') ? '#3b82f6' : '#3b82f6')
              } as React.CSSProperties}
            />
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 dark:text-gray-300">Projects</h4>
            <div className="flex flex-wrap gap-1">
              {member.projects.map((project, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs dark:border-slate-600 dark:text-gray-300 dark:bg-slate-700/30 hover:dark:bg-slate-700/60 transition-colors"
                >
                  {project}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <div className="p-4 border-t bg-gray-50 dark:bg-slate-800/90 dark:border-slate-700 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onView(member)}
          className="dark:text-gray-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Profile
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="dark:text-gray-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
            <DropdownMenuItem 
              onClick={() => onView(member)}
              className="dark:hover:bg-slate-700 dark:focus:bg-slate-700 dark:text-gray-300"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="dark:hover:bg-slate-700 dark:focus:bg-slate-700 dark:text-gray-300">
              <Edit className="h-4 w-4 mr-2" />
              Edit Member
            </DropdownMenuItem>
            <DropdownMenuSeparator className="dark:bg-slate-700" />
            <DropdownMenuItem 
              className="text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20"
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
    <TableRow className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
      <TableCell className="dark:border-slate-700 dark:text-white">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 ring-2 ring-white/10 dark:ring-slate-700/50">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className={`${
              member.status === 'active'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-gray-400 dark:bg-slate-600 text-white'
            }`}>
              {member.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium dark:text-white">{member.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="dark:border-slate-700 dark:text-gray-300">{member.role}</TableCell>
      <TableCell className="dark:border-slate-700 dark:text-gray-300">{member.department}</TableCell>
      <TableCell className="dark:border-slate-700">
        <Badge variant={member.status === 'active' ? "success" : "secondary"}
          className={member.status === 'active' 
            ? 'dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30' 
            : 'dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/30'}>
          {member.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="dark:border-slate-700 dark:text-gray-300">{member.projects.length}</TableCell>
      <TableCell className="dark:border-slate-700 dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <Progress 
            value={member.workload} 
            className="w-16 h-1.5 dark:bg-slate-700" 
            style={{
              background: document.documentElement.classList.contains('dark') ? 'rgba(30, 41, 59, 0.7)' : undefined,
              '--progress-background': member.workload > 80 
                ? (document.documentElement.classList.contains('dark') ? '#ef4444' : '#ef4444') 
                : member.workload > 60 
                  ? (document.documentElement.classList.contains('dark') ? '#f59e0b' : '#f59e0b')
                  : (document.documentElement.classList.contains('dark') ? '#3b82f6' : '#3b82f6')
            } as React.CSSProperties}
          />
          <span className="text-sm dark:text-gray-300">{member.workload}%</span>
        </div>
      </TableCell>
      <TableCell className="text-right dark:border-slate-700">
        <div className="flex justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onView(member)}
            className="dark:text-gray-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="dark:text-gray-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
              <DropdownMenuItem 
                onClick={() => onView(member)}
                className="dark:hover:bg-slate-700 dark:focus:bg-slate-700 dark:text-gray-300"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="dark:hover:bg-slate-700 dark:focus:bg-slate-700 dark:text-gray-300">
                <Edit className="h-4 w-4 mr-2" />
                Edit Member
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:bg-slate-700" />
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20"
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