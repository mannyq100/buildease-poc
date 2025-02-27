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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  AlertTriangle,
  ShoppingCart,
  Truck,
  BarChart3,
  Layers,
  Edit,
  Trash,
  ArrowUpDown,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  Building,
  FileText,
  Download,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Hammer,
  Wrench,
  Box,
  Boxes,
  Warehouse,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  XCircle,
  Save,
  X
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { 
  DashboardLayout, 
  DashboardSection, 
  Grid 
} from '@/components/layout/test';
import { 
  PageHeader
} from '@/components/shared';
import MainNavigation from '@/components/layout/MainNavigation';

// Mock data for materials
const initialMaterials = [
  {
    id: 1,
    name: 'Cement',
    category: 'Concrete',
    unit: 'Bag',
    unitPrice: 12.50,
    inStock: 150,
    minStock: 50,
    onOrder: 0,
    supplier: 'BuildSupply Inc.',
    lastOrdered: '2024-02-10',
    project: 'Villa Construction',
    status: 'In Stock'
  },
  {
    id: 2,
    name: 'Steel Reinforcement Bars',
    category: 'Structural',
    unit: 'Ton',
    unitPrice: 1200.00,
    inStock: 5,
    minStock: 2,
    onOrder: 0,
    supplier: 'Steel Masters Ltd.',
    lastOrdered: '2024-01-15',
    project: 'Villa Construction',
    status: 'In Stock'
  },
  {
    id: 3,
    name: 'Bricks',
    category: 'Masonry',
    unit: 'Piece',
    unitPrice: 0.75,
    inStock: 2500,
    minStock: 1000,
    onOrder: 0,
    supplier: 'Clay Works Co.',
    lastOrdered: '2024-01-20',
    project: 'Villa Construction',
    status: 'In Stock'
  },
  {
    id: 4,
    name: 'Sand',
    category: 'Aggregates',
    unit: 'Cubic Meter',
    unitPrice: 45.00,
    inStock: 20,
    minStock: 10,
    onOrder: 15,
    supplier: 'Quarry Solutions',
    lastOrdered: '2024-02-05',
    project: 'Villa Construction',
    status: 'Low Stock'
  },
  {
    id: 5,
    name: 'Gravel',
    category: 'Aggregates',
    unit: 'Cubic Meter',
    unitPrice: 55.00,
    inStock: 15,
    minStock: 10,
    onOrder: 0,
    supplier: 'Quarry Solutions',
    lastOrdered: '2024-02-05',
    project: 'Villa Construction',
    status: 'In Stock'
  },
  {
    id: 6,
    name: 'Timber',
    category: 'Wood',
    unit: 'Board Feet',
    unitPrice: 3.25,
    inStock: 500,
    minStock: 200,
    onOrder: 0,
    supplier: 'Woodland Supplies',
    lastOrdered: '2024-01-25',
    project: 'Office Renovation',
    status: 'In Stock'
  },
  {
    id: 7,
    name: 'Paint - Interior',
    category: 'Finishes',
    unit: 'Gallon',
    unitPrice: 28.99,
    inStock: 25,
    minStock: 15,
    onOrder: 0,
    supplier: 'Color World Inc.',
    lastOrdered: '2024-02-15',
    project: 'Office Renovation',
    status: 'In Stock'
  },
  {
    id: 8,
    name: 'Electrical Wiring',
    category: 'Electrical',
    unit: 'Roll',
    unitPrice: 85.50,
    inStock: 8,
    minStock: 5,
    onOrder: 0,
    supplier: 'Power Systems Ltd.',
    lastOrdered: '2024-01-30',
    project: 'Villa Construction',
    status: 'In Stock'
  },
  {
    id: 9,
    name: 'PVC Pipes',
    category: 'Plumbing',
    unit: 'Length',
    unitPrice: 18.75,
    inStock: 30,
    minStock: 20,
    onOrder: 0,
    supplier: 'Plumbing Plus',
    lastOrdered: '2024-02-01',
    project: 'Villa Construction',
    status: 'In Stock'
  },
  {
    id: 10,
    name: 'Ceramic Tiles',
    category: 'Finishes',
    unit: 'Square Meter',
    unitPrice: 22.50,
    inStock: 75,
    minStock: 50,
    onOrder: 0,
    supplier: 'Tile Experts',
    lastOrdered: '2024-02-10',
    project: 'Office Renovation',
    status: 'In Stock'
  },
  {
    id: 11,
    name: 'Glass Panels',
    category: 'Glazing',
    unit: 'Square Meter',
    unitPrice: 95.00,
    inStock: 5,
    minStock: 10,
    onOrder: 15,
    supplier: 'Clear View Glass',
    lastOrdered: '2024-02-18',
    project: 'Office Renovation',
    status: 'Out of Stock'
  },
  {
    id: 12,
    name: 'Insulation',
    category: 'Insulation',
    unit: 'Roll',
    unitPrice: 45.25,
    inStock: 12,
    minStock: 8,
    onOrder: 0,
    supplier: 'Thermal Solutions',
    lastOrdered: '2024-01-22',
    project: 'Villa Construction',
    status: 'In Stock'
  }
];

// Category options for filtering and forms
const categories = [
  'All Categories',
  'Concrete',
  'Structural',
  'Masonry',
  'Aggregates',
  'Wood',
  'Finishes',
  'Electrical',
  'Plumbing',
  'Glazing',
  'Insulation'
];

// Project options for filtering and forms
const projects = [
  'All Projects',
  'Villa Construction',
  'Office Renovation'
];

// Status options for filtering
const statuses = [
  'All Statuses',
  'In Stock',
  'Low Stock',
  'Out of Stock',
  'On Order'
];

const Materials = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState(initialMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: '',
    unit: '',
    unitPrice: 0,
    inStock: 0,
    minStock: 0,
    supplier: '',
    project: ''
  });

  // Filter materials based on search query and filters
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === 'All Categories' || 
      material.category === categoryFilter;
    
    const matchesProject = 
      projectFilter === 'All Projects' || 
      material.project === projectFilter;
    
    const matchesStatus = 
      statusFilter === 'All Statuses' || 
      material.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesProject && matchesStatus;
  });

  // Calculate inventory statistics
  const totalMaterials = materials.length;
  const lowStockCount = materials.filter(m => m.status === 'Low Stock').length;
  const outOfStockCount = materials.filter(m => m.status === 'Out of Stock').length;
  const onOrderCount = materials.filter(m => m.onOrder > 0).length;

  // Handle adding a new material
  const handleAddMaterial = () => {
    const id = Math.max(...materials.map(m => m.id)) + 1;
    const status = 
      newMaterial.inStock === 0 ? 'Out of Stock' :
      newMaterial.inStock <= newMaterial.minStock ? 'Low Stock' : 
      'In Stock';
    
    const newMaterialItem = {
      ...newMaterial,
      id,
      onOrder: 0,
      lastOrdered: '',
      status
    };
    
    setMaterials([...materials, newMaterialItem]);
    setNewMaterial({
      name: '',
      category: '',
      unit: '',
      unitPrice: 0,
      inStock: 0,
      minStock: 0,
      supplier: '',
      project: ''
    });
    setIsAddMaterialOpen(false);
  };

  // Handle ordering more of a material
  const handleOrderMaterial = (id, quantity) => {
    setMaterials(materials.map(material => 
      material.id === id ? { 
        ...material, 
        onOrder: material.onOrder + quantity,
        lastOrdered: new Date().toISOString().split('T')[0],
        status: 'On Order'
      } : material
    ));
  };

  // Handle deleting a material
  const handleDeleteMaterial = (id) => {
    setMaterials(materials.filter(material => material.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <MainNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Materials"
          subtitle="Track and manage construction materials inventory"
          icon={<Package className="h-6 w-6" />}
          gradient={true}
          animated={true}
          actions={[
            {
              label: "Add Material",
              icon: <Plus />,
              variant: "construction",
              onClick: () => setIsAddMaterialOpen(true)
            },
            {
              label: "Export",
              icon: <Download />,
              variant: "construction",
              onClick: () => {/* Export functionality */}
            }
          ]}
        />

        {/* Materials Statistics */}
        <div className="mt-8 mb-6">
          <Grid cols={4} className="w-full gap-6">
            <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Materials</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{totalMaterials}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{lowStockCount}</p>
                  {lowStockCount > 0 && (
                    <Badge variant="warning" className="mt-1">Needs attention</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{outOfStockCount}</p>
                  {outOfStockCount > 0 && (
                    <Badge variant="destructive" className="mt-1">Action needed</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">On Order</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{onOrderCount}</p>
                  {onOrderCount > 0 && (
                    <Badge variant="success" className="mt-1">Pending delivery</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Grid>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  variant="modern"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Table */}
        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-gray-700 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-gray-900 dark:text-white">Inventory</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-800">
                  <TableHead>Material</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Stock Level</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Package className="h-12 w-12 mb-2 opacity-30" />
                        <p>No materials found</p>
                        <p className="text-sm">Try adjusting your filters or add a new material</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaterials.map((material) => (
                    <TableRow key={material.id} className="group hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-white">{material.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {material.project}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-200">
                          {material.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{material.supplier}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${material.unitPrice.toFixed(2)}/{material.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{material.inStock} {material.unit}s</div>
                        {material.onOrder > 0 && (
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            +{material.onOrder} on order
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant={
                            material.status === 'In Stock' 
                              ? 'success' 
                              : material.status === 'Low Stock'
                              ? 'warning'
                              : material.status === 'On Order'
                              ? 'info'
                              : 'destructive'
                          }>
                            {material.status}
                          </Badge>
                          {material.status !== 'Out of Stock' && material.status !== 'On Order' && (
                            <Progress 
                              value={(material.inStock / (material.minStock * 2)) * 100} 
                              className="h-1 w-20" 
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Material
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOrderMaterial(material.id, 10)}>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Order More
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 dark:text-red-400"
                                onClick={() => handleDeleteMaterial(material.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Material
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredMaterials.length}</span> of{" "}
              <span className="font-medium">{materials.length}</span> materials
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={true}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-deepblue-light text-white hover:bg-deepblue-dark"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={true}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Add Material Dialog */}
        <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add Material</DialogTitle>
              <DialogDescription>
                Add a new material to your inventory
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input 
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                    placeholder="Material name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    value={newMaterial.category}
                    onValueChange={(value) => setNewMaterial({...newMaterial, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'All Categories').map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <Input 
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                    placeholder="e.g., Bag, Ton, Piece"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit Price</label>
                  <Input 
                    type="number"
                    value={newMaterial.unitPrice}
                    onChange={(e) => setNewMaterial({...newMaterial, unitPrice: parseFloat(e.target.value)})}
                    placeholder="Price per unit"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock Level</label>
                  <Input 
                    type="number"
                    value={newMaterial.inStock}
                    onChange={(e) => setNewMaterial({...newMaterial, inStock: parseInt(e.target.value)})}
                    placeholder="Current quantity"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Stock</label>
                  <Input 
                    type="number"
                    value={newMaterial.minStock}
                    onChange={(e) => setNewMaterial({...newMaterial, minStock: parseInt(e.target.value)})}
                    placeholder="Reorder threshold"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Supplier</label>
                  <Input 
                    value={newMaterial.supplier}
                    onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
                    placeholder="Supplier name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select 
                    value={newMaterial.project}
                    onValueChange={(value) => setNewMaterial({...newMaterial, project: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.filter(p => p !== 'All Projects').map(project => (
                        <SelectItem key={project} value={project}>{project}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMaterialOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMaterial}>Add Material</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Materials; 