// src/components/plan/DistributeModal.tsx
import { Button } from "@/components/ui/button"
import { m } from "framer-motion"
import {
  Calendar,
  Loader2,
  Package,
  Users,
  X
} from "lucide-react"

interface DistributeModalProps {
  show: boolean
  onClose: () => void
  onDistribute: () => void
  saving: boolean
}

export function DistributeModal({
  show,
  onClose,
  onDistribute,
  saving
}: DistributeModalProps) {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <m.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Distribute Plan</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This will distribute your plan details to the following areas of your project:
          </p>
          
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md flex items-start">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Project Phases</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Creates timeline and milestone entries
                </p>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md flex items-start">
              <Package className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Materials</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Extracts required materials and quantities
                </p>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md flex items-start">
              <Users className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Team & Tasks</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Creates roles and responsibilities
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onDistribute} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Distribute'
            )}
          </Button>
        </div>
      </m.div>
    </div>
  )
}