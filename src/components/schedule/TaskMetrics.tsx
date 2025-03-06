import { Task, TaskMetrics as TaskMetricsType } from '@/types/schedule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  BarChart2 
} from 'lucide-react';

interface TaskMetricsProps {
  tasks: Task[];
}

export const TaskMetrics = ({ tasks }: TaskMetricsProps) => {
  // Calculate metrics
  const metrics: TaskMetricsType = calculateMetrics(tasks);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="Completed" 
        value={metrics.completed} 
        total={metrics.total}
        icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        color="bg-green-100"
      />
      
      <MetricCard 
        title="In Progress" 
        value={metrics.inProgress} 
        total={metrics.total}
        icon={<Clock className="h-5 w-5 text-blue-500" />}
        color="bg-blue-100"
      />
      
      <MetricCard 
        title="Delayed" 
        value={metrics.delayed} 
        total={metrics.total}
        icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
        color="bg-amber-100"
      />
      
      <MetricCard 
        title="Blocked" 
        value={metrics.blocked} 
        total={metrics.total}
        icon={<XCircle className="h-5 w-5 text-red-500" />}
        color="bg-red-100"
      />
      
      <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <BarChart2 className="h-5 w-5 mr-2" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Completion</span>
                <span>{metrics.overallCompletion}%</span>
              </div>
              <Progress value={metrics.overallCompletion} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>High Priority Tasks</span>
                  <span>{metrics.highPriorityCompletion}%</span>
                </div>
                <Progress value={metrics.highPriorityCompletion} className="h-2 bg-red-100" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Medium Priority Tasks</span>
                  <span>{metrics.mediumPriorityCompletion}%</span>
                </div>
                <Progress value={metrics.mediumPriorityCompletion} className="h-2 bg-amber-100" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  color: string;
}

const MetricCard = ({ title, value, total, icon, color }: MetricCardProps) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="flex items-baseline mt-1">
              <p className="text-2xl font-semibold">{value}</p>
              <p className="ml-1 text-sm text-gray-500">of {total}</p>
            </div>
          </div>
          
          <div className={`p-2 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-1" />
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to calculate metrics
const calculateMetrics = (tasks: Task[]): TaskMetricsType => {
  const total = tasks.length;
  
  // Count by status
  const completed = tasks.filter(task => task.status === 'Completed').length;
  const inProgress = tasks.filter(task => task.status === 'In Progress').length;
  const delayed = tasks.filter(task => task.status === 'Delayed').length;
  const blocked = tasks.filter(task => task.status === 'Blocked').length;
  const notStarted = tasks.filter(task => task.status === 'Not Started').length;
  
  // Calculate overall completion
  const overallCompletion = total > 0
    ? Math.round(tasks.reduce((sum, task) => sum + task.completion, 0) / total)
    : 0;
  
  // Calculate completion by priority
  const highPriorityTasks = tasks.filter(task => task.priority === 'High');
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'Medium');
  const lowPriorityTasks = tasks.filter(task => task.priority === 'Low');
  
  const highPriorityCompletion = highPriorityTasks.length > 0
    ? Math.round(highPriorityTasks.reduce((sum, task) => sum + task.completion, 0) / highPriorityTasks.length)
    : 0;
    
  const mediumPriorityCompletion = mediumPriorityTasks.length > 0
    ? Math.round(mediumPriorityTasks.reduce((sum, task) => sum + task.completion, 0) / mediumPriorityTasks.length)
    : 0;
    
  const lowPriorityCompletion = lowPriorityTasks.length > 0
    ? Math.round(lowPriorityTasks.reduce((sum, task) => sum + task.completion, 0) / lowPriorityTasks.length)
    : 0;
  
  return {
    total,
    completed,
    inProgress,
    delayed,
    blocked,
    notStarted,
    overallCompletion,
    highPriorityCompletion,
    mediumPriorityCompletion,
    lowPriorityCompletion
  };
}; 