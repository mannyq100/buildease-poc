import React from 'react';
import { Expense } from '@/types/expenses';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Eye,
  Receipt,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Trash,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpensesTableProps {
  expenses: Expense[];
  selectedExpenses: number[];
  toggleExpenseSelection: (id: number, selected: boolean) => void;
  isAllSelected: boolean;
  setIsAllSelected: (selected: boolean) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  viewExpenseDetails: (expense: Expense) => void;
  handleUpdateExpenseStatus: (id: number, status: 'approved' | 'pending' | 'rejected') => void;
  handleDeleteExpense: (id: number) => void;
  setIsReceiptPreviewOpen: (open: boolean) => void;
  filteredExpenses: Expense[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

/**
 * Table component for displaying expense data with actions
 */
export function ExpensesTable({
  expenses,
  selectedExpenses,
  toggleExpenseSelection,
  isAllSelected,
  setIsAllSelected,
  formatCurrency,
  formatDate,
  viewExpenseDetails,
  handleUpdateExpenseStatus,
  handleDeleteExpense,
  setIsReceiptPreviewOpen,
  filteredExpenses,
  currentPage,
  totalPages,
  setCurrentPage
}: ExpensesTableProps) {
  return (
    <div className="overflow-hidden border rounded-md shadow-sm">
      <div className="px-6 py-4 flex justify-between items-center border-b">
        <h3 className="text-xl font-bold">Expense Transactions</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={isAllSelected && filteredExpenses.length > 0} 
                  onCheckedChange={(checked: boolean) => setIsAllSelected(checked)}
                  aria-label="Select all expenses"
                />
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                  No expenses found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map(expense => (
                <TableRow key={expense.id} className="group hover:bg-gray-50 dark:hover:bg-slate-800/30">
                  <TableCell>
                    <Checkbox 
                      checked={selectedExpenses.includes(expense.id)}
                      onCheckedChange={(checked: boolean) => 
                        toggleExpenseSelection(expense.id, checked as boolean)
                      }
                      aria-label={`Select expense ${expense.description}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {expense.receiptUploaded && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-blue-500">
                              <Receipt className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Receipt available</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <span className="truncate max-w-[200px]">{expense.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal text-xs">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal text-xs">
                      {expense.project}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        "font-normal",
                        expense.status === 'approved' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200",
                        expense.status === 'pending' && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200",
                        expense.status === 'rejected' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200"
                      )}
                    >
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewExpenseDetails(expense)}
                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View expense</span>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-700"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => expense.receiptUploaded && setIsReceiptPreviewOpen(true)}>
                            <Receipt className="h-4 w-4 mr-2" />
                            View Receipt
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateExpenseStatus(expense.id, 'approved')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateExpenseStatus(expense.id, 'rejected')}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 