import React, { useMemo, useCallback } from 'react';
import { ConstructionPlan, Material } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Calendar, CheckCircle, Clock, AlertCircle, Edit, Trash2, TrendingUp, Box } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion as m } from 'framer-motion';
import { VirtualizedMaterialsTable } from './VirtualizedMaterialsTable';
import { useDebounceSearch, searchMaterials } from '@/hooks/useDebounceSearch';
import { SearchInput } from '@/components/shared/SearchInput';

interface MaterialsViewProps {
  plan: ConstructionPlan;
  _onAddMaterial?: (phaseId: string) => void;
  onEditMaterial?: (phaseId: string, materialId: string) => void;
  onDeleteMaterial?: (phaseId: string, materialId: string) => void;
}

export function MaterialsView({ plan, onAddMaterial: _onAddMaterial, onEditMaterial, onDeleteMaterial }: MaterialsViewProps) {
  // Extract all materials from all phases
  const allMaterials = useMemo(() => plan.phases.flatMap(phase => 
    phase.materials.map(material => ({
      ...material,
      phaseId: phase.id,
      phaseName: phase.name
    }))
  ), [plan.phases]);

  const totalMaterialsCost = useMemo(() => 
    allMaterials.reduce((sum, material) => sum + material.totalPrice, 0),
    [allMaterials]
  );

  // Search functionality with debouncing
  const materialSearchFunction = useCallback((materials: Material[], searchTerm: string) => 
    searchMaterials(materials, searchTerm), []);

  const {
    searchTerm,
    filteredResults: filteredMaterials,
    isSearching,
    setSearchTerm,
    clearSearch,
    searchStats
  } = useDebounceSearch(allMaterials, materialSearchFunction, {
    delay: 300,
    minLength: 1
  });

  const filteredMaterialsCost = useMemo(() =>
    filteredMaterials.reduce((sum, material) => sum + material.totalPrice, 0),
    [filteredMaterials]
  );

  // Use virtualization for large material lists (threshold: 20+ items)
  const shouldUseVirtualization = filteredMaterials.length > 20;

  const _getStatusBadge = (status: string) => {
    switch(status) {
      case 'ordered':
        return <Badge className="bg-buildease-blue-100 text-buildease-blue-800 dark:bg-buildease-blue-900/30 dark:text-buildease-blue-400">Ordered</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Delivered</Badge>;
      case 'pending':
        return <Badge className="bg-buildease-orange-100 text-buildease-orange-800 dark:bg-buildease-orange-900/30 dark:text-buildease-orange-400">Pending</Badge>;
      default:
        return <Badge className="bg-buildease-earth-100 text-buildease-earth-800 dark:bg-buildease-earth-800 dark:text-buildease-earth-400">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'ordered':
        return <Clock className="h-4 w-4 text-buildease-blue-500 dark:text-buildease-blue-400" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-buildease-orange-500 dark:text-buildease-orange-400" />;
      default:
        return <Package className="h-4 w-4 text-buildease-earth-500 dark:text-buildease-earth-400" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-buildease-blue-100/50 dark:border-buildease-blue-900/30 shadow-sm overflow-hidden rounded-lg bg-white/95 dark:bg-gray-900/95">
          <CardHeader className="bg-buildease-blue-50/30 dark:bg-buildease-blue-950/20 border-b border-buildease-blue-100/50 dark:border-buildease-blue-900/30 pb-4">
            <div className="flex justify-between items-start mb-4">
              <CardTitle className="text-lg font-semibold text-buildease-blue-800 dark:text-buildease-blue-200 flex items-center">
                <Box className="h-5 w-5 mr-2" />
                Construction Materials
              </CardTitle>
              <p className="text-buildease-blue-600/70 dark:text-buildease-blue-400/70 text-sm mt-1">Project material requirements and costs</p>
              <div className="flex items-center gap-3">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-buildease-blue-200/30 dark:border-buildease-blue-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-buildease-blue-600 dark:text-buildease-blue-400" />
                    <p className="text-sm font-medium text-buildease-blue-700 dark:text-buildease-blue-300">
                      {searchStats.hasActiveSearch ? 'Filtered Cost' : 'Total Material Cost'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-buildease-blue-800 dark:text-buildease-blue-200">
                    {formatCurrency(searchStats.hasActiveSearch ? filteredMaterialsCost : totalMaterialsCost)}
                  </p>
                  {searchStats.hasActiveSearch && (
                    <p className="text-xs text-buildease-blue-600/60 dark:text-buildease-blue-400/60 mt-1">
                      of {formatCurrency(totalMaterialsCost)} total
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-buildease-blue-600/60 dark:text-buildease-blue-400/60">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <span>{filteredMaterials.length} items</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Box className="h-3 w-3" />
                      <span>{plan.phases.length} phases</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Search Input */}
            <div className="w-full max-w-md">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={clearSearch}
                placeholder="Search materials, phases, suppliers..."
                isSearching={isSearching}
                searchStats={searchStats}
                size="sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {shouldUseVirtualization ? (
              <VirtualizedMaterialsTable
                materials={filteredMaterials}
                onEditMaterial={onEditMaterial}
                onDeleteMaterial={onDeleteMaterial}
                height={500}
                rowHeight={72}
              />
            ) : (
              <div className="max-h-[600px] overflow-auto">
                <table className="w-full">
                  <thead className="bg-buildease-blue-50/50 dark:bg-buildease-blue-950/30 sticky top-0 z-10 border-b border-buildease-blue-200/50 dark:border-buildease-blue-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider">Phase</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider hidden sm:table-cell">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider">Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider hidden sm:table-cell">Status</th>
                      {(onEditMaterial || onDeleteMaterial) && (
                        <th className="px-4 py-3 text-right text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-buildease-blue-100/40 dark:divide-buildease-blue-900/40 bg-white dark:bg-gray-800">
                    {filteredMaterials.map((material, index) => (
                      <m.tr 
                        key={material.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="hover:bg-buildease-blue-50/30 dark:hover:bg-buildease-blue-950/20 transition-colors duration-200"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-buildease-blue-100/60 dark:bg-buildease-blue-900/40 flex items-center justify-center mr-3">
                              <Package className="h-4 w-4 text-buildease-blue-600 dark:text-buildease-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-buildease-earth-800 dark:text-buildease-earth-200">{material.name}</div>
                              {material.supplier && (
                                <div className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400">Supplier: {material.supplier}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-buildease-blue-50 dark:bg-buildease-blue-900/30 text-buildease-blue-700 dark:text-buildease-blue-300 border border-buildease-blue-200/50 dark:border-buildease-blue-800/50">
                            {material.phaseName}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm font-semibold text-buildease-earth-800 dark:text-buildease-earth-200">{material.quantity} {material.unit}</div>
                          <div className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400 bg-buildease-earth-50/60 dark:bg-buildease-earth-900/30 px-2 py-0.5 rounded-md mt-1 inline-block">${material.unitPrice} each</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-status-completed bg-status-completed/10 dark:bg-status-completed/20 px-3 py-1 rounded-md border border-status-completed/30">{formatCurrency(material.totalPrice)}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(material.status)}
                            <span className="text-sm font-medium text-buildease-earth-800 dark:text-buildease-earth-200">{material.status.charAt(0).toUpperCase() + material.status.slice(1)}</span>
                          </div>
                          {material.deliveryDate && (
                            <div className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400 bg-buildease-earth-50/60 dark:bg-buildease-earth-900/30 px-2 py-1 rounded-md flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Expected: {new Date(material.deliveryDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </td>
                        {(onEditMaterial || onDeleteMaterial) && (
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2 sm:space-x-1">
                              {onEditMaterial && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-11 w-11 p-0 text-buildease-blue-600 dark:text-buildease-blue-400 hover:text-buildease-blue-700 dark:hover:text-buildease-blue-300 hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-900/20 rounded-md transition-all duration-200"
                                  onClick={() => onEditMaterial(material.phaseId, material.id)}
                                >
                                  <span className="sr-only">Edit</span>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {onDeleteMaterial && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-11 w-11 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
                                  onClick={() => onDeleteMaterial(material.phaseId, material.id)}
                                >
                                  <span className="sr-only">Delete</span>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </m.tr>
                    ))}
                  </tbody>
                </table>
                {filteredMaterials.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-buildease-blue-100/60 dark:bg-buildease-blue-900/40 mb-4">
                      <Package className="h-8 w-8 text-buildease-blue-600 dark:text-buildease-blue-400" />
                    </div>
                    <h3 className="text-sm font-medium text-buildease-earth-800 dark:text-buildease-earth-200 mb-2">
                      {searchStats.hasActiveSearch 
                        ? 'No materials found'
                        : 'No materials listed'
                      }
                    </h3>
                    <p className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400">
                      {searchStats.hasActiveSearch 
                        ? `No materials found matching "${searchTerm}"`
                        : 'No materials have been added to this construction project yet'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </m.div>
    </div>
  );
}
