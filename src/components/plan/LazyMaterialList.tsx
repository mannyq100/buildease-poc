/**
 * LazyMaterialList Component
 * Implements lazy loading for large material lists within phase cards
 * Optimized for mobile performance with progressive loading
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Material } from '@/data/mock/generatedPlan/planData';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Package } from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';

interface LazyMaterialListProps {
  materials: Material[];
  phaseId: string;
  onEditMaterial?: (phaseId: string, materialId: string) => void;
  onDeleteMaterial?: (phaseId: string, materialId: string) => void;
  initialDisplayCount?: number;
  batchSize?: number;
}

export const LazyMaterialList = React.memo(function LazyMaterialList({
  materials,
  phaseId,
  onEditMaterial,
  onDeleteMaterial,
  initialDisplayCount = 3, // Show first 3 materials initially
  batchSize = 5 // Load 5 more at a time
}: LazyMaterialListProps) {
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const [isExpanding, setIsExpanding] = useState(false);

  // Memoize visible materials
  const visibleMaterials = useMemo(() => {
    return materials.slice(0, displayCount);
  }, [materials, displayCount]);

  const hasMoreMaterials = displayCount < materials.length;
  const hiddenMaterialsCount = materials.length - displayCount;

  // Load more materials
  const loadMoreMaterials = useCallback(() => {
    if (isExpanding) return;
    
    setIsExpanding(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + batchSize, materials.length));
      setIsExpanding(false);
    }, 150); // Small delay for smooth animation
  }, [isExpanding, batchSize, materials.length]);

  // Show all materials
  const showAllMaterials = useCallback(() => {
    if (isExpanding) return;
    
    setIsExpanding(true);
    setTimeout(() => {
      setDisplayCount(materials.length);
      setIsExpanding(false);
    }, 150);
  }, [isExpanding, materials.length]);

  // Collapse to initial count
  const collapseToInitial = useCallback(() => {
    setDisplayCount(initialDisplayCount);
  }, [initialDisplayCount]);

  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-construction-body text-buildease-earth-600 dark:text-buildease-earth-400 bg-gradient-to-br from-buildease-orange-50/40 to-white/60 dark:from-buildease-orange-950/20 dark:to-gray-800/40 rounded-xl border border-dashed border-buildease-orange-300/60 dark:border-buildease-orange-700/60 backdrop-blur-sm">
        <Package className="h-8 w-8 mx-auto mb-2 text-buildease-orange-400 dark:text-buildease-orange-500" />
        <p className="font-medium">No materials added yet</p>
        <p className="text-xs mt-1 text-buildease-earth-500 dark:text-buildease-earth-500">Click "Add Material" to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {visibleMaterials.map((material, index) => (
          <m.div 
            key={material.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.2, 
              delay: index >= initialDisplayCount ? index * 0.03 : 0,
              ease: "easeOut"
            }}
            layout
            className="p-5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-buildease-orange-200/50 dark:border-buildease-orange-800/50 shadow-md hover:border-buildease-orange-300/70 dark:hover:border-buildease-orange-700/70 transition-all duration-200 hover:shadow-lg backdrop-blur-md ring-1 ring-buildease-orange-100/20 dark:ring-buildease-orange-900/20 hover:ring-buildease-orange-200/30 dark:hover:ring-buildease-orange-800/30"
          >
            <div className="flex justify-between">
              <span className="font-semibold text-buildease-earth-800 dark:text-buildease-earth-200 text-construction-body">
                {material.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-status-completed font-bold bg-gradient-to-r from-status-completed/15 to-green-100/20 dark:from-status-completed/25 dark:to-green-900/30 px-3 py-1.5 rounded-full text-xs border border-status-completed/30 dark:border-status-completed/40 backdrop-blur-sm shadow-sm">
                  ${(material.totalPrice ?? 0).toLocaleString()}
                </span>
                <div className="flex gap-2 sm:gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 p-0 opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditMaterial?.(phaseId, material.id);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 p-0 text-red-600 opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMaterial?.(phaseId, material.id);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400 mt-3 flex items-center gap-2">
              <span className="bg-gradient-to-r from-buildease-earth-100/80 to-buildease-earth-50/60 dark:from-buildease-earth-900/40 dark:to-buildease-earth-950/30 px-3 py-1.5 rounded-lg font-medium border border-buildease-earth-200/60 dark:border-buildease-earth-800/60 shadow-sm backdrop-blur-sm">
                {material.quantity} {material.unit}
              </span>
              <span className="text-buildease-earth-500 dark:text-buildease-earth-500">×</span>
              <span className="bg-gradient-to-r from-buildease-earth-100/80 to-buildease-earth-50/60 dark:from-buildease-earth-900/40 dark:to-buildease-earth-950/30 px-3 py-1.5 rounded-lg font-medium border border-buildease-earth-200/60 dark:border-buildease-earth-800/60 shadow-sm backdrop-blur-sm">
                ${material.unitPrice} each
              </span>
            </div>
          </m.div>
        ))}
      </AnimatePresence>

      {/* Load More Controls */}
      {hasMoreMaterials && (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 py-4"
        >
          {isExpanding ? (
            <div className="flex items-center gap-2 text-buildease-orange-600 dark:text-buildease-orange-400">
              <div className="w-4 h-4 border-2 border-buildease-orange-600/30 border-t-buildease-orange-600 rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading materials...</span>
            </div>
          ) : (
            <>
              <button
                onClick={loadMoreMaterials}
                className="px-4 py-2 bg-buildease-orange-50/80 dark:bg-buildease-orange-950/40 hover:bg-buildease-orange-100/80 dark:hover:bg-buildease-orange-900/40 text-buildease-orange-700 dark:text-buildease-orange-300 rounded-lg border border-buildease-orange-200/50 dark:border-buildease-orange-800/50 transition-all duration-200 hover:shadow-sm backdrop-blur-sm font-medium text-xs"
              >
                Load {Math.min(batchSize, hiddenMaterialsCount)} more
              </button>
              
              {hiddenMaterialsCount > batchSize && (
                <button
                  onClick={showAllMaterials}
                  className="px-4 py-2 bg-buildease-blue-50/80 dark:bg-buildease-blue-950/40 hover:bg-buildease-blue-100/80 dark:hover:bg-buildease-blue-900/40 text-buildease-blue-700 dark:text-buildease-blue-300 rounded-lg border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 transition-all duration-200 hover:shadow-sm backdrop-blur-sm font-medium text-xs"
                >
                  Show all {materials.length}
                </button>
              )}
            </>
          )}
        </m.div>
      )}

      {/* Collapse control when showing all */}
      {!hasMoreMaterials && materials.length > initialDisplayCount && (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center py-2"
        >
          <button
            onClick={collapseToInitial}
            className="px-4 py-2 bg-gray-50/80 dark:bg-gray-800/80 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 hover:shadow-sm backdrop-blur-sm font-medium text-xs"
          >
            Show less
          </button>
        </m.div>
      )}

      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && materials.length > 10 && (
        <div className="mt-2 p-2 bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Showing {visibleMaterials.length}/{materials.length} materials
          </p>
        </div>
      )}
    </div>
  );
});

export default LazyMaterialList;