// src/components/plan/ActionButtons.tsx
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ProjectData } from "@/types/projectInputs"
import {
  Download,
  Edit,
  Loader2,
  Plus,
  Printer,
  RotateCw,
  Save,
  Share2,
  Users
} from "lucide-react"

interface ActionButtonsProps {
  isGenerating: boolean
  handleRegenerate: (data: ProjectData | null) => void
  navigateToProjectInput: () => void
  setShowCollaborateModal: (value: boolean) => void
  onAddPhase?: () => void
  onSave?: () => void
  hasUnsavedChanges?: boolean
  saving?: boolean
}

export function ActionButtons({
  isGenerating,
  handleRegenerate,
  navigateToProjectInput,
  setShowCollaborateModal,
  onAddPhase,
  onSave,
  hasUnsavedChanges = false,
  saving = false
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      {onSave && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={saving || !hasUnsavedChanges}
          className="gap-1.5"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </Button>
      )}
      
      <Button
        variant="default"
        size="sm"
        onClick={() => handleRegenerate(null)}
        disabled={isGenerating}
        className="gap-1.5"
      >
        {isGenerating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RotateCw className="h-3.5 w-3.5" />
        )}
        <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
      </Button>
      
      {onAddPhase && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAddPhase}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Phase</span>
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            <span>Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowCollaborateModal(true)}>
            <Users className="h-4 w-4 mr-2" />
            <span>Collaborate</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={navigateToProjectInput}>
            <Edit className="h-4 w-4 mr-2" />
            <span>Edit Source Data</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            <span>Download PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Printer className="h-4 w-4 mr-2" />
            <span>Print</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}