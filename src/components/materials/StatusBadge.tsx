import { Badge } from '@/components/ui/badge'
import { Material, StatusVariant, statusConfig } from '@/types/materials'

interface StatusBadgeProps {
  status: Material['status']
}

/**
 * Displays a badge with appropriate styling based on material status
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant}>
      {config.text}
    </Badge>
  )
} 