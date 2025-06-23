/**
 * BuildEase Plan Icon Standards
 * Standardized iconography for construction plan components
 * Ensures consistent sizing, styling, and construction industry appropriateness
 */

import {
  // Navigation Icons
  Home,
  Calendar,
  Package,
  DollarSign,
  Users,
  FileText,
  
  // Action Icons
  RefreshCw,
  Save,
  CheckCircle,
  Share2,
  Loader2,
  MoreHorizontal,
  Printer,
  Download,
  
  // Form & Editing Icons
  Plus,
  Edit,
  Trash,
  ChevronDown,
  ChevronRight,
  Clock,
  
  // Status & Progress Icons
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Construction,
  
  // Construction Specific Icons
  HardHat,
  Wrench,
  Hammer,
  Building,
  MapPin,
  Ruler,
  
  // UI Icons
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  
  type LucideIcon
} from 'lucide-react';

// Standard icon sizes for BuildEase components
export const ICON_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5', 
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
  '2xl': 'h-8 w-8'
} as const;

// BuildEase themed icon colors
export const ICON_COLORS = {
  primary: 'text-buildease-blue-600 dark:text-buildease-blue-400',
  secondary: 'text-buildease-earth-600 dark:text-buildease-earth-400',
  accent: 'text-buildease-orange-600 dark:text-buildease-orange-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-buildease-orange-600 dark:text-buildease-orange-400',
  danger: 'text-red-600 dark:text-red-400',
  muted: 'text-gray-500 dark:text-gray-400',
  foreground: 'text-gray-700 dark:text-gray-300'
} as const;

// Plan navigation icons
export const PLAN_NAV_ICONS = {
  overview: Home,
  timeline: Calendar,
  materials: Package,
  budget: DollarSign,
  team: Users,
  documents: FileText
} as const;

// Plan action icons
export const PLAN_ACTION_ICONS = {
  save: Save,
  regenerate: RefreshCw,
  distribute: Share2,
  print: Printer,
  export: Download,
  more: MoreHorizontal,
  loading: Loader2,
  complete: CheckCircle
} as const;

// Status icons with BuildEase construction theme
export const STATUS_ICONS = {
  pending: Clock,
  'in-progress': Construction,
  completed: CheckCircle2,
  delayed: AlertCircle,
  warning: AlertCircle,
  error: XCircle,
  info: Info
} as const;

// Construction-specific icons
export const CONSTRUCTION_ICONS = {
  hardhat: HardHat,
  tools: Wrench,
  hammer: Hammer,
  building: Building,
  location: MapPin,
  measure: Ruler
} as const;

// Form and editing icons
export const FORM_ICONS = {
  add: Plus,
  edit: Edit,
  delete: Trash,
  expand: ChevronDown,
  collapse: ChevronRight,
  search: Search,
  filter: Filter,
  sortAsc: SortAsc,
  sortDesc: SortDesc,
  show: Eye,
  hide: EyeOff
} as const;

// Utility function to get icon with standardized BuildEase styling
export const getIconWithStyle = (
  IconComponent: LucideIcon,
  size: keyof typeof ICON_SIZES = 'md',
  color: keyof typeof ICON_COLORS = 'foreground',
  additionalClasses = ''
) => {
  const sizeClass = ICON_SIZES[size];
  const colorClass = ICON_COLORS[color];
  const className = `${sizeClass} ${colorClass} ${additionalClasses}`.trim();
  
  return { IconComponent, className };
};

// Utility function for status-specific icon styling
export const getStatusIcon = (status: string, size: keyof typeof ICON_SIZES = 'md') => {
  const statusKey = status.toLowerCase().replace(/\s+/g, '-') as keyof typeof STATUS_ICONS;
  const IconComponent = STATUS_ICONS[statusKey] || STATUS_ICONS.info;
  
  let color: keyof typeof ICON_COLORS;
  switch (statusKey) {
    case 'pending':
      color = 'primary';
      break;
    case 'in-progress':
      color = 'accent';
      break;
    case 'completed':
      color = 'success';
      break;
    case 'delayed':
    case 'error':
      color = 'danger';
      break;
    case 'warning':
      color = 'warning';
      break;
    default:
      color = 'muted';
  }
  
  return getIconWithStyle(IconComponent, size, color);
};

// Construction industry themed icon combinations
export const CONSTRUCTION_THEMED_ICONS = {
  phase: { icon: Building, color: 'primary' as const },
  task: { icon: CheckCircle2, color: 'secondary' as const },
  material: { icon: Package, color: 'accent' as const },
  team: { icon: HardHat, color: 'primary' as const },
  budget: { icon: DollarSign, color: 'success' as const },
  timeline: { icon: Calendar, color: 'primary' as const },
  safety: { icon: AlertCircle, color: 'warning' as const },
  tools: { icon: Wrench, color: 'secondary' as const }
} as const;

export type IconSize = keyof typeof ICON_SIZES;
export type IconColor = keyof typeof ICON_COLORS;