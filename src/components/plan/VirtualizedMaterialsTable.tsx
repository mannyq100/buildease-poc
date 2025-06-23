/**
 * VirtualizedMaterialsTable Component
 * High-performance table for large material lists using react-window
 * Optimized for smooth scrolling with hundreds of materials
 */

import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Package, Calendar, CheckCircle, Clock, AlertCircle, Edit, Trash2, Box } from 'lucide-react';
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
      className="flex items-center border-b border-buildease-blue-100/40 dark:border-buildease-blue-900/40 bg-white dark:bg-gray-800 hover:bg-buildease-blue-50/30 dark:hover:bg-buildease-blue-950/20 transition-colors duration-200"
    >
      {/* Material Name */}
      <div className="flex-1 px-4 py-4 min-w-0">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-buildease-blue-100/60 dark:bg-buildease-blue-900/40 flex items-center justify-center mr-3 flex-shrink-0">
            <Package className="h-4 w-4 text-buildease-blue-600 dark:text-buildease-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-buildease-earth-800 dark:text-buildease-earth-200 truncate">{material.name}</div>
            {material.supplier && (
              <div className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400 truncate">Supplier: {material.supplier}</div>
            )}
          </div>
        </div>
      </div>

      {/* Phase */}
      <div className="flex-1 px-4 py-4 min-w-0">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-buildease-blue-50 dark:bg-buildease-blue-900/30 text-buildease-blue-700 dark:text-buildease-blue-300 border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 truncate">
          {material.phaseName}
        </span>
      </div>

      {/* Quantity */}
      <div className="flex-1 px-4 py-4 min-w-0">
        <div className="text-sm font-semibold text-buildease-earth-800 dark:text-buildease-earth-200">{material.quantity} {material.unit}</div>
        <div className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400 bg-buildease-earth-50/60 dark:bg-buildease-earth-900/30 px-2 py-0.5 rounded-md mt-1 inline-block">${material.unitPrice} each</div>
      </div>

      {/* Cost */}
      <div className="flex-1 px-4 py-4 min-w-0">
        <div className="text-sm font-bold text-status-completed bg-status-completed/10 dark:bg-status-completed/20 px-3 py-1 rounded-md border border-status-completed/30 inline-block">{formatCurrency(material.totalPrice)}</div>
      </div>

      {/* Status */}
      <div className="flex-1 px-4 py-4 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          {getStatusIcon(material.status)}
          <span className="text-sm font-medium text-buildease-earth-800 dark:text-buildease-earth-200 capitalize">{material.status}</span>
        </div>
        {material.deliveryDate && (
          <div className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400 bg-buildease-earth-50/60 dark:bg-buildease-earth-900/30 px-2 py-1 rounded-md flex items-center gap-1 inline-flex">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">Expected: {new Date(material.deliveryDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {hasActions && (
        <div className="flex-shrink-0 px-4 py-4 w-24">
          <div className="flex justify-end space-x-1">
            {onEditMaterial && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-buildease-blue-600 dark:text-buildease-blue-400 hover:text-buildease-blue-700 dark:hover:text-buildease-blue-300 hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-900/20 rounded-md transition-all duration-200"
                onClick={handleEdit}
              >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDeleteMaterial && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
                onClick={handleDelete}
              >
                <span className="sr-only">Delete</span>
                <Trash2 className="h-4 w-4" />
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
  <div className="flex items-center bg-buildease-blue-50/50 dark:bg-buildease-blue-950/30 border-b border-buildease-blue-200/50 dark:border-buildease-blue-800/50 sticky top-0 z-10">
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider">Material</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider">Phase</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider">Quantity</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider">Cost</div>
    </div>
    <div className="flex-1 px-4 py-3">
      <div className="text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider">Status</div>
    </div>
    {hasActions && (
      <div className="flex-shrink-0 px-4 py-3 w-24">
        <div className="text-xs font-semibold text-buildease-blue-700 dark:text-buildease-blue-300 uppercase tracking-wider text-right">Actions</div>
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
      <div className="border border-buildease-blue-100/50 dark:border-buildease-blue-900/30 rounded-lg bg-white/95 dark:bg-gray-900/95">
        <TableHeader hasActions={hasActions} />
        <div className="py-12 text-center bg-white dark:bg-gray-800">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-buildease-blue-100/60 dark:bg-buildease-blue-900/40 mb-4">
            <Box className="h-8 w-8 text-buildease-blue-600 dark:text-buildease-blue-400" />
          </div>
          <h3 className="text-sm font-medium text-buildease-earth-800 dark:text-buildease-earth-200 mb-2">
            No materials listed
          </h3>
          <p className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400">
            No materials have been added to this construction project yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-buildease-blue-100/50 dark:border-buildease-blue-900/30 rounded-lg overflow-hidden shadow-sm bg-white/95 dark:bg-gray-900/95"
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