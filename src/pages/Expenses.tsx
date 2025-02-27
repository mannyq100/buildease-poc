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
import { Badge } from '@/components/ui/badge';
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
  Settings,
  X,
  BarChart as LucideBarChart,
  LineChart as LineChartIcon,
  AlertTriangle,
  TrendingDown,
  XCircle,
  Trash2,
  Eye,
  FileX,
  Paperclip,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { 
  DashboardLayout, 
  DashboardSection, 
  Grid 
} from '@/components/layout/test';
import { 
  MetricCard,
  PageHeader
} from '@/components/shared';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsWPieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import MainNavigation from '@/components/layout/MainNavigation';

// Define expense type
interface Expense {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  project: string;
  phase: string;
  paymentMethod: string;
  vendor: string;
  receiptUploaded: boolean;
  receiptUrl?: string;
  status: 'approved' | 'pending' | 'rejected';
  selected?: boolean;
}

// Define top category type
interface TopCategory {
  category?: string;
  amount?: number;
}

// Define budget data type
interface BudgetData {
  total: number;
  spent: number;
  remaining: number;
  allocations?: {
    category: string;
    amount: number;
    spent: number;
  }[];
}

// Define time series data type
interface TimeSeriesDataPoint {
  date: string;
  amount: number;
  project?: string;
  category?: string;
}

// Mock data for expenses
const initialExpenses: Expense[] = [
  {
    id: 1,
    description: 'Cement Purchase',
    category: 'Materials',
    amount: 1200.00,
    date: '2024-05-05',
    project: 'Villa Construction',
    phase: 'Foundation',
    paymentMethod: 'Cash',
    vendor: 'BuildSupply Inc.',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  },
  {
    id: 2,
    description: 'Labor Payment - Week 1',
    category: 'Labor',
    amount: 850.00,
    date: '2024-05-02',
    project: 'Villa Construction',
    phase: 'Foundation',
    paymentMethod: 'Bank Transfer',
    vendor: 'ABC Construction',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  },
  {
    id: 3,
    description: 'Sand Delivery',
    category: 'Materials',
    amount: 560.00,
    date: '2024-05-07',
    project: 'Villa Construction',
    phase: 'Foundation',
    paymentMethod: 'Cash',
    vendor: 'Quarry Solutions',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'pending'
  },
  {
    id: 4,
    description: 'Steel Reinforcement Bars',
    category: 'Materials',
    amount: 3200.00,
    date: '2024-05-10',
    project: 'Villa Construction',
    phase: 'Foundation',
    paymentMethod: 'Credit Card',
    vendor: 'Steel Masters Ltd.',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  },
  {
    id: 5,
    description: 'Excavation Equipment Rental',
    category: 'Equipment',
    amount: 1500.00,
    date: '2024-04-28',
    project: 'Villa Construction',
    phase: 'Site Preparation',
    paymentMethod: 'Bank Transfer',
    vendor: 'Equipment Rentals Co.',
    receiptUploaded: false,
    status: 'approved'
  },
  {
    id: 6,
    description: 'Building Permit Fees',
    category: 'Permits',
    amount: 750.00,
    date: '2024-04-15',
    project: 'Villa Construction',
    phase: 'Permitting',
    paymentMethod: 'Bank Transfer',
    vendor: 'City Government',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  },
  {
    id: 7,
    description: 'Architect Consultation',
    category: 'Professional Services',
    amount: 1200.00,
    date: '2024-04-10',
    project: 'Villa Construction',
    phase: 'Design and Planning',
    paymentMethod: 'Bank Transfer',
    vendor: 'John Smith Architects',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  },
  {
    id: 8,
    description: 'Plumbing Materials',
    category: 'Materials',
    amount: 1800.00,
    date: '2024-05-12',
    project: 'Office Renovation',
    phase: 'Plumbing',
    paymentMethod: 'Credit Card',
    vendor: 'Plumbing Plus',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'pending'
  },
  {
    id: 9,
    description: 'Electrical Supplies',
    category: 'Materials',
    amount: 2200.00,
    date: '2024-05-14',
    project: 'Office Renovation',
    phase: 'Electrical',
    paymentMethod: 'Credit Card',
    vendor: 'Power Systems Ltd.',
    receiptUploaded: false,
    status: 'rejected'
  },
  {
    id: 10,
    description: 'Labor Payment - Week 2',
    category: 'Labor',
    amount: 1100.00,
    date: '2024-05-09',
    project: 'Villa Construction',
    phase: 'Foundation',
    paymentMethod: 'Cash',
    vendor: 'ABC Construction',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  }
];

// Category options for filtering and forms
const categories = [
  'All Categories',
  'Materials',
  'Labor',
  'Equipment',
  'Permits',
  'Professional Services',
  'Transportation',
  'Miscellaneous'
];

// Project options for filtering and forms
const projects = [
  'All Projects',
  'Villa Construction',
  'Office Renovation'
];

// Phase options for filtering and forms
const phases = [
  'All Phases',
  'Design and Planning',
  'Permitting',
  'Site Preparation',
  'Foundation',
  'Structural Work',
  'Roofing',
  'Electrical',
  'Plumbing',
  'Finishing'
];

// Status options for filtering
const statuses = [
  'All Statuses',
  'approved',
  'pending',
  'rejected'
];

// Export options
const exportOptions = [
  { id: 'csv', label: 'CSV', icon: FileText },
  { id: 'excel', label: 'Excel', icon: FileDown },
  { id: 'pdf', label: 'PDF', icon: FilePlus }
];

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [phaseFilter, setPhaseFilter] = useState('All Phases');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
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
      categoryFilter === 'All Categories' || 
      expense.category === categoryFilter;
    
    const matchesProject = 
      projectFilter === 'All Projects' || 
      expense.project === projectFilter;
    
    const matchesPhase = 
      phaseFilter === 'All Phases' || 
      expense.phase === phaseFilter;
    
    const matchesStatus = 
      statusFilter === 'All Statuses' || 
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

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  
  // Calculate expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc: Record<string, number>, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  
  // Find top expense category
  const topCategory: TopCategory = Object.entries(expensesByCategory).reduce(
    (max, [category, amount]) => amount > (max.amount || 0) ? { category, amount } : max, 
    {} as TopCategory
  );

  // Prepare data for category pie chart
  const categoryChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Prepare data for time series chart
  const timeSeriesData = (() => {
    // Group expenses by date
    const expensesByDate: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      const date = expense.date;
      expensesByDate[date] = (expensesByDate[date] || 0) + expense.amount;
    });
    
    // Sort dates and create chart data
    return Object.entries(expensesByDate)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount
      }));
  })();

  // Project chart data
  const projectChartData = (() => {
    const data: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      if (expense.project !== 'All Projects') {
        data[expense.project] = (data[expense.project] || 0) + expense.amount;
      }
    });
    
    return Object.entries(data).map(([project, amount]) => ({
      name: project,
      amount
    }));
  })();

  // Prepare growth insights data
  const growthInsights = (() => {
    // Get this month's expenses
    const thisMonth = new Date();
    const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const thisMonthExpenses = expenses.filter(
      expense => new Date(expense.date) >= thisMonthStart
    ).reduce((sum, expense) => sum + expense.amount, 0);
    
    // Get last month's expenses
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const lastMonthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 0);
    const lastMonthExpenses = expenses.filter(
      expense => {
        const date = new Date(expense.date);
        return date >= lastMonthStart && date <= lastMonthEnd;
      }
    ).reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate growth rate
    const growthRate = lastMonthExpenses > 0 
      ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
      : 0;
    
    return {
      thisMonth: thisMonthExpenses,
      lastMonth: lastMonthExpenses,
      growthRate,
      increasing: growthRate > 0
    };
  })();

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
  }, [isAllSelected]);

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
  const getCurrentProjectBudget = (): BudgetData => {
    // In a real app, this would come from the project data
    // Using mock data for demonstration
    if (projectFilter === 'Villa Construction') {
      return {
        total: 120000,
        spent: 10360,
        remaining: 109640,
        allocations: [
          { category: 'Materials', amount: 50000, spent: 4960 },
          { category: 'Labor', amount: 30000, spent: 1950 },
          { category: 'Equipment', amount: 15000, spent: 1500 },
          { category: 'Professional Services', amount: 10000, spent: 1200 },
          { category: 'Permits', amount: 5000, spent: 750 },
          { category: 'Miscellaneous', amount: 10000, spent: 0 }
        ]
      };
    } else if (projectFilter === 'Office Renovation') {
      return {
        total: 45000,
        spent: 4000,
        remaining: 41000,
        allocations: [
          { category: 'Materials', amount: 25000, spent: 4000 },
          { category: 'Labor', amount: 10000, spent: 0 },
          { category: 'Equipment', amount: 5000, spent: 0 },
          { category: 'Miscellaneous', amount: 5000, spent: 0 }
        ]
      };
    } else {
      // All projects combined
      return {
        total: 165000,
        spent: 14360,
        remaining: 150640,
        allocations: [
          { category: 'Materials', amount: 75000, spent: 8960 },
          { category: 'Labor', amount: 40000, spent: 1950 },
          { category: 'Equipment', amount: 20000, spent: 1500 },
          { category: 'Professional Services', amount: 10000, spent: 1200 },
          { category: 'Permits', amount: 5000, spent: 750 },
          { category: 'Miscellaneous', amount: 15000, spent: 0 }
        ]
      };
    }
  };

  const budget = getCurrentProjectBudget();
  const budgetProgress = (budget.spent / budget.total) * 100;

  // Generate budget allocation chart data
  const budgetAllocationChartData = budget.allocations?.map(allocation => ({
    name: allocation.category,
    budget: allocation.amount,
    spent: allocation.spent,
    remaining: allocation.amount - allocation.spent
  }));

  // Generate spending insights
  const generateCategoryInsights = () => {
    const insights = [];
    
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
    const unusedCategories = categories
      .filter(c => c !== 'All Categories')
      .filter(category => !Object.keys(expensesByCategory).includes(category));
    
    if (unusedCategories.length > 0) {
      insights.push({
        title: 'Unused Categories',
        description: `No expenses in ${unusedCategories.length} categories including ${unusedCategories[0]}`,
        icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
        color: 'yellow'
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
      <MainNavigation />
      
      <PageHeader
        title="Expenses"
        subtitle="Track, analyze and manage project expenses"
        icon={<DollarSign className="h-6 w-6" />}
        actions={[
          {
            label: "Add Expense",
            icon: <Plus />,
            variant: "construction",
            onClick: () => setIsAddExpenseOpen(true)
          },
          {
            label: "Export",
            icon: <Download />,
            variant: "blueprint",
            onClick: () => handleExport()
          }
        ]}
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="glass" hover="lift" animation="fadeIn" className="dark:bg-deepblue-dark/70">
              <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-deepblue dark:text-blue-300">Total Expenses</CardTitle>
                <DollarSign className="h-5 w-5 text-burntorange" />
              </div>
              </CardHeader>
              <CardContent>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">${totalExpenses.toLocaleString()}</span>
                <div className="flex items-center mt-2 text-sm">
                  <Badge variant={growthInsights.increasing ? "warning" : "success"} className="gap-1">
                    {growthInsights.increasing ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {growthInsights.increasing 
                      ? `+${growthInsights.growthRate.toFixed(1)}%` 
                      : `-${Math.abs(growthInsights.growthRate).toFixed(1)}%`}
                  </Badge>
                  <span className="ml-2 text-muted-foreground">vs last month</span>
                </div>
              </div>
              </CardContent>
            </Card>
            
          <Card variant="glass" hover="lift" animation="fadeIn" className="dark:bg-deepblue-dark/70">
              <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-deepblue dark:text-blue-300">Budget Status</CardTitle>
                <Building className="h-5 w-5 text-deepblue" />
              </div>
              </CardHeader>
              <CardContent>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">${budget.total.toLocaleString()}</span>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget spent</span>
                    <span className="font-medium">{budgetProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={budgetProgress} className="h-2" />
                </div>
                </div>
              </CardContent>
            </Card>
            
          <Card variant="glass" hover="lift" animation="fadeIn" className="dark:bg-deepblue-dark/70">
              <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-deepblue dark:text-blue-300">Top Category</CardTitle>
                <PieChart className="h-5 w-5 text-darkgreen" />
              </div>
              </CardHeader>
              <CardContent>
              <div className="flex flex-col">
                <span className="text-3xl font-bold truncate">{topCategory?.category || "N/A"}</span>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-muted-foreground">
                    ${topCategory?.amount?.toLocaleString() || "0"}
                  </span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {topCategory && totalExpenses > 0
                      ? ((topCategory.amount! / totalExpenses) * 100).toFixed(1)
                      : "0"}%
                  </span>
                </div>
              </div>
              </CardContent>
            </Card>

          <Card variant="glass" hover="lift" animation="fadeIn" className="dark:bg-deepblue-dark/70">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-deepblue dark:text-blue-300">Pending Review</CardTitle>
                <AlertCircle className="h-5 w-5 text-burntorange" />
          </div>
              </CardHeader>
              <CardContent>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">
                  {expenses.filter(e => e.status === 'pending').length}
                </span>
                <div className="flex items-center mt-2">
                  {expenses.filter(e => e.status === 'pending').length > 0 ? (
                    <Badge variant="warning" className="text-xs">Action needed</Badge>
                  ) : (
                    <Badge variant="success" className="text-xs">All clear</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Filters and Controls */}
        <Card variant="default" className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Date Range</label>
            <Select 
                  value={dateFilter}
                  onValueChange={setDateFilter}
            >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                    <SelectItem value="thisQuarter">This Quarter</SelectItem>
                    <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Project</label>
            <Select 
              value={projectFilter} 
              onValueChange={setProjectFilter}
            >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
            <Select 
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
            >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
              </SelectContent>
            </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
                </div>
          </CardContent>
        </Card>

        {/* Data Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card variant="default" className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b">
              <CardTitle>Expense Trends</CardTitle>
              </CardHeader>
            <CardContent className="p-6">
              {timeSeriesData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <RechartsTooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#1E3A8A" 
                        fillOpacity={1} 
                        fill="url(#colorAmount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">No data available for the selected filters</p>
                </div>
              )}
              </CardContent>
            </Card>

          <Card variant="default" className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b">
              <CardTitle>Expenses by Project</CardTitle>
              </CardHeader>
            <CardContent className="p-6">
              {projectChartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsWPieChart>
                      <Pie
                        data={projectChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {projectChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={[
                              '#1E3A8A', // deepblue
                              '#166534', // darkgreen
                              '#D97706', // burntorange
                              '#0EA5E9', // sky blue
                              '#8B5CF6', // purple
                              '#EC4899', // pink
                            ][index % 6]} 
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`$${value}`, 'Amount']} />
                    </RechartsWPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">No data available for the selected filters</p>
                </div>
              )}
              </CardContent>
            </Card>
                </div>

        {/* Expenses Table */}
        <Card variant="default" className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b">
            <div className="flex justify-between items-center">
              <CardTitle>Expenses</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                  variant="modern"
                  icon={<Search className="h-4 w-4" />}
                />
                {selectedExpenses.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        Actions <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBatchAction('approve')}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Approve Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchAction('reject')}>
                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                        Reject Selected
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBatchAction('delete')}>
                        <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                  </div>
                </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 dark:bg-muted/20">
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        filteredExpenses.length > 0 &&
                        selectedExpenses.length === filteredExpenses.length
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedExpenses(filteredExpenses.map(e => e.id));
                        } else {
                          setSelectedExpenses([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileX className="h-12 w-12 mb-2 opacity-30" />
                        <p>No expenses found</p>
                        <p className="text-sm">Try adjusting your filters or add a new expense</p>
            </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedExpenses.map((expense) => (
                    <TableRow key={expense.id} className="group hover:bg-muted/30 dark:hover:bg-muted/10">
                      <TableCell>
                        <Checkbox
                          checked={selectedExpenses.includes(expense.id)}
                          onCheckedChange={(checked) => {
                            toggleExpenseSelection(expense.id, !!checked);
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <span className="truncate max-w-[200px]">{expense.description}</span>
                          {expense.receiptUploaded && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Paperclip className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>Receipt uploaded</TooltipContent>
                            </Tooltip>
                          )}
            </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {expense.category}
                  </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="steel" className="font-normal">
                          {expense.project}
                        </Badge>
                      </TableCell>
                      <TableCell>
                  <Badge 
                          variant={
                            expense.status === 'approved'
                              ? 'success'
                              : expense.status === 'rejected'
                              ? 'destructive'
                              : 'warning'
                          }
                          className="font-normal"
                        >
                          {expense.status === 'approved'
                            ? 'Approved'
                            : expense.status === 'rejected'
                            ? 'Rejected'
                            : 'Pending'}
                  </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                        </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewExpenseDetails(expense)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUpdateExpenseStatus(expense.id, 'approved')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateExpenseStatus(expense.id, 'rejected')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteExpense(expense.id)}>
                                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
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
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{paginatedExpenses.length}</span> of{" "}
              <span className="font-medium">{filteredExpenses.length}</span> expenses
          </div>
            <div className="flex items-center space-x-2">
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
        </Card>
            </div>

      {/* Modals */}
      {/* ... existing modals ... */}
            </div>
  );
};

export default Expenses;