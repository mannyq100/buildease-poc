import React from 'react';
import { ConstructionPlan } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion as m } from 'framer-motion';

interface MaterialsViewProps {
  plan: ConstructionPlan;
  onAddMaterial?: (phaseId: string) => void;
  onEditMaterial?: (phaseId: string, materialId: string) => void;
  onDeleteMaterial?: (phaseId: string, materialId: string) => void;
}

export function MaterialsView({ plan, onAddMaterial, onEditMaterial, onDeleteMaterial }: MaterialsViewProps) {
  // Extract all materials from all phases
  const allMaterials = plan.phases.flatMap(phase => 
    phase.materials.map(material => ({
      ...material,
      phaseId: phase.id,
      phaseName: phase.name
    }))
  );

  const totalMaterialsCost = allMaterials.reduce((sum, material) => sum + material.totalPrice, 0);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ordered':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Ordered</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Delivered</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'ordered':
        return <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
      default:
        return <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
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
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-[#2B6CB0] dark:text-[#93C5FD] flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Materials Needed
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Cost</p>
                  <p className="text-lg font-medium text-[#2B6CB0] dark:text-[#93C5FD]">{formatCurrency(totalMaterialsCost)}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phase</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  {(onEditMaterial || onDeleteMaterial) && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {allMaterials.map((material, index) => (
                  <m.tr 
                    key={material.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{material.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{material.phaseName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{material.quantity} {material.unit}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">${material.unitPrice} each</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(material.totalPrice)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(material.status)}
                        <span className="ml-1.5 text-sm text-gray-700 dark:text-gray-300">{material.status.charAt(0).toUpperCase() + material.status.slice(1)}</span>
                      </div>
                      {material.deliveryDate && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expected: {new Date(material.deliveryDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    {(onEditMaterial || onDeleteMaterial) && (
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {onEditMaterial && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              onClick={() => onEditMaterial(material.phaseId, material.id)}
                            >
                              <span className="sr-only">Edit</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </Button>
                          )}
                          {onDeleteMaterial && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              onClick={() => onDeleteMaterial(material.phaseId, material.id)}
                            >
                              <span className="sr-only">Delete</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </m.tr>
                ))}
              </tbody>
            </table>
            {allMaterials.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No materials listed for this project
              </div>
            )}
          </CardContent>
        </Card>
      </m.div>
    </div>
  );
}
