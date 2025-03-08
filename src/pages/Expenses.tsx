import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  PieChart,
  TrendingUp,
  Calendar,
  Building,
  Wallet,
  CreditCard,
  Receipt,
  FileText,
  Edit,
  Trash,
  Download,
  ArrowDown,
  ArrowUp,
  AlertCircle,
  Upload,
  CheckCircle,
  FilePlus,
  Save,
  FileDown,
  HelpCircle,
  Image,
  ChevronUp,
  ChevronDown,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

// Types
import { 
  Expense, 
  TopCategory, 
  BudgetData, 
  TimeSeriesDataPoint,
  ExpenseInsight 
} from '@/types/expenses';

// Mock Data
import { 
  initialExpenses,
  EXPENSE_CATEGORIES,
  EXPENSE_PROJECTS,
  EXPENSE_PHASES,
  EXPENSE_STATUSES,
  EXPORT_OPTIONS,
  CHART_COLORS
} from '@/data/mock/expenses/expensesData';
import { getProjectBudget } from '@/data/mock/expenses/budgetData';

// Utilities
import {
  formatCurrency,
  formatDate,
  calculateExpensesByCategory,
  findTopCategory,
  prepareTimeSeriesData,
  prepareProjectChartData,
  calculateGrowthInsights
} from '@/utils/expenseUtils';

/**
 * Expenses page component
 * Manages and displays expense data with filtering, analytics, and CRUD operations
 */
function Expenses() {
  const navigate = useNavigate();
  
  // State management
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(EXPENSE_CATEGORIES[0]);
  const [projectFilter, setProjectFilter] = useState(EXPENSE_PROJECTS[0]);
  const [phaseFilter, setPhaseFilter] = useState(EXPENSE_PHASES[0]);
  const [statusFilter, setStatusFilter] = useState(EXPENSE_STATUSES[0]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [viewExpenseDialogOpen, setViewExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [dateRange, setDateRange] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);
  const [isBatchActionDialogOpen, setIsBatchActionDialogOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<'approve' | 'reject' | 'delete' | ''>('');
  const [budgetViewMode, setBudgetViewMode] = useState<'overview' | 'breakdown'>('overview');
  const [exportExtraOptions, setExportExtraOptions] = useState({
    includeReceipts: false,
    includeVendorInfo: true,
    dateFormat: 'YYYY-MM-DD',
  });
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    project: '',
    phase: '',
    paymentMethod: '',
    vendor: '',
    receiptUploaded: false,
    status: 'pending' as const
  });
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter expenses based on search query and filters
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === EXPENSE_CATEGORIES[0] || 
      expense.category === categoryFilter;
    
    const matchesProject = 
      projectFilter === EXPENSE_PROJECTS[0] || 
      expense.project === projectFilter;
    
    const matchesPhase = 
      phaseFilter === EXPENSE_PHASES[0] || 
      expense.phase === phaseFilter;
    
    const matchesStatus = 
      statusFilter === EXPENSE_STATUSES[0] || 
      expense.status === statusFilter;
    
    // Handle date range filtering
    let matchesDateRange = true;
    const expenseDate = new Date(expense.date);
    const today = new Date();
    
    if (dateRange === 'last7') {
      const last7Days = new Date(today);
      last7Days.setDate(today.getDate() - 7);
      matchesDateRange = expenseDate >= last7Days;
    } else if (dateRange === 'last30') {
      const last30Days = new Date(today);
      last30Days.setDate(today.getDate() - 30);
      matchesDateRange = expenseDate >= last30Days;
    } else if (dateRange === 'thisMonth') {
      matchesDateRange = 
        expenseDate.getMonth() === today.getMonth() && 
        expenseDate.getFullYear() === today.getFullYear();
    }
    
    return matchesSearch && matchesCategory && matchesProject && matchesPhase && matchesStatus && matchesDateRange;
  });

  // Calculate derived data
  const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  const expensesByCategory = calculateExpensesByCategory(filteredExpenses);
  const topCategory = findTopCategory(expensesByCategory);
  const categoryChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));
  const timeSeriesData = prepareTimeSeriesData(filteredExpenses);
  const projectChartData = prepareProjectChartData(filteredExpenses);
  const growthInsights = calculateGrowthInsights(expenses);

  // Update selected state when isAllSelected changes
  useEffect(() => {
    setExpenses(prevExpenses => 
      prevExpenses.map(expense => ({
        ...expense,
        selected: isAllSelected
      }))
    );
    
    if (isAllSelected) {
      setSelectedExpenses(filteredExpenses.map(e => e.id));
    } else {
      setSelectedExpenses([]);
    }

  }, [isAllSelected, filteredExpenses]);

  // View expense details
  const viewExpenseDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setViewExpenseDialogOpen(true);
  };

  // Toggle expense selection
  const toggleExpenseSelection = (id: number, selected: boolean) => {
    setExpenses(prevExpenses => 
      prevExpenses.map(expense => 
        expense.id === id ? { ...expense, selected } : expense
      )
    );
    
    setSelectedExpenses(prevSelectedExpenses => {
      if (selected) {
        return [...prevSelectedExpenses, id];
      } else {
        return prevSelectedExpenses.filter(expenseId => expenseId !== id);
      }
    });
  };

  // Handle adding a new expense
  const handleAddExpense = () => {
    const id = Math.max(...expenses.map(e => e.id)) + 1;
    
    const newExpenseItem: Expense = {
      ...newExpense,
      id,
      amount: parseFloat(newExpense.amount),
      status: 'pending',
      receiptUploaded: newExpense.receiptUploaded,
      receiptUrl: newExpense.receiptUploaded ? '/api/placeholder/500/300' : undefined
    };
    
    setExpenses([newExpenseItem, ...expenses]);
    setNewExpense({
      description: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      project: '',
      phase: '',
      paymentMethod: '',
      vendor: '',
      receiptUploaded: false,
      status: 'pending' as const
    });
    setIsAddExpenseOpen(false);
  };

  // Handle updating expense status
  const handleUpdateExpenseStatus = (id: number, newStatus: 'approved' | 'pending' | 'rejected') => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, status: newStatus } : expense
    ));
  };

  // Handle deleting an expense
  const handleDeleteExpense = (id: number) => {
    setExpenseToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm expense deletion
  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      setExpenses(expenses.filter(expense => expense.id !== expenseToDelete));
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  // Handle batch actions
  const handleBatchAction = (action: 'approve' | 'reject' | 'delete') => {
    setBatchAction(action);
    setIsBatchActionDialogOpen(true);
  };

  // Confirm batch action
  const confirmBatchAction = () => {
    if (batchAction === 'delete') {
      setExpenses(expenses.filter(expense => !selectedExpenses.includes(expense.id)));
    } else if (batchAction === 'approve' || batchAction === 'reject') {
      setExpenses(expenses.map(expense => 
        selectedExpenses.includes(expense.id) 
          ? { ...expense, status: batchAction === 'approve' ? 'approved' : 'rejected' } 
          : expense
      ));
    }
    
    setIsBatchActionDialogOpen(false);
    setBatchAction('');
    setSelectedExpenses([]);
    setIsAllSelected(false);
  };

  // Export data
  const handleExport = () => {
    // In a real application, this would create and download a file
    setIsExportDialogOpen(false);
    
    // Simulating export success
    setTimeout(() => {
      alert(`Data exported successfully as ${exportFormat.toUpperCase()}`);
    }, 1000);
  };

  // Get budget data for the current project
  const budget = getProjectBudget(projectFilter);
  const budgetProgress = (budget.spent / budget.total) * 100;

  // Generate budget allocation chart data
  const budgetAllocationChartData = budget.allocations?.map(allocation => ({
    name: allocation.category,
    budget: allocation.amount,
    spent: allocation.spent,
    remaining: allocation.amount - allocation.spent
  }));

  // Generate spending insights
  const generateCategoryInsights = (): ExpenseInsight[] => {
    const insights: ExpenseInsight[] = [];
    
    // Get categories with highest spending
    const sortedCategories = Object.entries(expensesByCategory)
      .sort(([, amountA], [, amountB]) => amountB - amountA);
    
    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      insights.push({
        title: 'Highest Spending',
        description: `${topCategory} accounts for ${((topAmount / totalExpenses) * 100).toFixed(1)}% of your expenses`,
        icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
        color: 'blue'
      });
    }
    
    // Check for categories with no spending
    const unusedCategories = EXPENSE_CATEGORIES
      .filter(c => c !== EXPENSE_CATEGORIES[0])
      .filter(category => !Object.keys(expensesByCategory).includes(category));
    
    if (unusedCategories.length > 0) {
      insights.push({
        title: 'Unused Categories',
        description: `No expenses in ${unusedCategories.length} categories including ${unusedCategories[0]}`,
        icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
        color: 'amber'
      });
    }
    
    // Check for rapid growth
    if (growthInsights.growthRate > 20) {
      insights.push({
        title: 'Rapid Spending Growth',
        description: `Spending increased by ${growthInsights.growthRate.toFixed(1)}% compared to last month`,
        icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
        color: 'red'
      });
    }
    
    return insights;
  };

  const categoryInsights = generateCategoryInsights();

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader 
          title="Expenses"
          description="Track, analyze and manage project expenses"
          icon={<DollarSign className="h-8 w-8" />}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                className="bg-white hover:bg-gray-100 text-blue-700 border border-white/20"
                onClick={() => setIsAddExpenseOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                onClick={() => handleExport()}
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          }
        />
      
        {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={<DollarSign className="h-6 w-6" />}
            color="green"
            subtitle={growthInsights.increasing 
              ? `+${growthInsights.growthRate.toFixed(1)}% vs last month` 
              : `-${Math.abs(growthInsights.growthRate).toFixed(1)}% vs last month`}
          />
          
          <StatCard
            title="Budget Status"
            value={`${Math.round((budget.spent / budget.total) * 100)}%`}
            icon={<Building className="h-6 w-6" />}
            color="blue"
            subtitle={`${formatCurrency(budget.spent)} of ${formatCurrency(budget.total)}`}
          />
          
          <StatCard
            title="Pending Approval"
            value={expenses.filter(e => e.status === 'pending').length}
            icon={<Clock className="h-6 w-6" />}
            color="amber"
            subtitle="expenses"
          />
          
          <StatCard
            title="Top Category"
            value={topCategory?.category || "None"}
            icon={<PieChart className="h-6 w-6" />}
            color="purple"
            subtitle={topCategory?.amount ? formatCurrency(topCategory.amount) : ""}
          />
                </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rest of the content... */}
          <Card className="col-span-1 lg:col-span-3 shadow-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
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
              
              {/* Filter and Search Controls */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search expenses..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
          </div>

                <div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                      {EXPENSE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
              </SelectContent>
            </Select>
                </div>
                
                <div>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                      {EXPENSE_PROJECTS.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
                </div>
                
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                      {EXPENSE_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
              </SelectContent>
            </Select>
                </div>
                
                <div>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="thisMonth">This Month</SelectItem>
                      <SelectItem value="last30">Last 30 Days</SelectItem>
                      <SelectItem value="last7">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
              </div>
              
              {/* Batch Actions */}
              {selectedExpenses.length > 0 && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                    {selectedExpenses.length} expense{selectedExpenses.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="ml-auto flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                      onClick={() => handleBatchAction('approve')}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                      onClick={() => handleBatchAction('reject')}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-gray-600 text-gray-600 hover:bg-gray-50"
                      onClick={() => handleBatchAction('delete')}
                    >
                      <Trash className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                </div>
              </div>
                )}

        {/* Expenses Table */}
              <div className="overflow-x-auto border rounded-md">
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
                    {paginatedExpenses.length === 0 ? (
                  <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                          No expenses found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                      paginatedExpenses.map(expense => (
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
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {Math.min(1 + (currentPage - 1) * itemsPerPage, filteredExpenses.length)} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} expenses
                </div>
                <div className="flex items-center gap-2">
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center justify-center text-sm gap-1">
              <Button 
                variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                      className="h-8 w-8"
              >
                      <ChevronLeft className="h-4 w-4" />
              </Button>
                    
                    <span className="mx-2">Page {currentPage} of {totalPages}</span>
                    
                  <Button 
                variant="outline"
                      size="icon"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8"
                    >
                      <ChevronsRight className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
                  </div>
                  </div>
            </Card>
                  </div>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Record a new expense for your construction project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-3">
              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
              <Input
                id="description"
                placeholder="Enter expense description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full"
                required
              />
                </div>
            </div>
            
              {/* Category */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
              <Select 
                value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                      {EXPENSE_CATEGORIES.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
            </div>
            
              {/* Amount */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-8"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              {/* Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
              />
              </div>
            </div>
            
              {/* Project */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project" className="text-right">
                  Project <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
              <Select 
                value={newExpense.project}
                    onValueChange={(value) => setNewExpense({ ...newExpense, project: value })}
              >
                    <SelectTrigger id="project" className="w-full">
                      <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                      {EXPENSE_PROJECTS.slice(1).map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                </div>
            </div>
            
              {/* Phase */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phase" className="text-right">
                  Phase <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
              <Select 
                value={newExpense.phase}
                    onValueChange={(value) => setNewExpense({ ...newExpense, phase: value })}
              >
                    <SelectTrigger id="phase" className="w-full">
                      <SelectValue placeholder="Select a phase" />
                </SelectTrigger>
                <SelectContent>
                      {EXPENSE_PHASES.slice(1).map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {phase}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            </div>
            
              {/* Payment Method */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentMethod" className="text-right">
                Payment Method
                </Label>
                <div className="col-span-3">
              <Select 
                value={newExpense.paymentMethod}
                    onValueChange={(value) => setNewExpense({ ...newExpense, paymentMethod: value })}
              >
                    <SelectTrigger id="paymentMethod" className="w-full">
                      <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
                </div>
            </div>
            
              {/* Vendor */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vendor" className="text-right">
                  Vendor/Supplier
                </Label>
                <div className="col-span-3">
                <Input 
                  id="vendor" 
                    placeholder="Enter vendor/supplier name"
                  value={newExpense.vendor} 
                    onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                />
            </div>
          </div>
          
              {/* Receipt Upload */}
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label>Receipt</Label>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
              <Checkbox 
                id="receiptUploaded" 
                checked={newExpense.receiptUploaded}
                      onCheckedChange={(checked) => 
                        setNewExpense({ 
                          ...newExpense, 
                          receiptUploaded: checked as boolean 
                        })
                      }
              />
              <label 
                htmlFor="receiptUploaded" 
                      className="text-sm font-medium leading-none cursor-pointer"
              >
                      Receipt available
              </label>
                  </div>
              
              {newExpense.receiptUploaded && (
                    <div className="mt-2">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="receipt-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-700 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG or PDF (MAX. 10MB)
                            </p>
                          </div>
                          <input id="receipt-upload" type="file" className="hidden" />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex w-full justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="text-red-500">*</span> Required fields
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>Cancel</Button>
                        <Button
                    onClick={handleAddExpense}
                    disabled={
                      !newExpense.description || 
                      !newExpense.category || 
                      !newExpense.amount || 
                      !newExpense.date || 
                      !newExpense.project || 
                      !newExpense.phase
                    }
                  >
                    Add Expense
                        </Button>
                  </div>
            </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this expense? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteExpense}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Batch Action Confirmation Dialog */}
        <Dialog open={isBatchActionDialogOpen} onOpenChange={setIsBatchActionDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm {batchAction === 'approve' ? 'Approval' : batchAction === 'reject' ? 'Rejection' : 'Deletion'}</DialogTitle>
              <DialogDescription>
                Are you sure you want to {batchAction} {selectedExpenses.length} selected expense{selectedExpenses.length !== 1 ? 's' : ''}?
                {batchAction === 'delete' && ' This action cannot be undone.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBatchActionDialogOpen(false)}>Cancel</Button>
              <Button 
                variant={batchAction === 'delete' ? 'destructive' : 'default'}
                onClick={confirmBatchAction}
              >
                {batchAction === 'approve' ? 'Approve' : batchAction === 'reject' ? 'Reject' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Receipt Preview Dialog */}
        {selectedExpense?.receiptUploaded && (
          <Dialog open={isReceiptPreviewOpen} onOpenChange={setIsReceiptPreviewOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Receipt Preview</DialogTitle>
                <DialogDescription>
                  {selectedExpense.description} - {formatCurrency(selectedExpense.amount)}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center">
                <img 
                  src={selectedExpense.receiptUrl} 
                  alt="Receipt" 
                  className="max-h-[500px] object-contain border rounded-md"
                />
              </div>
              <DialogFooter>
                <Button onClick={() => setIsReceiptPreviewOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
          </div>
  );
}

export default Expenses;