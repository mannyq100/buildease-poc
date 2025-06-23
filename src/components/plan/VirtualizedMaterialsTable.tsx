/**
 * VirtualizedMaterialsTable Component
 * High-performance table for large material lists using react-window
 * Optimized for smooth scrolling with hundreds of materials
 */

import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Package, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion as m } from 'framer-motion';

interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  status: string;
  deliveryDate?: string;
  phaseId: string;
  phaseName: string;
}

interface VirtualizedMaterialsTableProps {
  materials: Material[];
  onEditMaterial?: (phaseId: string, materialId: string) => void;
  onDeleteMaterial?: (phaseId: string, materialId: string) => void;
  height?: number;
  rowHeight?: number;
}

interface RowData {
  materials: Material[];
  onEditMaterial?: (phaseId: string, materialId: string) => void;
  onDeleteMaterial?: (phaseId: string, materialId: string) => void;
  hasActions: boolean;
}

// Optimized row component for virtualization
const MaterialRow = React.memo(({ index, style, data }: {
  index: number;
  style: React.CSSProperties;
  data: RowData;
}) => {
  const { materials, onEditMaterial, onDeleteMaterial, hasActions } = data;
  const material = materials[index];

  const getStatusIcon = useCallback((status: string) => {
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
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const handleEdit = useCallback(() => {
    onEditMaterial?.(material.phaseId, material.id);
  }, [onEditMaterial, material.phaseId, material.id]);

  const handleDelete = useCallback(() => {
    onDeleteMaterial?.(material.phaseId, material.id);
  }, [onDeleteMaterial, material.phaseId, material.id]);

  if (!material) {
    return <div style={style} />;
  }

  return (
    <div 
      style={style}
      className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
    >
      {/* Material Name */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="flex items-center">
          <Package className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{material.name}</div>
        </div>
      </div>

      {/* Phase */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="text-sm text-gray-700 dark:text-gray-300 truncate">{material.phaseName}</div>
      </div>

      {/* Quantity */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="text-sm text-gray-700 dark:text-gray-300">{material.quantity} {material.unit}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">${material.unitPrice} each</div>
      </div>

      {/* Cost */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(material.totalPrice)}</div>
      </div>

      {/* Status */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="flex items-center">
          {getStatusIcon(material.status)}
          <span className="ml-1.5 text-sm text-gray-700 dark:text-gray-300 capitalize">{material.status}</span>
        </div>
        {material.deliveryDate && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">Expected: {new Date(material.deliveryDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {hasActions && (
        <div className="flex-shrink-0 px-4 py-3 w-24">
          <div className="flex justify-end space-x-2">
            {onEditMaterial && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                onClick={handleEdit}
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
                onClick={handleDelete}
              >
                <span className="sr-only">Delete</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

MaterialRow.displayName = 'MaterialRow';

// Table header component
const TableHeader = React.memo(({ hasActions }: { hasActions: boolean }) => (
  <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Material</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phase</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</div>
    </div>
    {hasActions && (
      <div className="flex-shrink-0 px-4 py-3 w-24">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</div>
      </div>
    )}
  </div>
));

TableHeader.displayName = 'TableHeader';

export const VirtualizedMaterialsTable = React.memo(function VirtualizedMaterialsTable({
  materials,
  onEditMaterial,
  onDeleteMaterial,
  height = 500,
  rowHeight = 72
}: VirtualizedMaterialsTableProps) {
  const hasActions = Boolean(onEditMaterial || onDeleteMaterial);

  // Memoize the data for the virtual list
  const itemData = useMemo((): RowData => ({
    materials,
    onEditMaterial,
    onDeleteMaterial,
    hasActions
  }), [materials, onEditMaterial, onDeleteMaterial, hasActions]);

  if (materials.length === 0) {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg">
        <TableHeader hasActions={hasActions} />
        <div className="py-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
          No materials listed for this project
        </div>
      </div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
    >
      <TableHeader hasActions={hasActions} />
      <List
        height={Math.min(height, materials.length * rowHeight)}
        itemCount={materials.length}
        itemSize={rowHeight}
        itemData={itemData}
        width="100%"
        className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
      >
        {MaterialRow}
      </List>
    </m.div>
  );
});