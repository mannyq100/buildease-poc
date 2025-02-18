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
  Package,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  ChevronRight,
  Plus,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PhaseDetailsMockup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Villa Construction</span>
            <ArrowRight className="w-4 h-4" />
            <span>Foundation Phase</span>
          </div>
          <div className="flex justify-between items-start mt-2">
            <div>
              <h1 className="text-xl font-bold">Foundation Phase</h1>
              <p className="text-sm text-gray-600 mt-1">Feb 2 - Mar 15, 2024</p>
            </div>
            <Badge className="bg-blue-100 text-blue-600">In Progress</Badge>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Phase Progress</span>
              <span>65% Complete</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4">
              {/* Phase Stats */}
              <div className="grid grid-cols-3 gap-4">
                <MetricCard 
                  icon={<Calendar className="w-5 h-5 text-blue-600" />}
                  label="Duration"
                  value="6 Weeks"
                  subtext="2 weeks remaining"
                />
                <MetricCard 
                  icon={<Users className="w-5 h-5 text-green-600" />}
                  label="Team Size"
                  value="8 Members"
                  subtext="All assigned"
                />
                <MetricCard 
                  icon={<DollarSign className="w-5 h-5 text-purple-600" />}
                  label="Budget"
                  value="$45,000"
                  subtext="$32,450 spent"
                />
              </div>

              {/* Tasks Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Tasks Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">12</div>
                      <div className="text-sm text-green-700">Completed</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">5</div>
                      <div className="text-sm text-blue-700">In Progress</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-600">3</div>
                      <div className="text-sm text-yellow-700">Pending</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-600">1</div>
                      <div className="text-sm text-red-700">Delayed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Critical Path */}
              <Card>
                <CardHeader>
                  <CardTitle>Critical Path Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CriticalItem 
                    title="Complete soil testing"
                    deadline="Feb 15"
                    status="completed"
                  />
                  <CriticalItem 
                    title="Foundation reinforcement"
                    deadline="Feb 28"
                    status="in-progress"
                  />
                  <CriticalItem 
                    title="Concrete pouring"
                    deadline="Mar 5"
                    status="pending"
                  />
                </CardContent>
              </Card>

              {/* Phase Dependencies */}
              <Card>
                <CardHeader>
                  <CardTitle>Dependencies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DependencyItem 
                    title="Site Preparation"
                    status="completed"
                    type="Previous Phase"
                  />
                  <DependencyItem 
                    title="Material Delivery"
                    status="in-progress"
                    type="External"
                  />
                  <DependencyItem 
                    title="Quality Inspection"
                    status="pending"
                    type="Milestone"
                  />
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">AI Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InsightItem 
                    title="Schedule Risk"
                    description="Consider adding resources to foundation reinforcement to maintain timeline"
                  />
                  <InsightItem 
                    title="Budget Tracking"
                    description="Material costs are 15% below estimates - potential for reallocation"
                  />
                  <InsightItem 
                    title="Quality Control"
                    description="Schedule concrete strength testing before proceeding to next phase"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Phase Tasks</CardTitle>
                  <Button onClick={()=>navigate("/generate-tasks")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <TaskItem 
                  title="Site clearing and excavation"
                  status="completed"
                  progress={100}
                  assignees={4}
                  deadline="Feb 10, 2024"
                />
                <TaskItem 
                  title="Foundation reinforcement installation"
                  status="in-progress"
                  progress={65}
                  assignees={6}
                  deadline="Feb 28, 2024"
                />
                <TaskItem 
                  title="Concrete pouring and curing"
                  status="pending"
                  progress={0}
                  assignees={8}
                  deadline="Mar 5, 2024"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Materials</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Material
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <MaterialItem 
                  name="Cement"
                  quantity="200 bags"
                  used="150 bags"
                  status="sufficient"
                />
                <MaterialItem 
                  name="Steel Reinforcement"
                  quantity="5000 kg"
                  used="3500 kg"
                  status="low"
                />
                <MaterialItem 
                  name="Concrete Mix"
                  quantity="100 m³"
                  used="0 m³"
                  status="pending"
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

const CriticalItem = ({ title, deadline, status }) => (
  <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
    <div className="flex items-center space-x-3">
      <CheckCircle2 className={`w-5 h-5 ${
        status === 'completed' ? 'text-green-600' : 
        status === 'in-progress' ? 'text-blue-600' : 
        'text-gray-400'
      }`} />
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-600">Due: {deadline}</p>
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
);

const DependencyItem = ({ title, status, type }) => (
  <div className="flex items-center justify-between p-3 border rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Package className="w-4 h-4" />
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-600">{type}</p>
      </div>
    </div>
    <Badge className={
      status === 'completed' ? 'bg-green-100 text-green-600' :
      status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
      'bg-yellow-100 text-yellow-600'
    }>
      {status}
    </Badge>
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

const TaskItem = ({ title, status, progress, assignees, deadline }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-medium">{title}</h4>
        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{assignees} members</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{deadline}</span>
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
    <div className="mt-3">
      <div className="flex justify-between text-sm mb-1">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  </div>
);

const MaterialItem = ({ name, quantity, used, status }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg">
    <div>
      <h4 className="font-medium">{name}</h4>
      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
        <span>Total: {quantity}</span>
        <span>Used: {used}</span>
      </div>
    </div>
    <Badge className={
      status === 'sufficient' ? 'bg-green-100 text-green-600' :
      status === 'low' ? 'bg-yellow-100 text-yellow-600' :
      'bg-blue-100 text-blue-600'
    }>
      {status}
    </Badge>
  </div>
);

export default PhaseDetailsMockup;