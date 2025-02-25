import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  MoreHorizontal,
  ChevronDown,
  Edit,
  Trash,
  Copy,
  Share,
  Download,
  Eye,
  Ban,
  Star,
  CornerUpRight,
  Plus,
  X,
  AlertCircle,
  Archive,
  Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  shortcut?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning';
  disabled?: boolean;
  className?: string;
  submenu?: ActionItem[];
  href?: string;
  divider?: boolean;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  };
}

interface ActionMenuProps {
  actions: ActionItem[];
  label?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
  menuTrigger?: 'dots' | 'button' | 'custom';
  customTrigger?: React.ReactNode;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  showItemIcons?: boolean;
  closeOnSelect?: boolean;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  actions,
  label,
  align = 'end',
  side = 'bottom',
  sideOffset = 4,
  className,
  buttonClassName,
  contentClassName,
  menuTrigger = 'dots',
  customTrigger,
  buttonText,
  buttonIcon,
  buttonVariant = 'outline',
  buttonSize = 'icon',
  showItemIcons = true,
  closeOnSelect = true
}) => {
  const [open, setOpen] = useState(false);
  
  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Render the appropriate trigger based on the menuTrigger prop
  const renderTrigger = () => {
    switch (menuTrigger) {
      case 'dots':
        return (
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-8 w-8",
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100",
              buttonClassName
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        );
      case 'button':
        return (
          <Button 
            variant={buttonVariant} 
            size={buttonSize}
            className={cn(buttonClassName)}
          >
            {buttonIcon && (
              <span className="mr-2">{buttonIcon}</span>
            )}
            {buttonText || 'Actions'}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        );
      case 'custom':
        return customTrigger;
      default:
        return (
          <Button 
            variant="ghost" 
            size="icon"
            className={cn(buttonClassName)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        );
    }
  };
  
  // Render a single menu item
  const renderMenuItem = (action: ActionItem, index: number) => {
    if (action.divider) {
      return <DropdownMenuSeparator key={`divider-${index}`} />;
    }
    
    // Determine the variant-based styling
    const getVariantStyles = (variant?: string) => {
      switch (variant) {
        case 'destructive':
          return isDarkMode 
            ? 'text-red-400 hover:text-red-300 focus:bg-red-900/20 hover:bg-red-900/20' 
            : 'text-red-600 hover:text-red-700 focus:bg-red-100 hover:bg-red-100';
        case 'success':
          return isDarkMode 
            ? 'text-green-400 hover:text-green-300 focus:bg-green-900/20 hover:bg-green-900/20' 
            : 'text-green-600 hover:text-green-700 focus:bg-green-100 hover:bg-green-100';
        case 'warning':
          return isDarkMode 
            ? 'text-yellow-400 hover:text-yellow-300 focus:bg-yellow-900/20 hover:bg-yellow-900/20' 
            : 'text-yellow-600 hover:text-yellow-700 focus:bg-yellow-100 hover:bg-yellow-100';
        default:
          return '';
      }
    };
    
    // If this action has a submenu, render it as a submenu
    if (action.submenu && action.submenu.length > 0) {
      return (
        <DropdownMenuSub key={`${action.label}-${index}`}>
          <DropdownMenuSubTrigger 
            className={cn(
              getVariantStyles(action.variant),
              action.className,
              action.disabled && "opacity-50 pointer-events-none"
            )}
          >
            {showItemIcons && action.icon && (
              <span className="mr-2">{action.icon}</span>
            )}
            <span>{action.label}</span>
            {action.badge && (
              <Badge
                variant={action.badge.variant || 'secondary'}
                className="ml-auto mr-2 px-1 text-xs"
              >
                {action.badge.text}
              </Badge>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent 
              className={cn(
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
                contentClassName
              )}
            >
              {action.submenu.map((subItem, subIndex) => 
                renderMenuItem(subItem, subIndex)
              )}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    }
    
    return (
      <DropdownMenuItem 
        key={`${action.label}-${index}`}
        onClick={(e) => {
          if (action.onClick) {
            e.preventDefault();
            action.onClick();
            if (closeOnSelect) setOpen(false);
          }
        }}
        className={cn(
          getVariantStyles(action.variant),
          action.className,
          action.disabled && "opacity-50 pointer-events-none"
        )}
        disabled={action.disabled}
        asChild={Boolean(action.href)}
      >
        {action.href ? (
          <a href={action.href}>
            {showItemIcons && action.icon && (
              <span className="mr-2">{action.icon}</span>
            )}
            <span>{action.label}</span>
            {action.badge && (
              <Badge
                variant={action.badge.variant || 'secondary'}
                className="ml-auto mr-2 px-1 text-xs"
              >
                {action.badge.text}
              </Badge>
            )}
            {action.shortcut && (
              <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
            )}
          </a>
        ) : (
          <>
            {showItemIcons && action.icon && (
              <span className="mr-2">{action.icon}</span>
            )}
            <span>{action.label}</span>
            {action.badge && (
              <Badge
                variant={action.badge.variant || 'secondary'}
                className="ml-auto mr-2 px-1 text-xs"
              >
                {action.badge.text}
              </Badge>
            )}
            {action.shortcut && (
              <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
            )}
          </>
        )}
      </DropdownMenuItem>
    );
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className={cn("inline-flex", className)}>
          {renderTrigger()}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        side={side} 
        sideOffset={sideOffset}
        className={cn(
          "w-56",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
          contentClassName
        )}
      >
        {label && (
          <>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          {actions.map((action, index) => renderMenuItem(action, index))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const defaultActions: ActionItem[] = [
  {
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    onClick: () => console.log('Edit clicked'),
    shortcut: '⌘E',
  },
  {
    label: 'Duplicate',
    icon: <Copy className="h-4 w-4" />,
    onClick: () => console.log('Duplicate clicked'),
  },
  {
    label: 'Share',
    icon: <Share className="h-4 w-4" />,
    submenu: [
      {
        label: 'Copy Link',
        icon: <Copy className="h-4 w-4" />,
        onClick: () => console.log('Copy Link clicked'),
      },
      {
        label: 'Email',
        icon: <Mail className="h-4 w-4" />,
        onClick: () => console.log('Email clicked'),
      },
    ],
  },
  { divider: true },
  {
    label: 'Archive',
    icon: <Archive className="h-4 w-4" />,
    variant: 'secondary',
    onClick: () => console.log('Archive clicked'),
  },
  {
    label: 'Delete',
    icon: <Trash className="h-4 w-4" />,
    variant: 'destructive',
    onClick: () => console.log('Delete clicked'),
    shortcut: '⌘⌫',
  },
];

// Convenient icon mapping for common actions
export const ActionIcons = {
  edit: <Edit className="h-4 w-4" />,
  delete: <Trash className="h-4 w-4" />,
  copy: <Copy className="h-4 w-4" />,
  share: <Share className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
  view: <Eye className="h-4 w-4" />,
  block: <Ban className="h-4 w-4" />,
  favorite: <Star className="h-4 w-4" />,
  reply: <CornerUpRight className="h-4 w-4" />,
  add: <Plus className="h-4 w-4" />,
  cancel: <X className="h-4 w-4" />,
  alert: <AlertCircle className="h-4 w-4" />,
  archive: <Archive className="h-4 w-4" />,
}; 