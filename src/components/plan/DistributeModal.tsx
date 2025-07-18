// src/components/plan/DistributeModal.tsx
import { Button } from "@/components/ui/button"
import { BaseModal } from "@/components/ui/BaseModal"
import {
  Calendar,
  Loader2,
  Package,
  Users
} from "lucide-react"

interface DistributeModalProps {
  isOpen: boolean
  onClose: () => void
  onDistribute: () => void
  saving: boolean
}

export function DistributeModal({
  isOpen,
  onClose,
  onDistribute,
  saving
}: DistributeModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Distribute Plan"
      description="This will distribute your plan details to the following areas of your project"
      size="md"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-start">
            <Calendar className="h-5 w-5 text-buildease-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Project Phases</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Creates timeline and milestone entries
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-start">
            <Package className="h-5 w-5 text-buildease-orange-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Materials</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Extracts required materials and quantities
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-start">
            <Users className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Team & Tasks</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Creates roles and responsibilities
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={onDistribute} 
            disabled={saving}
            className="bg-buildease-blue-600 hover:bg-buildease-blue-700"
          >
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
      </div>
    </BaseModal>
  )
}