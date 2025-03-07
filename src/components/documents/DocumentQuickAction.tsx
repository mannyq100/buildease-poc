/**
 * DocumentQuickAction component for document page quick actions
 */
import React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface DocumentQuickActionProps extends Omit<ButtonProps, 'children'> {
  /**
   * Icon to display in the button
   */
  icon: React.ReactNode
  
  /**
   * Label for the tooltip and accessibility
   */
  label: string
  
  /**
   * Optional badge count to show on the button
   */
  badgeCount?: number
  
  /**
   * Optional click handler
   */
  onClick?: () => void
  
  /**
   * Variant of the button
   */
  variant?: ButtonProps['variant']
}

export function DocumentQuickAction({
  icon,
  label,
  badgeCount,
  onClick,
  variant = 'ghost',
  className,
  ...props
}: DocumentQuickActionProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size="icon"
            onClick={onClick}
            className={cn('relative', className)}
            aria-label={label}
            {...props}
          >
            {icon}
            {badgeCount !== undefined && badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-red-500 text-white">
                {badgeCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 