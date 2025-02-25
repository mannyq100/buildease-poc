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
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsWPieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

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

  return (
    <DashboardLayout>
      {/* Top Header with Actions */}
      <PageHeader 
        className="mb-6"
        title="Expenses Management" 
        subtitle="Track and manage your project expenses"
        action={
          <div className="flex space-x-2">
            <Button onClick={() => setIsExportDialogOpen(true)} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsAddExpenseOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        }
        backgroundVariant="gradient"
      />

      {/* Expense Stats */}
      <Grid cols={4} className="mb-6">
        <MetricCard
          icon={<Wallet className="w-5 h-5 text-blue-500" />}
          label="Total Expenses"
          value={`$${totalExpenses.toLocaleString()}`}
          subtext={growthInsights.increasing 
            ? `↑ ${growthInsights.growthRate.toFixed(1)}% vs last month` 
            : `↓ ${Math.abs(growthInsights.growthRate).toFixed(1)}% vs last month`}
          trend={growthInsights.increasing ? 'up' : 'down'}
        />
        <MetricCard
          icon={<Building className="w-5 h-5 text-indigo-500" />}
          label="Budget"
          value={`$${budget.total.toLocaleString()}`}
          subtext={`${budgetProgress.toFixed(1)}% spent`}
          progressValue={budgetProgress}
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          label="Top Category"
          value={topCategory.category || 'N/A'}
          subtext={topCategory.amount ? `$${topCategory.amount.toLocaleString()}` : ''}
        />
        <MetricCard
          icon={<Receipt className="w-5 h-5 text-yellow-500" />}
          label="Pending Approval"
          value={expenses.filter(e => e.status === 'pending').length.toString()}
          subtext="Awaiting review"
          badge={expenses.filter(e => e.status === 'pending').length > 0 ? "Action needed" : undefined}
          badgeColor="yellow"
        />
      </Grid>

      {/* Budget Overview */}
      <DashboardSection
        title="Budget Overview"
        icon={<PieChart className="h-5 w-5" />}
        subtitle="Current project spending vs. budget"
        className="mb-6"
        action={
          <div className="flex space-x-2">
            <Button 
              variant={budgetViewMode === 'overview' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setBudgetViewMode('overview')}
            >
              Overview
            </Button>
            <Button 
              variant={budgetViewMode === 'breakdown' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setBudgetViewMode('breakdown')}
            >
              Detailed Breakdown
            </Button>
          </div>
        }
      >
        {budgetViewMode === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                  Total Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${budget.total.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {projectFilter !== 'All Projects' ? projectFilter : 'All Projects'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ArrowDown className="w-5 h-5 mr-2 text-red-500" />
                  Spent So Far
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${budget.spent.toLocaleString()}</div>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{budgetProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={budgetProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ArrowUp className="w-5 h-5 mr-2 text-blue-500" />
                  Remaining Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${budget.remaining.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Estimated completion: 35%
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Budget Allocation by Category</CardTitle>
                <CardDescription>
                  Breakdown of budget allocation and spending across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={budgetAllocationChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="spent" stackId="a" name="Spent" fill="#FF8042" />
                      <Bar dataKey="remaining" stackId="a" name="Remaining" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Budget Health</h4>
                    <div className="flex items-center text-sm">
                      <div className={`w-3 h-3 rounded-full mr-2 ${budgetProgress > 80 ? 'bg-red-500' : budgetProgress > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                      <span>{budgetProgress > 80 ? 'Critical' : budgetProgress > 50 ? 'Warning' : 'Healthy'}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {budgetProgress > 80 
                        ? 'You\'ve used most of your budget. Consider reviewing expenses.' 
                        : budgetProgress > 50 
                          ? 'Budget usage is moderate. Monitor spending closely.' 
                          : 'Your budget usage is well-managed.'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Top Spending</h4>
                    {budget.allocations && budget.allocations.length > 0 && (
                      <div className="text-sm">
                        <div className="flex justify-between items-center">
                          <span>{budget.allocations[0].category}</span>
                          <span className="font-medium">${budget.allocations[0].spent.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={(budget.allocations[0].spent / budget.allocations[0].amount) * 100} 
                          className="h-1 mt-1" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardSection>

      {/* Tabs for different views */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="list" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <LucideBarChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                className="pl-10" 
                placeholder="Search expenses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={projectFilter} 
              onValueChange={setProjectFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={dateRange} 
              onValueChange={setDateRange}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last7">Last 7 Days</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === 'approved' ? 'Approved' : 
                     status === 'pending' ? 'Pending' : 
                     status === 'rejected' ? 'Rejected' : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Batch Actions */}
          {selectedExpenses.length > 0 && (
            <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <AlertTitle className="mr-2">{selectedExpenses.length} expenses selected</AlertTitle>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                    onClick={() => handleBatchAction('approve')}
                  >
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    onClick={() => handleBatchAction('reject')}
                  >
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-gray-100 text-gray-600 hover:bg-gray-200"
                    onClick={() => handleBatchAction('delete')}
                  >
                    <Trash className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      setIsAllSelected(false);
                      setSelectedExpenses([]);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {/* Expenses List */}
          <DashboardSection>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">
                      <Checkbox 
                        checked={isAllSelected} 
                        onCheckedChange={() => setIsAllSelected(!isAllSelected)}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Date</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Project/Phase</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4">
                        <Checkbox 
                          checked={expense.selected || false}
                          onCheckedChange={(checked) => toggleExpenseSelection(expense.id, !!checked)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-gray-500 hidden md:block">
                          {expense.vendor}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          className={
                            expense.category === 'Materials' ? 'bg-blue-100 text-blue-800' :
                            expense.category === 'Labor' ? 'bg-green-100 text-green-800' :
                            expense.category === 'Equipment' ? 'bg-yellow-100 text-yellow-800' :
                            expense.category === 'Permits' ? 'bg-purple-100 text-purple-800' :
                            expense.category === 'Professional Services' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {expense.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${expense.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {new Date(expense.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <div>{expense.project}</div>
                        <div className="text-sm text-gray-500">{expense.phase}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <Badge 
                            className={
                              expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                              expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {expense.status === 'approved' ? 'Approved' :
                             expense.status === 'pending' ? 'Pending' :
                             'Rejected'}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => viewExpenseDetails(expense)}>
                              <FileText className="w-4 h-4 mr-2" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            {expense.receiptUploaded && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedExpense(expense);
                                  setIsReceiptPreviewOpen(true);
                                }}>
                                  <Image className="w-4 h-4 mr-2" />
                                  <span>View Receipt</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  <span>Download Receipt</span>
                                </DropdownMenuItem>
                              </>
                            )}
                            {expense.status === 'pending' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleUpdateExpenseStatus(expense.id, 'approved')}>
                                  <span className="text-green-600">Approve</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateExpenseStatus(expense.id, 'rejected')}>
                                  <span className="text-red-600">Reject</span>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredExpenses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No expenses found matching your search criteria.
                </div>
              )}
            </div>
          </DashboardSection>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category spending breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>
                  Breakdown of expenses across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }))}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                        {Object.entries(expensesByCategory).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Percentage of total expenses by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsWPieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    </RechartsWPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Time series chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Spending Over Time</CardTitle>
                <CardDescription>
                  Daily expense trends for the current period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Project comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Project</CardTitle>
                <CardDescription>
                  Comparison of spending across projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={projectChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Bar dataKey="amount" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expense Insights */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Expense Insights</CardTitle>
                <CardDescription>
                  Smart analysis of your spending patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categoryInsights.map((insight, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border bg-${insight.color}-50 border-${insight.color}-100`}
                    >
                      <div className="flex items-start mb-2">
                        {insight.icon}
                        <h3 className="text-lg font-medium ml-2">{insight.title}</h3>
                      </div>
                      <p className="text-sm">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exportOptions.map((option) => (
              <Card key={option.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <option.icon className="w-5 h-5 mr-2 text-blue-500" />
                    {option.label} Report
                  </CardTitle>
                  <CardDescription>
                    Export your expense data as {option.label} format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 mb-3">
                    <p>Include the following data:</p>
                    <ul className="mt-2 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Expense details
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Project information
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Category breakdown
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setExportFormat(option.id);
                      setIsExportDialogOpen(true);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export as {option.label}
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Custom Report */}
            <Card className="md:col-span-3 bg-blue-50 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Custom Report Builder
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Create customized reports with specific parameters and filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-blue-900 mb-1 block">
                      Date Range
                    </label>
                    <Select defaultValue="thisMonth">
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="lastMonth">Last Month</SelectItem>
                        <SelectItem value="last3Months">Last 3 Months</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-900 mb-1 block">
                      Group By
                    </label>
                    <Select defaultValue="category">
                      <SelectTrigger>
                        <SelectValue placeholder="Select grouping" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-900 mb-1 block">
                      Include Charts
                    </label>
                    <Select defaultValue="yes">
                      <SelectTrigger>
                        <SelectValue placeholder="Include charts?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes, include charts</SelectItem>
                        <SelectItem value="no">No charts, data only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-900 mb-1 block">
                      Format
                    </label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Custom Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Reports */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                  Scheduled Reports
                </CardTitle>
                <CardDescription>
                  Set up automatic report generation and delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                          Monthly Summary
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          PDF report sent on the 1st of each month
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Recipients:</span>
                        <span>finance@example.com</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Next delivery:</span>
                        <span>Jun 1, 2024</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        Pause
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 border-dashed flex flex-col items-center justify-center text-gray-500 space-y-2">
                    <Plus className="w-8 h-8" />
                    <p className="text-sm">Create a new scheduled report</p>
                    <Button variant="outline" size="sm">
                      Set Up Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Enter the details of the expense to add to your records.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="amount" className="text-right text-sm font-medium">
                Amount ($)
              </label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right text-sm font-medium">
                Category
              </label>
              <Select 
                onValueChange={(value) => setNewExpense({...newExpense, category: value})}
                value={newExpense.category}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== 'All Categories').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right text-sm font-medium">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="project" className="text-right text-sm font-medium">
                Project
              </label>
              <Select 
                onValueChange={(value) => setNewExpense({...newExpense, project: value})}
                value={newExpense.project}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.filter(p => p !== 'All Projects').map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phase" className="text-right text-sm font-medium">
                Phase
              </label>
              <Select 
                onValueChange={(value) => setNewExpense({...newExpense, phase: value})}
                value={newExpense.phase}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.filter(p => p !== 'All Phases').map(phase => (
                    <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="vendor" className="text-right text-sm font-medium">
                Vendor
              </label>
              <Input
                id="vendor"
                value={newExpense.vendor}
                onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="paymentMethod" className="text-right text-sm font-medium">
                Payment Method
              </label>
              <Select 
                onValueChange={(value) => setNewExpense({...newExpense, paymentMethod: value})}
                value={newExpense.paymentMethod}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Receipt
              </label>
              <div className="col-span-3">
                <div className="border rounded-lg p-4 text-center">
                  <div className="mb-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Receipt
                    </Button>
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <span>or</span>
                    </div>
                    <Button variant="ghost" className="w-full text-blue-600">
                      <Image className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Expense Details Dialog */}
      {selectedExpense && (
        <Dialog open={viewExpenseDialogOpen} onOpenChange={setViewExpenseDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Expense Details</DialogTitle>
              <DialogDescription>
                Complete information about this expense.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                  <p className="font-medium">{selectedExpense.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Amount</h4>
                  <p className="font-medium">${selectedExpense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                  <Badge 
                    className={
                      selectedExpense.category === 'Materials' ? 'bg-blue-100 text-blue-800' :
                      selectedExpense.category === 'Labor' ? 'bg-green-100 text-green-800' :
                      selectedExpense.category === 'Equipment' ? 'bg-yellow-100 text-yellow-800' :
                      selectedExpense.category === 'Permits' ? 'bg-purple-100 text-purple-800' :
                      selectedExpense.category === 'Professional Services' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {selectedExpense.category}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Date</h4>
                  <p className="font-medium">
                    {new Date(selectedExpense.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Project</h4>
                  <p className="font-medium">{selectedExpense.project}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Phase</h4>
                  <p className="font-medium">{selectedExpense.phase}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Vendor</h4>
                  <p className="font-medium">{selectedExpense.vendor}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h4>
                  <p className="font-medium">{selectedExpense.paymentMethod}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                  <Badge 
                    className={
                      selectedExpense.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedExpense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {selectedExpense.status === 'approved' ? 'Approved' :
                     selectedExpense.status === 'pending' ? 'Pending' :
                     'Rejected'}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Receipt</h4>
                  <p className="font-medium">
                    {selectedExpense.receiptUploaded ? 
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" /> Available
                      </span> : 
                      <span className="text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" /> Not uploaded
                      </span>
                    }
                  </p>
                </div>
              </div>
              
              {selectedExpense.receiptUploaded && (
                <div className="mt-4 border rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">Receipt Preview</p>
                  {selectedExpense.receiptUrl ? (
                    <div className="relative mb-2 overflow-hidden rounded-md">
                      <img 
                        src={selectedExpense.receiptUrl} 
                        alt="Receipt" 
                        className="mx-auto max-h-32 object-cover" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 hover:opacity-100"
                          onClick={() => {
                            setIsReceiptPreviewOpen(true);
                          }}
                        >
                          <Search className="w-4 h-4 mr-1" />
                          View Full
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Receipt className="w-16 h-16 mx-auto text-gray-400" />
                  )}
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setIsReceiptPreviewOpen(true)}>
                      <Image className="w-4 h-4 mr-2" />
                      View Receipt
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setViewExpenseDialogOpen(false)}>
                Close
              </Button>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              {selectedExpense.status === 'pending' && (
                <>
                  <Button variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                    onClick={() => {
                      handleUpdateExpenseStatus(selectedExpense.id, 'approved');
                      setViewExpenseDialogOpen(false);
                    }}
                  >
                    Approve
                  </Button>
                  <Button variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                    onClick={() => {
                      handleUpdateExpenseStatus(selectedExpense.id, 'rejected');
                      setViewExpenseDialogOpen(false);
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Receipt Preview Dialog */}
      {selectedExpense && selectedExpense.receiptUrl && (
        <Dialog open={isReceiptPreviewOpen} onOpenChange={setIsReceiptPreviewOpen}>
          <DialogContent className="sm:max-w-3xl h-auto max-h-screen">
            <DialogHeader>
              <DialogTitle>Receipt Image</DialogTitle>
              <DialogDescription>
                {selectedExpense.description} - ${selectedExpense.amount.toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="relative overflow-auto max-h-[70vh]">
              <img 
                src={selectedExpense.receiptUrl} 
                alt="Receipt" 
                className="w-full object-contain rounded-md"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReceiptPreviewOpen(false)}>
                Close
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              The expense will be permanently removed from your records. Any associated data, including receipt images, will also be deleted.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteExpense}>
              <Trash className="w-4 h-4 mr-2" />
              Delete Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Action Confirmation Dialog */}
      <Dialog open={isBatchActionDialogOpen} onOpenChange={setIsBatchActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={
              batchAction === 'delete' ? 'text-red-600' : 
              batchAction === 'approve' ? 'text-green-600' : 
              batchAction === 'reject' ? 'text-orange-600' : ''
            }>
              {batchAction === 'delete' && <AlertCircle className="w-5 h-5 mr-2 inline-block" />}
              Confirm Batch {batchAction === 'delete' ? 'Deletion' : batchAction === 'approve' ? 'Approval' : 'Rejection'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {batchAction} {selectedExpenses.length} selected expense{selectedExpenses.length > 1 ? 's' : ''}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              {batchAction === 'delete' 
                ? 'Selected expenses will be permanently removed from your records. This action cannot be undone.'
                : batchAction === 'approve'
                  ? 'Selected expenses will be marked as approved.'
                  : 'Selected expenses will be marked as rejected.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={batchAction === 'delete' ? 'destructive' : 'default'}
              onClick={confirmBatchAction}
              className={
                batchAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                batchAction === 'reject' ? 'bg-orange-600 hover:bg-orange-700' : ''
              }
            >
              {batchAction === 'delete' && <Trash className="w-4 h-4 mr-2" />}
              {batchAction === 'approve' && <CheckCircle className="w-4 h-4 mr-2" />}
              {batchAction === 'reject' && <X className="w-4 h-4 mr-2" />}
              {batchAction === 'delete' ? 'Delete' : batchAction === 'approve' ? 'Approve' : 'Reject'} Expenses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Expenses</DialogTitle>
            <DialogDescription>
              Configure your export settings
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {exportOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={exportFormat === option.id ? 'default' : 'outline'}
                    className={exportFormat === option.id ? '' : 'border-gray-200'}
                    onClick={() => setExportFormat(option.id)}
                  >
                    <option.icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Export Options</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeReceipts" 
                    checked={exportExtraOptions.includeReceipts}
                    onCheckedChange={(checked) => 
                      setExportExtraOptions({...exportExtraOptions, includeReceipts: !!checked})
                    }
                  />
                  <label htmlFor="includeReceipts" className="text-sm">
                    Include receipt images
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeVendorInfo" 
                    checked={exportExtraOptions.includeVendorInfo}
                    onCheckedChange={(checked) => 
                      setExportExtraOptions({...exportExtraOptions, includeVendorInfo: !!checked})
                    }
                  />
                  <label htmlFor="includeVendorInfo" className="text-sm">
                    Include vendor information
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Date Range</h4>
              <Select defaultValue="current">
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current filter ({dateRange})</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Expenses;