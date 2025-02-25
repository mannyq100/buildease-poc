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
  Calendar
} from 'lucide-react';
import { 
  DashboardLayout, 
  DashboardSection, 
  Grid 
} from '@/components/layout/test';
import { 
  MetricCard
} from '@/components/shared';

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
    <DashboardLayout>
      {/* Top Header with Actions */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Materials Management</h1>
        <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
          <DialogTrigger asChild>
            <Button className="space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Material</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Material</DialogTitle>
              <DialogDescription>
                Enter the details of the new material to add to inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="category" className="text-right text-sm font-medium">
                  Category
                </label>
                <Select 
                  onValueChange={(value) => setNewMaterial({...newMaterial, category: value})}
                  value={newMaterial.category}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'All Categories').map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="unit" className="text-right text-sm font-medium">
                  Unit
                </label>
                <Input
                  id="unit"
                  value={newMaterial.unit}
                  onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                  className="col-span-3"
                  placeholder="e.g., Bag, Ton, Piece"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="unitPrice" className="text-right text-sm font-medium">
                  Unit Price ($)
                </label>
                <Input
                  id="unitPrice"
                  type="number"
                  value={newMaterial.unitPrice}
                  onChange={(e) => setNewMaterial({...newMaterial, unitPrice: parseFloat(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="inStock" className="text-right text-sm font-medium">
                  Initial Stock
                </label>
                <Input
                  id="inStock"
                  type="number"
                  value={newMaterial.inStock}
                  onChange={(e) => setNewMaterial({...newMaterial, inStock: parseInt(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="minStock" className="text-right text-sm font-medium">
                  Min. Stock Level
                </label>
                <Input
                  id="minStock"
                  type="number"
                  value={newMaterial.minStock}
                  onChange={(e) => setNewMaterial({...newMaterial, minStock: parseInt(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="supplier" className="text-right text-sm font-medium">
                  Supplier
                </label>
                <Input
                  id="supplier"
                  value={newMaterial.supplier}
                  onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="project" className="text-right text-sm font-medium">
                  Project
                </label>
                <Select 
                  onValueChange={(value) => setNewMaterial({...newMaterial, project: value})}
                  value={newMaterial.project}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.filter(p => p !== 'All Projects').map(project => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMaterialOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMaterial}>Add Material</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Materials Stats */}
      <Grid cols={4} className="mb-6">
        <MetricCard
          icon={<Package className="w-5 h-5" />}
          label="Total Materials"
          value={totalMaterials.toString()}
          subtext="In inventory"
        />
        <MetricCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Low Stock"
          value={lowStockCount.toString()}
          subtext="Need attention"
        />
        <MetricCard
          icon={<ShoppingCart className="w-5 h-5" />}
          label="Out of Stock"
          value={outOfStockCount.toString()}
          subtext="Need ordering"
        />
        <MetricCard
          icon={<Truck className="w-5 h-5" />}
          label="On Order"
          value={onOrderCount.toString()}
          subtext="Pending delivery"
        />
      </Grid>

      {/* Tabs for different views */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                className="pl-10" 
                placeholder="Search materials..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={projectFilter} 
              onValueChange={setProjectFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Materials List */}
          <DashboardSection>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Material</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Supplier</th>
                    <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                    <th className="text-right py-3 px-4 font-medium">In Stock</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((material) => (
                    <tr key={material.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{material.name}</div>
                        <div className="text-sm text-gray-500 hidden md:block">
                          {material.project}
                        </div>
                      </td>
                      <td className="py-3 px-4">{material.category}</td>
                      <td className="py-3 px-4 hidden md:table-cell">{material.supplier}</td>
                      <td className="py-3 px-4 text-right">${material.unitPrice.toFixed(2)}/{material.unit}</td>
                      <td className="py-3 px-4 text-right">
                        <div>{material.inStock} {material.unit}s</div>
                        {material.onOrder > 0 && (
                          <div className="text-sm text-blue-600">
                            +{material.onOrder} on order
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <Badge className={
                            material.status === 'In Stock' 
                              ? 'bg-green-100 text-green-800' : 
                            material.status === 'Low Stock' 
                              ? 'bg-yellow-100 text-yellow-800' :
                            material.status === 'On Order'
                              ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                          }>
                            {material.status}
                          </Badge>
                        </div>
                        {material.status !== 'Out of Stock' && material.status !== 'On Order' && (
                          <div className="mt-1 w-full">
                            <Progress 
                              value={(material.inStock / (material.minStock * 2)) * 100} 
                              className="h-1" 
                            />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOrderMaterial(material.id, 10)}>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              <span>Order More</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteMaterial(material.id)}
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMaterials.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No materials found matching your search criteria.
                </div>
              )}
            </div>
          </DashboardSection>
        </TabsContent>

        <TabsContent value="orders">
          <DashboardSection>
            <div className="p-6 text-center">
              <Truck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Orders Management</h3>
              <p className="text-gray-500 mb-4">
                Track and manage your material orders, deliveries, and suppliers.
              </p>
              <Button>View All Orders</Button>
            </div>
          </DashboardSection>
        </TabsContent>

        <TabsContent value="analytics">
          <DashboardSection>
            <div className="p-6 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Materials Analytics</h3>
              <p className="text-gray-500 mb-4">
                View usage trends, cost analysis, and inventory forecasts.
              </p>
              <Button>Generate Reports</Button>
            </div>
          </DashboardSection>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Materials; 