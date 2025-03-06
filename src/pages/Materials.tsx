/**
 * Materials.tsx - Materials inventory management page
 * Track, manage, and order construction materials across projects
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Icons
import {
  AlertTriangle,
  Download,
  Edit,
  Package,
  Plus,
  Search,
  Settings,
  Trash,
  Truck,
  XCircle
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Shared Components
import { Grid } from '@/components/layout/Grid'
import { MainNavigation } from '@/components/navigation/MainNavigation'
import { PageHeader } from '@/components/shared'
import { usePageActions } from '@/hooks/usePageActions'

// Custom Components
import { StatCard } from '@/components/materials/StatCard'
import { StatusBadge } from '@/components/materials/StatusBadge'

// Types and Data
import { CATEGORIES } from '@/data/constants/categories'
import { PROJECTS } from '@/data/constants/projects'
import { STATUSES } from '@/data/constants/statuses'
import { INITIAL_MATERIALS } from '@/data/mock/materials'
import { Material, NewMaterial } from '@/types/materials'

/**
 * Materials page component
 * Provides functionality to track, manage, and order construction materials
 */
export function Materials() {
  const navigate = useNavigate()
  const { getCommonActions } = usePageActions('materials')
  
  // State management
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [projectFilter, setProjectFilter] = useState('All Projects')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false)
  const [newMaterial, setNewMaterial] = useState<NewMaterial>({
    name: '',
    category: '',
    unit: '',
    unitPrice: 0,
    inStock: 0,
    minStock: 0,
    supplier: '',
    project: ''
  })

  // Filter materials based on search query and filters
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = 
      categoryFilter === 'All Categories' || 
      material.category === categoryFilter
    
    const matchesProject = 
      projectFilter === 'All Projects' || 
      material.project === projectFilter
    
    const matchesStatus = 
      statusFilter === 'All Statuses' || 
      material.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesProject && matchesStatus
  })

  // Calculate inventory statistics
  const totalMaterials = materials.length
  const lowStockCount = materials.filter(m => m.status === 'Low Stock').length
  const outOfStockCount = materials.filter(m => m.status === 'Out of Stock').length
  const onOrderCount = materials.filter(m => m.onOrder > 0).length

  /**
   * Adds a new material to the inventory
   */
  function handleAddMaterial() {
    if (!newMaterial.name || !newMaterial.category) return
    
    const id = Math.max(...materials.map(m => m.id)) + 1
    const status = 
      newMaterial.inStock === 0 ? 'Out of Stock' :
      newMaterial.inStock <= newMaterial.minStock ? 'Low Stock' : 
      'In Stock'
    
    const newMaterialItem: Material = {
      ...newMaterial,
      id,
      onOrder: 0,
      lastOrdered: '',
      status: status as Material['status']
    }
    
    setMaterials([...materials, newMaterialItem])
    setNewMaterial({
      name: '',
      category: '',
      unit: '',
      unitPrice: 0,
      inStock: 0,
      minStock: 0,
      supplier: '',
      project: ''
    })
    setIsAddMaterialOpen(false)
  }

  /**
   * Places an order for a material
   */
  function handleOrderMaterial(id: number, quantity: number) {
    setMaterials(materials.map(material => 
      material.id === id ? { 
        ...material, 
        onOrder: material.onOrder + quantity,
        lastOrdered: new Date().toISOString().split('T')[0],
        status: 'On Order'
      } : material
    ))
  }

  /**
   * Deletes a material from the inventory
   */
  function handleDeleteMaterial(id: number) {
    setMaterials(materials.filter(material => material.id !== id))
  }

  /**
   * Handles exporting materials data
   */
  function handleExportMaterials() {
    // In a real application, this would create and download a file
    // For now, just show an alert
    alert('Materials data exported successfully')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <MainNavigation
        title="Materials"
        icon={<Package className="h-6 w-6" />}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Materials Management"
          subtitle="Track and manage construction materials and inventory"
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
              onClick: handleExportMaterials
            }
          ]}
        />

        {/* Materials Statistics */}
        <div className="mt-8 mb-8">
          <Grid cols={4} gap="lg" className="w-full">
            <StatCard 
              icon={<Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              title="Total Materials"
              value={totalMaterials}
              color="blue"
            />
            
            <StatCard 
              icon={<AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              title="Low Stock"
              value={lowStockCount}
              color="amber"
              badge={lowStockCount > 0 ? {
                text: "Needs attention",
                variant: "warning"
              } : undefined}
            />
            
            <StatCard 
              icon={<XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
              title="Out of Stock"
              value={outOfStockCount}
              color="red"
              badge={outOfStockCount > 0 ? {
                text: "Action needed",
                variant: "destructive"
              } : undefined}
            />
            
            <StatCard 
              icon={<Truck className="w-5 h-5 text-green-600 dark:text-green-400" />}
              title="On Order"
              value={onOrderCount}
              color="green"
              badge={onOrderCount > 0 ? {
                text: "Pending delivery",
                variant: "success"
              } : undefined}
            />
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
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
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
                    {PROJECTS.map(project => (
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
                    {STATUSES.map(status => (
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
                      <TableCell>{material.category}</TableCell>
                      <TableCell>{material.supplier}</TableCell>
                      <TableCell className="text-right">${material.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <div>{material.inStock} {material.unit}s</div>
                          {material.onOrder > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {material.onOrder} on order
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={material.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOrderMaterial(material.id, 10)}
                            disabled={material.status === 'On Order'}
                          >
                            <Truck className="h-4 w-4" />
                            <span className="sr-only">Order</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {/* Open edit dialog */}}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMaterial(material.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Add Material Dialog */}
      <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>
              Add a new material to your inventory. Fill out the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="category">Category</Label>
              <Select
                value={newMaterial.category}
                onValueChange={(value) => setNewMaterial({ ...newMaterial, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(c => c !== 'All Categories').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="unitPrice">Unit Price ($)</Label>
              <Input
                id="unitPrice"
                type="number"
                value={newMaterial.unitPrice || ''}
                onChange={(e) => setNewMaterial({ ...newMaterial, unitPrice: parseFloat(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="inStock">In Stock</Label>
              <Input
                id="inStock"
                type="number"
                value={newMaterial.inStock || ''}
                onChange={(e) => setNewMaterial({ ...newMaterial, inStock: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="minStock">Min Stock</Label>
              <Input
                id="minStock"
                type="number"
                value={newMaterial.minStock || ''}
                onChange={(e) => setNewMaterial({ ...newMaterial, minStock: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={newMaterial.supplier}
                onChange={(e) => setNewMaterial({ ...newMaterial, supplier: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="project">Project</Label>
              <Select
                value={newMaterial.project}
                onValueChange={(value) => setNewMaterial({ ...newMaterial, project: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECTS.filter(p => p !== 'All Projects').map(project => (
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
  )
} 