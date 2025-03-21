/**
 * PhaseDetailsPanel.tsx - Component to display detailed information about a phase
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

// Icons
import {
  Calendar,
  CheckSquare,
  Clock,
  DollarSign,
  FileText,
  X,
  AlertTriangle,
  Users,
  Package,
  Truck
} from 'lucide-react';

// Custom Hooks
import { usePhaseDetails } from '@/hooks/usePhaseDetails';

// Types
import { Task } from '@/types/task';
import { Material } from '@/types/phase';

interface PhaseDetailsPanelProps {
  phaseId: number;
  onClose: () => void;
}

/**
 * Component that displays detailed information about a phase
 */
export function PhaseDetailsPanel({ phaseId, onClose }: PhaseDetailsPanelProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const { phase, isLoading, error } = usePhaseDetails(phaseId);

  // Handle back button click
  const handleBack = () => {
    onClose();
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <CardContent className="pt-6 flex flex-col items-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading phase details...</p>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error || !phase) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Error</CardTitle>
            <CardDescription>Unable to load phase details</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-2" />
            <p className="text-center text-muted-foreground">
              {error || 'Phase not found'}
            </p>
            <Button className="mt-4" onClick={handleBack}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'upcoming':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'warning':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Sample tasks for this phase (would be fetched in a real application)
  const tasks: Task[] = [
    {
      id: 1,
      name: 'Obtain building permits',
      description: 'Apply for and receive all necessary building permits from local authorities',
      dueDate: '2023-03-15',
      assignee: 'John Smith',
      status: 'completed',
      phaseId: phase.id,
      priority: 'high'
    },
    {
      id: 2,
      name: 'Schedule initial inspections',
      description: 'Coordinate with city inspectors for initial site inspection',
      dueDate: '2023-03-20',
      assignee: 'Sarah Johnson',
      status: 'completed',
      phaseId: phase.id,
      priority: 'medium'
    },
    {
      id: 3,
      name: 'Hire subcontractors',
      description: 'Select and onboard key subcontractors for specialized work',
      dueDate: '2023-03-25',
      assignee: 'Mike Peterson',
      status: 'in-progress',
      phaseId: phase.id,
      priority: 'high'
    },
    {
      id: 4,
      name: 'Order materials',
      description: 'Place orders for all required building materials',
      dueDate: '2023-04-01',
      assignee: 'David Wilson',
      status: 'pending',
      phaseId: phase.id,
      priority: 'medium'
    }
  ];

  // Sample materials for this phase
  const materials: Material[] = [
    {
      id: 1,
      name: 'Concrete Mix',
      quantity: 50,
      unit: 'bags',
      status: 'delivered',
      expectedDelivery: '2023-03-12',
      phaseId: phase.id,
    },
    {
      id: 2,
      name: 'Steel Reinforcement Bars',
      quantity: 200,
      unit: 'pcs',
      status: 'delivered',
      expectedDelivery: '2023-03-15',
      phaseId: phase.id,
    },
    {
      id: 3,
      name: 'Lumber - 2x4',
      quantity: 300,
      unit: 'ft',
      status: 'ordered',
      expectedDelivery: '2023-03-25',
      phaseId: phase.id,
    },
    {
      id: 4,
      name: 'Insulation Materials',
      quantity: 20,
      unit: 'rolls',
      status: 'pending',
      expectedDelivery: '2023-04-05',
      phaseId: phase.id,
    }
  ];

  // Sample documents for this phase
  const documents = [
    {
      id: 1,
      name: 'Building Permits.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadedBy: 'John Smith',
      uploadDate: '2023-03-10'
    },
    {
      id: 2,
      name: 'Site Survey.pdf',
      type: 'PDF',
      size: '5.1 MB',
      uploadedBy: 'Sarah Johnson',
      uploadDate: '2023-03-05'
    },
    {
      id: 3,
      name: 'Subcontractor Agreements.docx',
      type: 'DOCX',
      size: '1.2 MB',
      uploadedBy: 'Mike Peterson',
      uploadDate: '2023-03-22'
    },
    {
      id: 4,
      name: 'Materials Order.xlsx',
      type: 'XLSX',
      size: '890 KB',
      uploadedBy: 'David Wilson',
      uploadDate: '2023-03-30'
    }
  ];

  // Calculate completion percentage
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskCompletionPercentage = tasks.length > 0 ? 
    Math.round((completedTasks / tasks.length) * 100) : 0;
    
  // Calculate materials status
  const deliveredMaterials = materials.filter(m => m.status === 'delivered').length;
  const materialsDeliveredPercentage = materials.length > 0 ?
    Math.round((deliveredMaterials / materials.length) * 100) : 0;

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <div className="flex items-center space-x-2">
            <CardTitle>{phase.name}</CardTitle>
            <Badge className={getStatusColor(phase.status)}>
              {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
            </Badge>
          </div>
          <CardDescription className="mt-1">
            {phase.startDate} - {phase.endDate}
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Phase Tasks</h3>
                <Button size="sm">
                  <CheckSquare className="h-4 w-4 mr-2" /> Add Task
                </Button>
              </div>
              
              <div className="space-y-3">
                {tasks.map(task => (
                  <Card key={task.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{task.name}</h4>
                            <Badge className={task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-amber-100 text-amber-800'}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="ml-2">
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>Due: {task.dueDate}</span>
                          </div>
                          {task.assignee && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{task.assignee}</span>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Materials Tab */}
          <TabsContent value="materials">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Phase Materials</h3>
                <Button size="sm">
                  <Package className="h-4 w-4 mr-2" /> Add Material
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Expected Delivery</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {materials.map(material => (
                      <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{material.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{material.quantity}</td>
                        <td className="px-4 py-3 text-sm">{material.unit}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className={
                            material.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            material.status === 'ordered' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }>
                            {material.status.charAt(0).toUpperCase() + material.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{material.expectedDelivery || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          <Button variant="ghost" size="sm">Update</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium">Material Status Summary</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mr-1">Delivered</Badge>
                      <span className="text-sm">{materials.filter(m => m.status === 'delivered').length}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mr-1">Ordered</Badge>
                      <span className="text-sm">{materials.filter(m => m.status === 'ordered').length}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 mr-1">Pending</Badge>
                      <span className="text-sm">{materials.filter(m => m.status === 'pending').length}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Truck className="h-4 w-4 mr-2" /> View All Deliveries
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Phase Documents</h3>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" /> Upload Document
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Uploaded By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {documents.map(doc => (
                      <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{doc.type}</td>
                        <td className="px-4 py-3 text-sm">{doc.size}</td>
                        <td className="px-4 py-3 text-sm">{doc.uploadedBy}</td>
                        <td className="px-4 py-3 text-sm">{doc.uploadDate}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          <Button variant="ghost" size="sm">Download</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
