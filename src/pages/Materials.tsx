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
  Trash,
  Truck,
  DollarSign,
  Layers
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { PageHeader } from '@/components/shared'
import { usePageActions } from '@/hooks/usePageActions'
import { MaterialModal, Material as EnhancedMaterial } from '@/components/shared/modals';

// Custom Components
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared'

// Types and Data
import { CATEGORIES } from '@/data/constants/categories'
import { PROJECTS } from '@/data/constants/projects'
import { STATUSES } from '@/data/constants/statuses'
import { INITIAL_MATERIALS } from '@/data/mock/materials'
import { Material } from '@/types/materials'

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
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Partial<EnhancedMaterial> | null>(null);
  const [isNewItem, setIsNewItem] = useState(true);

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
  const totalValue = materials.reduce((total, material) => total + material.unitPrice * material.inStock, 0)
  const uniqueCategories = [...new Set(materials.map(material => material.category))]

  // Function to open the modal for adding a new material
  function handleOpenAddModal() {
    // Convert to the enhanced Material type format
    setCurrentMaterial({
      id: '',
      name: '',
      type: '',
      quantity: 1,
      unit: 'ea',
      unitPrice: 0,
      totalPrice: 0,
      supplier: '',
      status: 'pending',
      purchaseDate: '',
      deliveryDate: '',
      notes: ''
    });
    setIsNewItem(true);
    setShowMaterialModal(true);
  }

  // Function to open the modal for editing an existing material
  function handleOpenEditModal(material: Material) {
    // Convert from old Material type to enhanced Material format
    setCurrentMaterial({
      id: String(material.id),
      name: material.name,
      type: material.category,
      quantity: material.inStock,
      unit: material.unit,
      unitPrice: material.unitPrice,
      totalPrice: material.unitPrice * material.inStock,
      supplier: material.supplier,
      status: material.status === 'In Stock' ? 'delivered' : 
              material.status === 'Low Stock' ? 'pending' : 
              material.status === 'Out of Stock' ? 'pending' : 
              material.status === 'On Order' ? 'ordered' : 'pending',
      purchaseDate: material.lastOrdered || '',
      deliveryDate: '',
      notes: `Min Stock: ${material.minStock}. ${material.onOrder > 0 ? `On Order: ${material.onOrder}` : ''}`
    });
    setIsNewItem(false);
    setShowMaterialModal(true);
  }

  // Adds or updates a material in the inventory using the shared modal data
  function handleSaveMaterial(savedMaterial: EnhancedMaterial) {
    // Convert from enhanced Material format back to page's Material type
    const convertedMaterial: Material = {
      id: parseInt(savedMaterial.id) || Date.now(),
      name: savedMaterial.name,
      category: savedMaterial.type,
      unit: savedMaterial.unit,
      unitPrice: savedMaterial.unitPrice,
      inStock: savedMaterial.quantity,
      minStock: 10, // Default value 
      supplier: savedMaterial.supplier || '',
      project: projectFilter !== 'All Projects' ? projectFilter : 'General',
      status: savedMaterial.status === 'delivered' ? 'In Stock' : 
              savedMaterial.status === 'ordered' ? 'On Order' : 
              savedMaterial.status === 'pending' ? 'Low Stock' : 'In Stock',
      lastUpdated: new Date().toISOString(),
      lastOrdered: savedMaterial.purchaseDate || '',
      onOrder: savedMaterial.status === 'ordered' ? savedMaterial.quantity : 0
    };

    if (isNewItem) {
      setMaterials([...materials, convertedMaterial]);
    } else {
      setMaterials(materials.map(m => 
        m.id === convertedMaterial.id ? convertedMaterial : m
      ));
    }

    setShowMaterialModal(false);
    setCurrentMaterial(null);
  }

  // Places an order for a material
  function handleOrderMaterial(id: number, quantity: number) {
    setMaterials(materials.map(material => {
      if (material.id === id) {
        return {
          ...material,
          status: 'On Order',
          onOrder: quantity,
          lastOrdered: new Date().toISOString()
        }
      }
      return material
    }))
  }

  // Deletes a material from the inventory
  function handleDeleteMaterial(id: number) {
    setMaterials(materials.filter(material => material.id !== id))
  }

  // Handles exporting materials data
  function handleExportMaterials() {
    // In a real app, this would generate a CSV or Excel file
    // TODO: Implement actual CSV/Excel export functionality
    // Show toast notification
    alert('Materials exported successfully!')
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <PageHeader
        title="Materials Inventory"
        description="Track and manage materials across all construction projects"
        icon={<Package />}
        actions={[
          {
            label: 'Add Material',
            icon: <Plus size={16} />,
            onClick: handleOpenAddModal,
            variant: "default"
          },
          {
            label: 'Export',
            icon: <Download size={16} />,
            onClick: handleExportMaterials
          }
        ]}
      />

      {/* Key metrics */}
      <Grid cols={4} className="mt-6">
        <StatCard
          title="Total Materials"
          value={totalMaterials}
          icon={<Package className="text-blue-500" />}
          description="Unique materials in inventory"
          trend={{
            value: 0,
            isPositive: true,
          }}
        />
        <StatCard
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={<DollarSign className="text-green-500" />}
          description="Current inventory value"
          trend={{
            value: 5.2,
            isPositive: true,
          }}
        />
        <StatCard
          title="Low Stock"
          value={lowStockCount}
          icon={<AlertTriangle className="text-amber-500" />}
          description="Materials below minimum"
          trend={{
            value: -2,
            isPositive: true,
          }}
        />
        <StatCard
          title="Pending Orders"
          value={onOrderCount}
          icon={<Truck className="text-indigo-500" />}
          description="Orders awaiting delivery"
          trend={{
            value: 1,
            isPositive: false,
          }}
        />
      </Grid>

      {/* Filters and table */}
      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-[#2B6CB0]">
                <Layers className="h-5 w-5" />
                Materials List
              </CardTitle>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search materials..."
                    className="pl-9 w-full sm:w-[250px] h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Categories">All Categories</SelectItem>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={projectFilter}
                    onValueChange={setProjectFilter}
                  >
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Projects">All Projects</SelectItem>
                      {PROJECTS.map(project => (
                        <SelectItem key={project} value={project}>{project}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Statuses">All Statuses</SelectItem>
                      {STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
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
                            onClick={() => handleOpenEditModal(material)}
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

      {/* Render the shared MaterialModal */}
      {currentMaterial && (
        <MaterialModal 
          show={showMaterialModal}
          onClose={() => {
            setShowMaterialModal(false);
            setCurrentMaterial(null);
          }}
          onSave={handleSaveMaterial}
          material={currentMaterial}
          isNew={isNewItem}
          materialTypes={CATEGORIES}
        />
      )}
    </div>
  )
}