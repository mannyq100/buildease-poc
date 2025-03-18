import React from 'react';
import { Expense } from '@/types/expenses';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, FileUp, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseDialogProps {
  mode: 'add' | 'view';
  open: boolean;
  setOpen: (open: boolean) => void;
  expense?: Expense;
  newExpense?: {
    description: string;
    amount: number;
    date: string;
    category: string;
    project: string;
    notes: string;
  };
  setNewExpense?: (expense: any) => void;
  handleAddExpense?: () => void;
  formatCurrency?: (amount: number) => string;
  formatDate?: (date: string) => string;
  EXPENSE_CATEGORIES: string[];
  EXPENSE_PROJECTS: string[];
}

/**
 * Dialog for adding or viewing expense details
 */
export function ExpenseDialog({
  mode,
  open,
  setOpen,
  expense,
  newExpense,
  setNewExpense,
  handleAddExpense,
  formatCurrency,
  formatDate,
  EXPENSE_CATEGORIES,
  EXPENSE_PROJECTS
}: ExpenseDialogProps) {
  
  // View expense mode
  if (mode === 'view' && expense) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>
              View complete details of this expense.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{expense.description}</h3>
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Amount</div>
                <div className="text-xl font-medium flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-1" />
                  {formatCurrency(expense.amount)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Date</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  {formatDate(expense.date)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Category</div>
                <Badge variant="outline" className="font-normal text-sm">
                  {expense.category}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Project</div>
                <Badge variant="outline" className="font-normal text-sm">
                  {expense.project}
                </Badge>
              </div>
            </div>
            
            {expense.notes && (
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Notes</div>
                <div className="p-3 bg-gray-50 rounded-md dark:bg-gray-800">
                  {expense.notes}
                </div>
              </div>
            )}
            
            {expense.receiptUploaded && (
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Receipt</div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md dark:bg-gray-800">
                  <Receipt className="h-5 w-5 text-blue-500" />
                  <span>Receipt attached</span>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View Receipt
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Add expense mode
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of the new expense below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter expense description"
              value={newExpense?.description || ''}
              onChange={(e) => setNewExpense({
                ...newExpense,
                description: e.target.value
              })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-10"
                  value={newExpense?.amount || ''}
                  onChange={(e) => setNewExpense({
                    ...newExpense,
                    amount: parseFloat(e.target.value)
                  })}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newExpense?.date || ''}
                onChange={(e) => setNewExpense({
                  ...newExpense,
                  date: e.target.value
                })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newExpense?.category || ''}
                onValueChange={(value) => setNewExpense({
                  ...newExpense,
                  category: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={newExpense?.project || ''}
                onValueChange={(value) => setNewExpense({
                  ...newExpense,
                  project: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_PROJECTS.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Add additional details about this expense"
              value={newExpense?.notes || ''}
              onChange={(e) => setNewExpense({
                ...newExpense,
                notes: e.target.value
              })}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="receipt">Receipt</Label>
            <div className="relative">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center py-6 border-dashed"
              >
                <FileUp className="h-5 w-5 mr-2" />
                <span>Upload Receipt</span>
                <Input
                  id="receipt"
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddExpense}>Add Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 