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
  CheckCircle,
  Download,
  Edit,
  FileText,
  Loader2,
  Plus,
  Printer,
  RotateCw,
  Save,
  Share2,
  Users
} from "lucide-react"

interface ActionButtonsProps {
  isGenerating?: boolean
  handleRegenerate?: (data: ProjectData | null) => void
  navigateToProjectInput?: () => void
  setShowCollaborateModal?: (value: boolean) => void
  onAddPhase?: () => void
  onSave?: () => void
  hasUnsavedChanges?: boolean
  saving?: boolean
  onSaveDraft?: () => void
  onFinalize?: () => void
}

export function ActionButtons({
  isGenerating = false,
  handleRegenerate,
  navigateToProjectInput,
  setShowCollaborateModal,
  onAddPhase,
  onSave,
  hasUnsavedChanges = false,
  saving = false,
  onSaveDraft,
  onFinalize
}: ActionButtonsProps) {
  if (onSaveDraft || onFinalize) {
    return (
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        {saving ? (
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg" disabled>
            <Loader2 className="h-6 w-6 animate-spin" />
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
                <Save className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {onSaveDraft && (
                <DropdownMenuItem onClick={onSaveDraft}>
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Save as Draft</span>
                </DropdownMenuItem>
              )}
              {onFinalize && (
                <DropdownMenuItem onClick={onFinalize}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Finalize Plan</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }

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
      
      {handleRegenerate && (
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
      )}
      
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
      
      {navigateToProjectInput && setShowCollaborateModal && (
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
      )}
    </div>
  )
}