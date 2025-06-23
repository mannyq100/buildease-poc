/**
 * Compound Data Table System
 * Reusable, accessible data table with sorting, filtering, and pagination
 * Supports compound component pattern for maximum flexibility
 */

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/core/ui';

// Context for table state
interface TableContextValue<T = any> {
  data: T[];
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  searchTerm: string;
  pageSize: number;
  currentPage: number;
  setSortColumn: (column: string | null) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setSearchTerm: (term: string) => void;
  setPageSize: (size: number) => void;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  filteredData: T[];
  paginatedData: T[];
}

const TableContext = createContext<TableContextValue | null>(null);

// Hook to use table context
function useTableContext<T = any>() {
  const context = useContext(TableContext) as TableContextValue<T> | null;
  if (!context) {
    throw new Error('Table components must be used within a DataTable');
  }
  return context;
}

// Main DataTable component
interface DataTableProps<T> {
  data: T[];
  searchKeys?: (keyof T)[];
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
  defaultPageSize?: number;
  className?: string;
  children: React.ReactNode;
}

function DataTable<T extends Record<string, any>>({
  data,
  searchKeys = [],
  defaultSortColumn = null,
  defaultSortDirection = 'asc',
  defaultPageSize = 10,
  className,
  children
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm || searchKeys.length === 0) return data;
    
    return data.filter(item =>
      searchKeys.some(key => {
        const value = item[key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, searchKeys]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate sorted data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortColumn, sortDirection, pageSize]);

  const contextValue: TableContextValue<T> = {
    data,
    sortColumn,
    sortDirection,
    searchTerm,
    pageSize,
    currentPage,
    setSortColumn,
    setSortDirection,
    setSearchTerm,
    setPageSize,
    setCurrentPage,
    totalPages,
    filteredData,
    paginatedData
  };

  return (
    <TableContext.Provider value={contextValue}>
      <div className={cn('data-table space-y-4', className)}>
        {children}
      </div>
    </TableContext.Provider>
  );
}

// TableToolbar component
interface TableToolbarProps {
  searchPlaceholder?: string;
  showSearch?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function TableToolbar({ 
  searchPlaceholder = 'Search...', 
  showSearch = true,
  className,
  children 
}: TableToolbarProps) {
  const { searchTerm, setSearchTerm, filteredData, data } = useTableContext();

  return (
    <div className={cn(
      'table-toolbar flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700',
      className
    )}>
      <div className="flex items-center gap-4 flex-1">
        {showSearch && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-10"
            />
          </div>
        )}
        
        {searchTerm && (
          <Badge variant="secondary" className="text-xs">
            {filteredData.length} of {data.length} results
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

// TableHeader component
interface TableHeaderProps {
  className?: string;
  children: React.ReactNode;
}

function TableHeader({ className, children }: TableHeaderProps) {
  return (
    <thead className={cn('table-header bg-gray-50 dark:bg-gray-800/50', className)}>
      <tr>{children}</tr>
    </thead>
  );
}

// TableHeaderCell component
interface TableHeaderCellProps {
  column?: string;
  sortable?: boolean;
  className?: string;
  children: React.ReactNode;
}

function TableHeaderCell({ 
  column, 
  sortable = false, 
  className, 
  children 
}: TableHeaderCellProps) {
  const { sortColumn, sortDirection, setSortColumn, setSortDirection } = useTableContext();
  
  const isSorted = sortColumn === column;
  const isAsc = isSorted && sortDirection === 'asc';

  const handleSort = useCallback(() => {
    if (!sortable || !column) return;
    
    if (isSorted) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortable, column, isSorted, sortDirection, setSortColumn, setSortDirection]);

  return (
    <th className={cn(
      'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
      sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
      className
    )}>
      <div 
        className="flex items-center gap-2"
        onClick={handleSort}
      >
        {children}
        {sortable && (
          <div className="flex flex-col">
            <ChevronUp className={cn(
              'h-3 w-3 transition-colors',
              isSorted && isAsc ? 'text-[#2B6CB0]' : 'text-gray-300'
            )} />
            <ChevronDown className={cn(
              'h-3 w-3 -mt-1 transition-colors',
              isSorted && !isAsc ? 'text-[#2B6CB0]' : 'text-gray-300'
            )} />
          </div>
        )}
      </div>
    </th>
  );
}

// TableBody component
interface TableBodyProps {
  className?: string;
  children: React.ReactNode;
}

function TableBody({ className, children }: TableBodyProps) {
  return (
    <tbody className={cn(
      'table-body divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800',
      className
    )}>
      {children}
    </tbody>
  );
}

// TableRow component
interface TableRowProps {
  index?: number;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

function TableRow({ index = 0, className, onClick, children }: TableRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        'table-row transition-colors',
        onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.tr>
  );
}

// TableCell component
interface TableCellProps {
  className?: string;
  children: React.ReactNode;
}

function TableCell({ className, children }: TableCellProps) {
  return (
    <td className={cn(
      'px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white',
      className
    )}>
      {children}
    </td>
  );
}

// TablePagination component
interface TablePaginationProps {
  className?: string;
}

function TablePagination({ className }: TablePaginationProps) {
  const { 
    currentPage, 
    totalPages, 
    pageSize, 
    setCurrentPage, 
    setPageSize,
    filteredData 
  } = useTableContext();

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredData.length);

  return (
    <div className={cn(
      'table-pagination flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700',
      className
    )}>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {startIndex} to {endIndex} of {filteredData.length} results
      </div>

      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="px-3 py-1 text-sm">
            {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// TableContainer component
interface TableContainerProps {
  className?: string;
  children: React.ReactNode;
}

function TableContainer({ className, children }: TableContainerProps) {
  return (
    <div className={cn(
      'table-container overflow-hidden border rounded-lg',
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {children}
        </table>
      </div>
    </div>
  );
}

// Compose the compound component
const Table = Object.assign(DataTable, {
  Toolbar: TableToolbar,
  Container: TableContainer,
  Header: TableHeader,
  HeaderCell: TableHeaderCell,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  Pagination: TablePagination
});

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
};

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
};