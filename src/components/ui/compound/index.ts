/**
 * Compound Components Index
 * Centralized exports for all compound component systems
 * Provides a clean API for importing compound components
 */

// Tab System
export {
  Tabs,
  TabSystem,
  TabList,
  TabTrigger,
  TabContent,
  TabPanels
} from './TabSystem';

export type {
  TabSystemProps,
  TabListProps,
  TabTriggerProps,
  TabContentProps,
  TabPanelsProps
} from './TabSystem';

// Modal System
export {
  Modal,
  ModalSystem,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalActions,
  useModalState
} from './ModalSystem';

export type {
  ModalSystemProps,
  ModalHeaderProps,
  ModalTitleProps,
  ModalDescriptionProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalActionsProps
} from './ModalSystem';

// Form System
export {
  Form,
  FormSystem,
  FormSection,
  FormField,
  FormInput,
  FormActions,
  FormMessage,
  useFormValidation
} from './FormSystem';

export type {
  FormSystemProps,
  FormSectionProps,
  FormFieldProps,
  FormInputProps,
  FormActionsProps,
  FormMessageProps
} from './FormSystem';

// Data Table System
export {
  Table,
  DataTable,
  TableToolbar,
  TableContainer,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TablePagination
} from './DataTable';

export type {
  DataTableProps,
  TableToolbarProps,
  TableHeaderProps,
  TableHeaderCellProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  TablePaginationProps,
  TableContainerProps
} from './DataTable';