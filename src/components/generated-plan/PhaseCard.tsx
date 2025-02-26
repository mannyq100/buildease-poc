import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  DollarSign, 
  Users, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  ListTodo, 
  Edit2, 
  Save, 
  XCircle, 
  User, 
  Calendar, 
  Plus,
  CheckSquare,
  Shield,
  Clock3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface TaskItem {
  id: string;
  name: string;
  duration: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
}

interface MaterialItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  status: 'not-ordered' | 'ordered' | 'delivered';
}

interface PhaseCardProps {
  name: string;
  duration: string;
  budget: string;
  team: number;
  tasks: number;
  status: 'optimized' | 'warning';
  warning?: string;
  taskItems?: TaskItem[];
  materialItems?: MaterialItem[];
}

// Sample team members data (in a real app, this would come from props or context)
const teamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Kofi Mensah', role: 'Project Manager', avatar: '/avatars/kofi.png' },
  { id: 'tm2', name: 'Ama Serwaa', role: 'Architect', avatar: '/avatars/ama.png' },
  { id: 'tm3', name: 'Kwame Osei', role: 'Civil Engineer', avatar: '/avatars/kwame.png' },
  { id: 'tm4', name: 'Abena Poku', role: 'Quantity Surveyor', avatar: '/avatars/abena.png' },
  { id: 'tm5', name: 'Yaw Mensah', role: 'Foreman', avatar: '/avatars/yaw.png' },
  { id: 'tm6', name: 'Akua Manu', role: 'Procurement Officer', avatar: '/avatars/akua.png' },
  { id: 'tm7', name: 'Kwesi Boateng', role: 'Electrician', avatar: '/avatars/kwesi.png' },
  { id: 'tm8', name: 'Gifty Owusu', role: 'Plumber', avatar: '/avatars/gifty.png' }
];

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const PhaseCard: React.FC<PhaseCardProps> = ({ 
  name, 
  duration, 
  budget, 
  team, 
  tasks, 
  status, 
  warning,
  taskItems = [],
  materialItems = []
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'materials'>('tasks');
  const [isEditingPhase, setIsEditingPhase] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [phaseName, setPhaseName] = useState(name);
  const [phaseDuration, setPhaseDuration] = useState(duration);

  // State for tasks and materials
  const [phaseTaskItems, setPhaseTaskItems] = useState<TaskItem[]>(taskItems);
  const [phaseMaterialItems, setPhaseMaterialItems] = useState<MaterialItem[]>(materialItems);

  const handleEditTask = (id: string) => {
    setEditingTaskId(id);
  };

  const handleUpdateTask = (taskId: string, updatedTask: Partial<TaskItem>) => {
    setPhaseTaskItems(tasks => tasks.map(task => 
      task.id === taskId ? { ...task, ...updatedTask } : task
    ));
    setEditingTaskId(null);
  };

  const handleAssignTeamMember = (taskId: string, memberId: string) => {
    setPhaseTaskItems(tasks => tasks.map(task => 
      task.id === taskId ? { ...task, assignedTo: memberId } : task
    ));
  };

  // Get team member by ID
  const getTeamMember = (id?: string) => {
    if (!id) return null;
    return teamMembers.find(member => member.id === id);
  };

  const statusStyles = {
    optimized: {
      bg: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
      text: isDarkMode ? 'text-green-400' : 'text-green-600',
      border: isDarkMode ? 'border-green-800/30' : 'border-green-100',
      icon: <Shield className="w-4 h-4 mr-1.5" />
    },
    warning: {
      bg: isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50',
      text: isDarkMode ? 'text-amber-400' : 'text-amber-600',
      border: isDarkMode ? 'border-amber-800/30' : 'border-amber-100',
      icon: <AlertCircle className="w-4 h-4 mr-1.5" />
    }
  };

  const taskStatusBadgeStyles = {
    'pending': {
      bg: isDarkMode ? 'bg-slate-700' : 'bg-slate-100',
      text: isDarkMode ? 'text-slate-300' : 'text-slate-600',
    },
    'in-progress': {
      bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100',
      text: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    },
    'completed': {
      bg: isDarkMode ? 'bg-green-900/30' : 'bg-green-100',
      text: isDarkMode ? 'text-green-400' : 'text-green-600',
    }
  };

  const materialStatusBadgeStyles = {
    'not-ordered': {
      bg: isDarkMode ? 'bg-slate-700' : 'bg-slate-100',
      text: isDarkMode ? 'text-slate-300' : 'text-slate-600',
    },
    'ordered': {
      bg: isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100',
      text: isDarkMode ? 'text-amber-400' : 'text-amber-600',
    },
    'delivered': {
      bg: isDarkMode ? 'bg-green-900/30' : 'bg-green-100',
      text: isDarkMode ? 'text-green-400' : 'text-green-600',
    }
  };

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.3, type: "spring" } }}
      className={`rounded-lg overflow-hidden transition-all duration-300 border ${
        isDarkMode 
          ? isEditingPhase 
            ? "bg-slate-800/90 border-blue-800/50" 
            : "bg-slate-800/50 border-slate-700 hover:border-slate-600" 
          : isEditingPhase 
            ? "bg-blue-50/50 border-blue-200" 
            : "bg-white border-gray-200 hover:border-gray-300"
      } ${isExpanded ? "shadow-md" : "shadow-sm hover:shadow"}`}
    >
      {/* Phase Header - Enhanced with better spacing and visual details */}
      <div className="overflow-hidden">
        <motion.div 
          layout="position"
          className={`relative p-5 ${isExpanded && !isDarkMode ? "bg-gray-50/80" : ""}`}
        >
          {/* Background decorative elements */}
          {status === "optimized" && (
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-full blur-3xl -z-10"></div>
          )}
          {status === "warning" && (
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/5 to-red-500/5 rounded-full blur-3xl -z-10"></div>
          )}
          
          <div className="flex justify-between">
            <div className="flex-1">
              {isEditingPhase ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="mb-2"
                >
                  <Input
                    value={phaseName}
                    onChange={(e) => setPhaseName(e.target.value)}
                    className={`text-lg font-medium ${
                      isDarkMode 
                        ? "bg-slate-900 border-slate-700 text-white" 
                        : "bg-white"
                    }`}
                    placeholder="Phase name"
                  />
                </motion.div>
              ) : (
                <motion.h3 
                  layout="position"
                  className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {name}
                </motion.h3>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mt-3">
                {/* Duration */}
                <div className="flex items-center">
                  {isEditingPhase ? (
                    <Input
                      value={phaseDuration}
                      onChange={(e) => setPhaseDuration(e.target.value)}
                      className={`w-24 h-8 text-sm ${
                        isDarkMode 
                          ? "bg-slate-900 border-slate-700 text-white" 
                          : "bg-white"
                      }`}
                      placeholder="Duration"
                    />
                  ) : (
                    <motion.div 
                      layout="position"
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className={`p-1.5 rounded-full mr-1.5 ${
                        isDarkMode 
                          ? "bg-blue-900/30 text-blue-400" 
                          : "bg-blue-50 text-blue-500"
                      }`}>
                        <Clock3 className="w-3.5 h-3.5" />
                      </div>
                      <span className={isDarkMode ? "text-slate-300" : "text-gray-700"}>
                        {duration}
                      </span>
                    </motion.div>
                  )}
                </div>
                
                {/* Budget */}
                <motion.div 
                  layout="position"
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className={`p-1.5 rounded-full mr-1.5 ${
                    isDarkMode 
                      ? "bg-green-900/30 text-green-400" 
                      : "bg-green-50 text-green-500"
                  }`}>
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <span className={isDarkMode ? "text-slate-300" : "text-gray-700"}>
                    {budget}
                  </span>
                </motion.div>
                
                {/* Team */}
                <motion.div 
                  layout="position"
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className={`p-1.5 rounded-full mr-1.5 ${
                    isDarkMode 
                      ? "bg-purple-900/30 text-purple-400" 
                      : "bg-purple-50 text-purple-500"
                  }`}>
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className={isDarkMode ? "text-slate-300" : "text-gray-700"}>
                    {team} {team === 1 ? 'person' : 'people'}
                  </span>
                </motion.div>
                
                {/* Tasks */}
                <motion.div 
                  layout="position"
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className={`p-1.5 rounded-full mr-1.5 ${
                    isDarkMode 
                      ? "bg-amber-900/30 text-amber-400" 
                      : "bg-amber-50 text-amber-500"
                  }`}>
                    <ListTodo className="w-3.5 h-3.5" />
                  </div>
                  <span className={isDarkMode ? "text-slate-300" : "text-gray-700"}>
                    {tasks} {tasks === 1 ? 'task' : 'tasks'}
                  </span>
                </motion.div>
                
                {/* Status Badge */}
                <motion.div 
                  layout="position"
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="ml-auto"
                >
                  <Badge 
                    className={`${statusStyles[status].bg} ${statusStyles[status].text} ${statusStyles[status].border} border px-2.5 py-0.5`}
                    variant="outline"
                  >
                    {statusStyles[status].icon}
                    {status === 'optimized' ? 'Optimized' : 'Needs Attention'}
                  </Badge>
                </motion.div>
              </div>
              
              {/* Warning message */}
              {warning && (
                <motion.div 
                  layout="position"
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 p-2 rounded-md flex items-start ${
                    isDarkMode ? "bg-amber-900/20 border border-amber-800/30" : "bg-amber-50 border border-amber-100"
                  }`}
                >
                  <AlertCircle className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${
                    isDarkMode ? "text-amber-400" : "text-amber-500"
                  }`} />
                  <p className={`text-sm ${isDarkMode ? "text-amber-300" : "text-amber-700"}`}>
                    {warning}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Edit/Save buttons */}
            <div className="ml-4 flex flex-col space-y-2">
              {isEditingPhase ? (
                <div className="flex flex-col space-y-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => setIsEditingPhase(false)}
                      className={`h-8 w-8 rounded-full ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => setIsEditingPhase(false)}
                      className={`h-8 w-8 rounded-full ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => setIsEditingPhase(true)}
                      className={`h-8 w-8 rounded-full ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className={`h-8 w-8 rounded-full ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <Separator className={isDarkMode ? "bg-slate-700" : "bg-gray-200"} />
              
              {/* Tabs for Tasks and Materials */}
              <div className="flex justify-between items-center mt-4">
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant={activeTab === 'tasks' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('tasks')}
                    className={activeTab === 'tasks' 
                      ? (isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "") 
                      : (isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : "")
                    }
                  >
                    <ListTodo className="w-4 h-4 mr-2" />
                    Tasks ({phaseTaskItems.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={activeTab === 'materials' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('materials')}
                    className={activeTab === 'materials' 
                      ? (isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "") 
                      : (isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : "")
                    }
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Materials ({phaseMaterialItems.length})
                  </Button>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="mt-4">
                <AnimatePresence mode="wait">
                  {activeTab === 'tasks' ? (
                    <motion.div
                      key="tasks"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {phaseTaskItems.length === 0 ? (
                        <p className={`text-center py-6 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                          No tasks added yet
                        </p>
                      ) : (
                        phaseTaskItems.map((task) => (
                          <motion.div 
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            layout
                            className={`p-3 rounded-md border ${
                              isDarkMode 
                                ? "bg-slate-800/60 border-slate-700 hover:border-slate-600" 
                                : "bg-white border-gray-200 hover:border-gray-300"
                            } transition-all duration-200 shadow-sm hover:shadow group`}
                            whileHover={{ y: -2 }}
                          >
                            {editingTaskId === task.id ? (
                              // Edit mode
                              <div className="space-y-3">
                                <Input
                                  value={task.name}
                                  onChange={(e) => handleUpdateTask(task.id, { name: e.target.value })}
                                  className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
                                  placeholder="Task name"
                                />
                                <div className="flex gap-2">
                                  <Input
                                    value={task.duration}
                                    onChange={(e) => handleUpdateTask(task.id, { duration: e.target.value })}
                                    className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
                                    placeholder="Duration"
                                  />
                                  <Select
                                    value={task.status}
                                    onValueChange={(value) => handleUpdateTask(task.id, { status: value as any })}
                                  >
                                    <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}>
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setEditingTaskId(null)}
                                    className={isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : ""}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => setEditingTaskId(null)}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View mode
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                      {task.name}
                                    </h4>
                                    <Badge className={`${taskStatusBadgeStyles[task.status].bg} ${taskStatusBadgeStyles[task.status].text} text-xs font-normal`}>
                                      {task.status === 'pending' ? 'Pending' : 
                                       task.status === 'in-progress' ? 'In Progress' : 'Completed'}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center text-sm">
                                      <Clock className={`w-3.5 h-3.5 mr-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`} />
                                      <span className={isDarkMode ? "text-slate-400" : "text-gray-600"}>
                                        {task.duration}
                                      </span>
                                    </div>
                                    {task.assignedTo && (
                                      <div className="flex items-center text-sm">
                                        <User className={`w-3.5 h-3.5 mr-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`} />
                                        <span className={isDarkMode ? "text-slate-400" : "text-gray-600"}>
                                          {getTeamMember(task.assignedTo)?.name || 'Unknown'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button 
                                        size="icon" 
                                        variant="outline" 
                                        className={`h-7 w-7 rounded-full ${
                                          isDarkMode 
                                            ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                        }`}
                                      >
                                        <User className="h-3.5 w-3.5" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent 
                                      className={`w-60 p-2 ${
                                        isDarkMode 
                                          ? "bg-slate-800 border-slate-700" 
                                          : "bg-white"
                                      }`}
                                      side="right"
                                    >
                                      <div className="space-y-2">
                                        <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-white" : ""}`}>
                                          Assign Team Member
                                        </h4>
                                        <div className="grid grid-cols-1 gap-1.5">
                                          {teamMembers.map(member => (
                                            <motion.div 
                                              key={member.id}
                                              whileHover={{ backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' }}
                                              className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer ${
                                                task.assignedTo === member.id
                                                  ? (isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                                                  : ''
                                              }`}
                                              onClick={() => handleAssignTeamMember(task.id, member.id)}
                                            >
                                              <Avatar className="h-7 w-7">
                                                <AvatarImage src={member.avatar} alt={member.name} />
                                                <AvatarFallback className={isDarkMode ? "bg-slate-700 text-slate-300" : ""}>
                                                  {member.name.charAt(0)}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div>
                                                <p className={`text-sm font-medium leading-none ${
                                                  isDarkMode ? "text-slate-200" : ""
                                                }`}>{member.name}</p>
                                                <p className={`text-xs ${
                                                  isDarkMode ? "text-slate-400" : "text-gray-500"
                                                }`}>{member.role}</p>
                                              </div>
                                              {task.assignedTo === member.id && (
                                                <CheckSquare className="w-4 h-4 ml-auto text-blue-500" />
                                              )}
                                            </motion.div>
                                          ))}
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  <Button 
                                    size="icon" 
                                    variant="outline" 
                                    onClick={() => handleEditTask(task.id)}
                                    className={`h-7 w-7 rounded-full ${
                                      isDarkMode 
                                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                    }`}
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="materials"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {phaseMaterialItems.length === 0 ? (
                        <p className={`text-center py-6 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                          No materials added yet
                        </p>
                      ) : (
                        phaseMaterialItems.map((material) => (
                          <motion.div 
                            key={material.id}
                            layout
                            className={`p-3 rounded-md border ${
                              isDarkMode 
                                ? "bg-slate-800/60 border-slate-700 hover:border-slate-600" 
                                : "bg-white border-gray-200 hover:border-gray-300"
                            } transition-all duration-200 shadow-sm hover:shadow`}
                            whileHover={{ y: -2 }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {material.name}
                                  </h4>
                                  <Badge className={`${materialStatusBadgeStyles[material.status].bg} ${materialStatusBadgeStyles[material.status].text} text-xs font-normal`}>
                                    {material.status === 'not-ordered' ? 'Not Ordered' : 
                                     material.status === 'ordered' ? 'Ordered' : 'Delivered'}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className={`mr-1 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                                    {material.quantity} {material.unit}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  className={`h-6 w-6 rounded-full ${
                                    isDarkMode 
                                      ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                  }`}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PhaseCard;
