import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Users,
  DollarSign,
  Building,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  FileText,
  Package,
  Home,
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectDetailsMockup = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold">Villa Construction</h1>
              <p className="text-sm text-gray-600 mt-1">Started: Jan 15, 2024</p>
            </div>
            <Badge className="bg-blue-100 text-blue-600">In Progress</Badge>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Progress</span>
              <span>65% Complete</span>
            </div>
            <Progress value={65} className="h-2" />
            <div className="flex justify-between mt-1 text-sm text-gray-600">
              <span>Est. completion: Aug 2024</span>
              <span>$52,450 / $120,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="phases">Phases</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Phase
            </Button>
          </div>

          <TabsContent value="overview">
            <div className="grid gap-6">
              {/* Project Stats */}
              <div className="grid grid-cols-4 gap-4">
                <MetricCard 
                  icon={<Clock className="w-5 h-5 text-blue-600" />}
                  label="Timeline"
                  value="7 months"
                  subtext="On schedule"
                />
                <MetricCard 
                  icon={<DollarSign className="w-5 h-5 text-green-600" />}
                  label="Budget"
                  value="$120,000"
                  subtext="43.7% utilized"
                />
                <MetricCard 
                  icon={<Users className="w-5 h-5 text-purple-600" />}
                  label="Team"
                  value="8 members"
                  subtext="2 contractors"
                />
                <MetricCard 
                  icon={<Building className="w-5 h-5 text-orange-600" />}
                  label="Size"
                  value="350 sq.m"
                  subtext="2 floors"
                />
              </div>

              {/* Active Phases */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Phases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PhaseCard 
                    name="Foundation"
                    progress={65}
                    startDate="Feb 2, 2024"
                    endDate="Mar 15, 2024"
                    status="in-progress"
                  />
                  <PhaseCard 
                    name="Structural Work"
                    progress={0}
                    startDate="Mar 16, 2024"
                    endDate="May 30, 2024"
                    status="upcoming"
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
                    icon={<Package />}
                    title="Material Delivered"
                    description="20 bags of cement delivered"
                    time="2 hours ago"
                  />
                  <ActivityItem 
                    icon={<FileText />}
                    title="Document Updated"
                    description="Updated construction timeline"
                    time="Yesterday"
                  />
                  <ActivityItem 
                    icon={<Users />}
                    title="Team Updated"
                    description="Added 2 new team members"
                    time="2 days ago"
                  />
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">Project Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InsightItem 
                    title="Schedule Optimization"
                    description="Consider overlapping foundation curing with initial structural preparations"
                  />
                  <InsightItem 
                    title="Resource Management"
                    description="Team utilization peak expected in next phase - consider early onboarding"
                  />
                  <InsightItem 
                    title="Risk Alert"
                    description="Weather forecast shows heavy rain next week - plan concrete work accordingly"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="phases">
            <Card>
              <CardContent className="space-y-4 p-6">
                <DetailedPhaseCard 
                  name="Planning & Design"
                  duration="3 weeks"
                  startDate="Jan 15, 2024"
                  endDate="Feb 1, 2024"
                  progress={100}
                  budget="$15,000"
                  spent="$12,450"
                  status="completed"
                />
                <DetailedPhaseCard 
                  name="Foundation"
                  duration="6 weeks"
                  startDate="Feb 2, 2024"
                  endDate="Mar 15, 2024"
                  progress={65}
                  budget="$45,000"
                  spent="$32,450"
                  status="in-progress"
                />
                <DetailedPhaseCard 
                  name="Structural Work"
                  duration="10 weeks"
                  startDate="Mar 16, 2024"
                  endDate="May 30, 2024"
                  progress={0}
                  budget="$85,000"
                  spent="$0"
                  status="upcoming"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, subtext }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center space-x-2">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-600">{subtext}</div>
      </div>
    </CardContent>
  </Card>
);

const PhaseCard = ({ name, progress, startDate, endDate, status }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg">
    <div className="space-y-2 flex-1">
      <div className="flex justify-between">
        <h3 className="font-medium">{name}</h3>
        <Badge className={
          status === 'completed' ? 'bg-green-100 text-green-600' :
          status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
          'bg-gray-100 text-gray-600'
        }>
          {status}
        </Badge>
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>{startDate} - {endDate}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  </div>
);

const DetailedPhaseCard = ({ name, duration, startDate, endDate, progress, budget, spent, status }) => {
  const navigate = useNavigate();
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{name}</h3>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{startDate} - {endDate}</span>
            </div>
          </div>
        </div>
        <Badge className={
          status === 'completed' ? 'bg-green-100 text-green-600' :
          status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
          'bg-gray-100 text-gray-600'
        }>
          {status}
        </Badge>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Budget: {budget}</span>
          <span className="text-gray-600">Spent: {spent}</span>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" className="text-blue-600" onClick={()=>navigate("/phase-details")}>
          View Details
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const ActivityItem = ({ icon, title, description, time }) => (
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
    </div>
  </div>
);

const InsightItem = ({ title, description }) => (
  <div className="flex items-start space-x-3">
    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
    <div>
      <h4 className="font-medium text-blue-900">{title}</h4>
      <p className="text-sm text-blue-800 mt-1">{description}</p>
    </div>
  </div>
);

export default ProjectDetailsMockup;