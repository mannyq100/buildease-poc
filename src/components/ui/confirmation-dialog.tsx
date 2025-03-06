import * as React from "react"
import { AlertTriangle, Info, X, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "./button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { cn } from "@/lib/utils"

export type ConfirmationDialogType = "danger" | "warning" | "info" | "success";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  type?: ConfirmationDialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  type = "danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  children,
  icon,
  className,
}) => {
  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };
  
  // Default icon based on type
  const defaultIcon = React.useMemo(() => {
    switch (type) {
      case "danger":
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "info":
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  }, [type]);

  // Get button variant based on type
  const getButtonVariant = () => {
    switch (type) {
      case "danger":
        return "destructive";
      case "warning":
        return "warning";
      case "success":
        return "success";
      case "info":
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "sm:max-w-[425px]",
          type === "danger" && "border-destructive/20",
          type === "warning" && "border-yellow-500/20",
          type === "success" && "border-green-500/20",
          type === "info" && "border-blue-500/20",
          className
        )}
      >
        <DialogHeader className="flex flex-row items-start gap-4">
          <div className="mt-1">
            {icon || defaultIcon}
          </div>
          <div className="flex-1">
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription className="mt-1.5">
                {description}
              </DialogDescription>
            )}
          </div>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        {children && <div className="px-1 py-2">{children}</div>}
        
        <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={getButtonVariant()}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ConfirmationDialog }; 