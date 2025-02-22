import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Home,
  Bell,
  Plus,
  Package,
  TrendingUp,
  ChevronRight,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  FileText,
  Settings,
  ArrowRight,
  ImageIcon,
  AlertCircle
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';

const BuildEaseHomeMockup = () => {
  const navigate = useNavigate();

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Material</span>
            </Button>
            <Button className="space-x-2" onClick={()=> navigate("create-project")}>
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Button>
          </div>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Active Projects</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">2</span>
                  <span className="text-sm text-gray-600 ml-2">In Progress</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Total Budget</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">$165,000</span>
                  <span className="text-sm text-gray-600 ml-2">Allocated</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Team Members</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">8</span>
                  <span className="text-sm text-gray-600 ml-2">Active</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProjectCard 
                name="Villa Construction"
                phase="Foundation"
                progress={65}
                budget="$120,000"
                endDate="Aug 2024"
                navigate={navigate}
              />
              <ProjectCard 
                name="Office Renovation"
                phase="Planning"
                progress={30}
                budget="$45,000"
                endDate="Oct 2024"
                navigate={navigate}
              />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityItem 
                icon={<Package className="w-5 h-5" />}
                title="Material Delivered"
                description="20 bags of cement delivered"
                time="2 hours ago"
                project="Villa Construction"
              />
              <ActivityItem 
                icon={<FileText className="w-5 h-5" />}
                title="Progress Photo Added"
                description="Foundation work progress"
                time="5 hours ago"
                project="Villa Construction"
              />
              <ActivityItem 
                icon={<FileText className="w-5 h-5" />}
                title="Document Updated"
                description="Updated construction timeline"
                time="Yesterday"
                project="Office Renovation"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input className="pl-10" placeholder="Search projects..." />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProjectDetailCard 
              name="Villa Construction"
              type="Residential"
              phase="Foundation"
              progress={65}
              budget="$120,000"
              spent="$52,450"
              team={8}
              startDate="Jan 15, 2024"
              endDate="Aug 2024"
              navigate={navigate}
            />
            <ProjectDetailCard 
              name="Office Renovation"
              type="Commercial"
              phase="Planning"
              progress={30}
              budget="$45,000"
              spent="$12,500"
              team={5}
              startDate="Feb 1, 2024"
              endDate="Oct 2024"
              navigate={navigate}
            />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

const ProjectCard = ({ name, phase, progress, budget, endDate, navigate }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
    <div className="space-y-2">
      <h3 className="font-medium">{name}</h3>
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>Phase: {phase}</span>
        <span>{budget}</span>
      </div>
      <div className="w-48">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <div className="text-sm text-gray-600">End Date</div>
        <div className="font-medium">{endDate}</div>
      </div>
      <Button variant="ghost" size="icon" onClick={()=>navigate("/project-details")}>
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  </div>
);

const ProjectDetailCard = ({ 
  name, 
  type, 
  phase, 
  progress, 
  budget, 
  spent, 
  team, 
  startDate, 
  endDate,
  navigate
}) => (

  <Card>
    <CardContent className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{name}</h3>
          <p className="text-sm text-gray-600">{type}</p>
        </div>
        <Badge className="bg-blue-100 text-blue-600">In Progress</Badge>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div 
          className="cursor-pointer hover:bg-gray-50 p-2 rounded"
          onClick={() => navigate("/phase-details")}
        >
          <p className="text-gray-600">Phase</p>
          <p className="font-medium">{phase}</p>
        </div>
        <div>
          <p className="text-gray-600">Team</p>
          <p className="font-medium">{team} members</p>
        </div>
        <div>
          <p className="text-gray-600">Budget</p>
          <p className="font-medium">{budget}</p>
        </div>
        <div>
          <p className="text-gray-600">Spent</p>
          <p className="font-medium">{spent}</p>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <div className="text-sm">
          <p className="text-gray-600">Start Date</p>
          <p className="font-medium">{startDate}</p>
        </div>
        <div className="text-sm text-right">
          <p className="text-gray-600">End Date</p>
          <p className="font-medium">{endDate}</p>
        </div>
      </div>

      <Button className="w-full" onClick={()=>navigate("/project-details")}>View Details</Button>
    </CardContent>
  </Card>
);

const ActivityItem = ({ icon, title, description, time, project }) => (
  <div className="flex items-start space-x-3">
    <div className="p-2 bg-gray-100 rounded-lg">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between">
        <h4 className="font-medium">{title}</h4>
        <span className="text-sm text-gray-600">{time}</span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-sm text-blue-600 mt-1">{project}</p>
    </div>
  </div>
);

export default BuildEaseHomeMockup;