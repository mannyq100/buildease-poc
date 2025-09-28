import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/shared/modals/ConfirmationModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared';
import { ExpenseModal, ExpenseFormData } from '@/components/shared/modals';

// Icons
import { 
  DollarSign, 
  Download, 
  BarChart3,
  Plus
} from 'lucide-react';

// Types
import { 
  Expense, 
  ExpenseInsight 
} from '@/types/expenses';

// Mock Data
import { 
  initialExpenses,
  EXPENSE_CATEGORIES,
  EXPENSE_PROJECTS,
  EXPENSE_PHASES,
  EXPENSE_STATUSES
} from '@/data/mock/expenses/expensesData';
import { getProjectBudget } from '@/data/mock/expenses/budgetData';

// Utilities
import {
  calculateExpensesByCategory,
  findTopCategory,
  calculateGrowthInsights
} from '@/utils/expenseUtils';
import { formatCurrency as formatCurrencyBase } from '@/utils/core/currencyUtils';

// Create a wrapper to maintain compatibility with existing components
const formatCurrency = (amount: number) => formatCurrencyBase(amount, 'USD');
import { formatDate } from '@/utils/core/date';

// Import the components
import {
  ExpensesFilters,
  ExpenseMetricsGrid,
  ExpensesTable, 
  BatchActionsBar,
} from '@/components/expenses';

/**
 * Expenses page component
 * Manages and displays expense data with filtering, analytics, and CRUD operations
 */
function Expenses() {
  const navigate = useNavigate();
  
  // State management
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(initialExpenses);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Selection states
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [isNewExpense, setIsNewExpense] = useState(false);
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [isBatchActionDialogOpen, setIsBatchActionDialogOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<'approve' | 'reject' | 'delete' | ''>('');
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    searchQuery: '',
    category: 'all',
    project: 'all',
    phase: 'all',
    status: 'all',
    dateRange: 'all'
  });
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  
  // Get current expenses for table
  const getCurrentExpenses = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
  };
  
  // Filter expenses based on active filters
  useEffect(() => {
    let result = expenses;
    
    // Apply search query filter
    if (activeFilters.searchQuery) {
      const query = activeFilters.searchQuery.toLowerCase();
      result = result.filter(expense => 
        expense.description.toLowerCase().includes(query) || 
        expense.category.toLowerCase().includes(query) ||
        expense.project.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (activeFilters.category !== 'all') {
      result = result.filter(expense => expense.category === activeFilters.category);
    }
    
    // Apply project filter
    if (activeFilters.project !== 'all') {
      result = result.filter(expense => expense.project === activeFilters.project);
    }
    
    // Apply phase filter
    if (activeFilters.phase !== 'all') {
      result = result.filter(expense => expense.phase === activeFilters.phase);
    }
    
    // Apply status filter
    if (activeFilters.status !== 'all') {
      result = result.filter(expense => expense.status === activeFilters.status);
    }
    
    // Apply date range filter
    if (activeFilters.dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      if (activeFilters.dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (activeFilters.dateRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (activeFilters.dateRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (activeFilters.dateRange === 'quarter') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (activeFilters.dateRange === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      result = result.filter(expense => new Date(expense.date) >= startDate);
    }
    
    setFilteredExpenses(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [expenses, activeFilters]);
  
  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // View expense details
  const viewExpenseDetails = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsNewExpense(false);
    setShowExpenseModal(true);
  };
  
  // Toggle expense selection
  const toggleExpenseSelection = (id: number, selected: boolean) => {
    if (selected) {
      setSelectedExpenses(prev => [...prev, id]);
    } else {
      setSelectedExpenses(prev => prev.filter(expenseId => expenseId !== id));
    }
    
    // Update the all selected state
    if (!selected && isAllSelected) {
      setIsAllSelected(false);
    } else if (selected && selectedExpenses.length + 1 === getCurrentExpenses().length) {
      setIsAllSelected(true);
    }
  };
  
  // Handler for opening the add expense modal
  const handleAddExpense = () => {
    const newExpense: Expense = {
      id: Math.max(...expenses.map(e => e.id), 0) + 1,
      description: '',
      amount: 0,
      category: EXPENSE_CATEGORIES[1], // Default to first category after 'All'
      project: EXPENSE_PROJECTS[1], // Default to first project
      phase: EXPENSE_PHASES[1], // Default to first phase
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      receiptUploaded: false,
      receiptUrl: '',
      vendor: '',
      notes: ''
    };
    
    setCurrentExpense(newExpense);
    setIsNewExpense(true);
    setShowExpenseModal(true);
  };
  
  // Handler for saving an expense from the modal
  const handleSaveExpense = (expenseData: ExpenseFormData) => {
    if (isNewExpense) {
      // Add new expense
      const newExpense: Expense = {
        ...currentExpense!,
        ...expenseData
      };
      
      setExpenses(prev => [...prev, newExpense]);
    } else {
      // Update existing expense
      setExpenses(prev => 
        prev.map(expense => 
          expense.id === currentExpense?.id 
            ? { ...expense, ...expenseData }
            : expense
        )
      );
    }
    
    // Close the modal
    setShowExpenseModal(false);
    setCurrentExpense(null);
  };
  
  // Handle updating an expense status
  const handleUpdateExpenseStatus = (id: number, newStatus: 'approved' | 'pending' | 'rejected') => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === id 
          ? { ...expense, status: newStatus }
          : expense
      )
    );
  };
  
  // Handle deleting an expense
  const handleDeleteExpense = (id: number) => {
    setExpenseToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm expense deletion
  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      setExpenses(prev => prev.filter(expense => expense.id !== expenseToDelete));
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
      // Delete selected expenses
      setExpenses(prev => prev.filter(expense => !selectedExpenses.includes(expense.id)));
    } else {
      // Update status of selected expenses
      setExpenses(prev => 
        prev.map(expense => 
          selectedExpenses.includes(expense.id)
            ? { ...expense, status: batchAction }
            : expense
        )
      );
    }
    
    // Reset selection
    setSelectedExpenses([]);
    setIsAllSelected(false);
    setIsBatchActionDialogOpen(false);
    setBatchAction('');
  };
  
  // Export data
  const handleExport = () => {
    // In a real application, this would create and download a file
    alert(`Exporting expense data as CSV...`);
    // Here you would typically trigger a download of the CSV file
  };
  
  // Generate spending insights
  const generateCategoryInsights = (): ExpenseInsight[] => {
    const categoryCounts = calculateExpensesByCategory(expenses);
    const topCategory = findTopCategory(categoryCounts);
    const insights: ExpenseInsight[] = [];
    
    // Top spending category
    if (topCategory) {
      insights.push({
        title: 'Top Spending Category',
        description: `${topCategory.category} represents ${Math.round(topCategory.percentage)}% of your expenses`,
        icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
        color: 'blue'
      });
    }
    
    // Check for unusual patterns
    const growthInsights = calculateGrowthInsights(expenses);
    if (growthInsights.growthRate > 15) {
      insights.push({
        title: 'Spending Increase',
        description: `Expenses increased by ${Math.round(growthInsights.growthRate)}% compared to last period`,
        icon: <BarChart3 className="w-6 h-6 text-amber-500" />,
        color: 'amber'
      });
    }
    
    return insights;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader 
          title="Expenses"
          description="Track, analyze and manage project expenses"
          icon={<DollarSign className="h-8 w-8" />}
          actions={
            <div className="flex gap-2">
              <Button 
                className="bg-[#2B6CB0] hover:bg-blue-700 text-white" 
                onClick={handleAddExpense}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
              <Button
                variant="outline"
                className="border-[#2B6CB0] text-[#2B6CB0]"
                onClick={handleExport}
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          }
        />
        
        {/* Expense Metrics Grid */}
        <div className="mb-6">
          <ExpenseMetricsGrid 
            totalExpenses={expenses.reduce((sum, exp) => sum + exp.amount, 0)}
            budget={getProjectBudget(activeFilters.project !== 'all' ? activeFilters.project : EXPENSE_PROJECTS[1])}
            topCategory={findTopCategory(calculateExpensesByCategory(expenses))}
            pendingCount={expenses.filter(exp => exp.status === 'pending').length}
            growthInsights={calculateGrowthInsights(expenses)}
            formatCurrency={formatCurrency}
          />
        </div>
        
        <Tabs defaultValue="list" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <Card className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="p-4 lg:p-6">
                {/* Filters Row */}
                <ExpensesFilters 
                  activeFilters={activeFilters} 
                  onFilterChange={handleFilterChange} 
                  categories={EXPENSE_CATEGORIES}
                  projects={EXPENSE_PROJECTS}
                  phases={EXPENSE_PHASES}
                  statuses={EXPENSE_STATUSES}
                />
                
                {/* Batch Actions Bar (shown when items are selected) */}
                {selectedExpenses.length > 0 && (
                  <BatchActionsBar 
                    selectedExpenses={selectedExpenses} 
                    onBatchAction={handleBatchAction} 
                  />
                )}
                
                {/* Expenses Table */}
                <ExpensesTable 
                  expenses={getCurrentExpenses()} 
                  selectedExpenses={selectedExpenses}
                  toggleExpenseSelection={toggleExpenseSelection}
                  isAllSelected={isAllSelected}
                  setIsAllSelected={setIsAllSelected}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  viewExpenseDetails={viewExpenseDetails}
                  handleUpdateExpenseStatus={handleUpdateExpenseStatus}
                  handleDeleteExpense={handleDeleteExpense}
                  setIsReceiptPreviewOpen={setIsReceiptPreviewOpen}
                  filteredExpenses={filteredExpenses}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(1 + (currentPage - 1) * itemsPerPage, filteredExpenses.length)} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} expenses
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Expense Analytics</h3>
              <p className="text-muted-foreground mb-4">Detailed expense analytics will be displayed here.</p>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Expense Modal */}
        {currentExpense && (
          <ExpenseModal
            isOpen={showExpenseModal}
            onClose={() => {
              setShowExpenseModal(false);
              setCurrentExpense(null);
            }}
            onSave={handleSaveExpense}
            expense={currentExpense}
            isNew={isNewExpense}
            categories={EXPENSE_CATEGORIES}
            projects={EXPENSE_PROJECTS}
          />
        )}
        
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteExpense}
          title="Confirm Deletion"
          description="Are you sure you want to delete this expense? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
        
        {/* Batch Action Confirmation Modal */}
        <ConfirmationModal
          isOpen={isBatchActionDialogOpen}
          onClose={() => setIsBatchActionDialogOpen(false)}
          onConfirm={confirmBatchAction}
          title={`Confirm ${batchAction === 'approve' ? 'Approval' : batchAction === 'reject' ? 'Rejection' : 'Deletion'}`}
          description={`Are you sure you want to ${batchAction} ${selectedExpenses.length} selected expense${selectedExpenses.length !== 1 ? 's' : ''}?${batchAction === 'delete' ? ' This action cannot be undone.' : ''}`}
          confirmText={batchAction === 'approve' ? 'Approve' : batchAction === 'reject' ? 'Reject' : 'Delete'}
          cancelText="Cancel"
          variant={batchAction === 'delete' ? 'destructive' : 'info'}
        />
      </div>
    </div>
  );
}

export default Expenses;