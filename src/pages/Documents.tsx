import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { usePageActions } from '@/hooks/usePageActions';
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Folder,
  HardDrive,
  Image,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Star,
  Trash2,
  Upload,
  FileType
} from 'lucide-react';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { 
  MetricCard,
  PageHeader,
  StatusBadge
} from '@/components/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for documents
const initialDocuments = [
  { 
    id: 1, 
    name: 'Villa Construction - Foundation Plans.pdf', 
    project: 'Villa Construction',
    type: 'PDF', 
    category: 'plans',
    size: '2.4 MB', 
    uploaded: '15 Feb 2024',
    uploadedBy: 'John Doe',
    status: 'approved',
    starred: true
  },
  { 
    id: 2, 
    name: 'Building Permit - Final Approval.pdf', 
    project: 'Villa Construction',
    type: 'PDF', 
    category: 'permits',
    size: '1.8 MB', 
    uploaded: '10 Feb 2024',
    uploadedBy: 'Sarah Chen',
    status: 'approved',
    starred: false
  },
  { 
    id: 3, 
    name: 'Site Analysis Report.docx', 
    project: 'Office Renovation',
    type: 'DOCX', 
    category: 'reports',
    size: '1.2 MB', 
    uploaded: '05 Feb 2024',
    uploadedBy: 'James Wilson',
    status: 'pending',
    starred: false
  },
  { 
    id: 4, 
    name: 'Vendor Agreement - Cement Supply.pdf', 
    project: 'Villa Construction',
    type: 'PDF', 
    category: 'contracts',
    size: '3.1 MB', 
    uploaded: '03 Feb 2024',
    uploadedBy: 'Maria Lopez',
    status: 'approved',
    starred: true
  },
  { 
    id: 5, 
    name: 'Progress Photos - Week 4.zip', 
    project: 'Villa Construction',
    type: 'ZIP', 
    category: 'reports',
    size: '15.7 MB', 
    uploaded: '01 Feb 2024',
    uploadedBy: 'John Doe',
    status: 'pending',
    starred: false
  },
  { 
    id: 6, 
    name: 'Architectural Blueprints - Office Layout.dwg', 
    project: 'Office Renovation',
    type: 'DWG', 
    category: 'plans',
    size: '8.3 MB', 
    uploaded: '28 Jan 2024',
    uploadedBy: 'Ahmed Patel',
    status: 'approved',
    starred: false
  }
];

// Mock document categories
const categories = [
  { id: 'all', name: 'All Documents', count: 28 },
  { id: 'plans', name: 'Plans & Blueprints', count: 8 },
  { id: 'permits', name: 'Permits & Approvals', count: 5 },
  { id: 'contracts', name: 'Contracts', count: 6 },
  { id: 'reports', name: 'Reports', count: 9 }
];

// Define interfaces
interface DocumentItemProps {
  document: {
    id: number;
    name: string;
    project: string;
    type: string;
    category: string;
    size: string;
    uploaded: string;
    uploadedBy: string;
    status: string;
    starred: boolean;
  };
  icon: React.ReactNode;
  onView: () => void;
  onDelete: () => void;
  onToggleStar: () => void;
}

// Document list item component
const DocumentItem = React.memo(({ document, icon, onView, onDelete, onToggleStar }: DocumentItemProps) => {
  // Memoize status badge class
  const statusBadgeClass = React.useMemo(() => {
    return document.status === 'approved' 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
      : document.status === 'pending'
      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }, [document.status]);

  // Memoize star button click handler
  const handleStarClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStar();
  }, [onToggleStar]);

  // Memoize view click handler
  const handleViewClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onView();
  }, [onView]);

  // Memoize delete click handler
  const handleDeleteClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  }, [onDelete]);

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.01] will-change-transform">
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="p-2 mr-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-6">
            {document.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">{document.project}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{document.size}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass}`}>
              {document.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStarClick}
            className={document.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-500'}
          >
            <Star className="w-4 h-4" fill={document.starred ? 'currentColor' : 'none'} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewClick}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/20"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

DocumentItem.displayName = 'DocumentItem';

const Documents = () => {
  const navigate = useNavigate();
  const { getCommonActions } = usePageActions('documents');
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItemProps['document'] | null>(null);
  const [newDocument, setNewDocument] = useState({
    name: '',
    project: '',
    category: '',
    type: '',
    size: '',
    status: 'pending'
  });

  // Get file icon based on type
  const getFileIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'pdf': return <FileType className="w-5 h-5 text-red-500" />;
      case 'docx': return <FileType className="w-5 h-5 text-blue-500" />;
      case 'xlsx': return <FileType className="w-5 h-5 text-green-500" />;
      case 'zip': return <Archive className="w-5 h-5 text-yellow-500" />;
      case 'jpg':
      case 'png': return <Image className="w-5 h-5 text-purple-500" />;
      case 'dwg': return <FileType className="w-5 h-5 text-orange-500" />;
      default: return <FileType className="w-5 h-5 text-gray-500" />;
    }
  };

  // Filter documents based on search query and filters - memoized to prevent recalculation on every render
  const filteredDocuments = React.useMemo(() => {
    return documents.filter(doc => {
      // Only do the case conversion once per document per filter operation
      const docNameLower = doc.name.toLowerCase();
      const docProjectLower = doc.project.toLowerCase();
      const searchQueryLower = searchQuery.toLowerCase();
      
      const matchesSearch = searchQuery === '' || 
        docNameLower.includes(searchQueryLower) ||
        docProjectLower.includes(searchQueryLower);
      
      const matchesProject = projectFilter === 'all' || 
        doc.project.includes(projectFilter === 'villa' ? 'Villa' : 'Office');
        
      const matchesCategory = categoryFilter === 'all' || 
        doc.category === categoryFilter;
        
      const matchesStatus = statusFilter === 'all' || 
        doc.status === statusFilter;
      
      return matchesSearch && matchesProject && matchesCategory && matchesStatus;
    });
  }, [documents, searchQuery, projectFilter, categoryFilter, statusFilter]);

  // Handle opening document view dialog
  const openViewDialog = (document) => {
    setSelectedDocument(document);
    setViewDialogOpen(true);
  };

  // Handle uploading a new document
  const handleUploadDocument = () => {
    // In a real app, this would handle the actual file upload
    const id = Math.max(...documents.map(d => d.id)) + 1;
    const newDoc = {
      ...newDocument,
      id,
      uploaded: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      uploadedBy: 'John Doe', // Would be the current user
      starred: false
    };
    
    setDocuments([newDoc, ...documents]);
    setNewDocument({
      name: '',
      project: '',
      category: '',
      type: '',
      size: '',
      status: 'pending'
    });
    setUploadDialogOpen(false);
  };

  // Handle deleting a document
  const handleDeleteDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    if (selectedDocument && selectedDocument.id === id) {
      setViewDialogOpen(false);
    }
  };

  // Handle toggling star status
  const handleToggleStar = (id) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, starred: !doc.starred } : doc
    ));
    
    if (selectedDocument && selectedDocument.id === id) {
      setSelectedDocument({ ...selectedDocument, starred: !selectedDocument.starred });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50">
      <MainNavigation
        title="Documents"
        icon={<FileText className="h-6 w-6" />}
      />
      <div className="max-w-7xl mx-auto px-6 pt-[72px]">
        <div className="py-0">
          <PageHeader
            title="Document Management"
            subtitle="Upload, organize, and manage project documents"
            icon={<FileText className="h-6 w-6" />}
            gradient={true}
            animated={true}
            actions={[
              {
                label: "Upload Document",
                icon: <Upload />,
                variant: "construction",
                onClick: handleUploadDocument
              }
            ]}
          />
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-200 dark:border-blue-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg shadow-sm">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Documents</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">items</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 shadow-sm hover:shadow-md transition-all duration-300 border border-green-200 dark:border-green-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Approved</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {documents.filter(d => d.status === 'approved').length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">documents</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 shadow-sm hover:shadow-md transition-all duration-300 border border-amber-200 dark:border-amber-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg shadow-sm">
                  <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Starred</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {documents.filter(d => d.starred).length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">favorites</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 shadow-sm hover:shadow-md transition-all duration-300 border border-purple-200 dark:border-purple-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg shadow-sm">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Recent Uploads</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {documents.filter(d => new Date(d.uploaded) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">this week</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Categories */}
            <div className="lg:col-span-1">
              <Card className="shadow-md rounded-xl transition-all duration-300 hover:shadow-lg border-gray-200 dark:border-slate-800 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 pb-3">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                    {categories.map(category => (
                      <li key={category.id} className="group">
                        <button
                          onClick={() => setCategoryFilter(category.id)}
                          className={`w-full flex justify-between items-center p-4 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                            categoryFilter === category.id ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <Folder className={`w-4 h-4 mr-3 ${
                              categoryFilter === category.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
                            }`} />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-slate-600 transition-colors">
                            {category.count}
                          </Badge>
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="mt-6 shadow-md rounded-xl transition-all duration-300 hover:shadow-lg border-gray-200 dark:border-slate-800">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 pb-3">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Filters</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project</label>
                    <Select value={projectFilter} onValueChange={setProjectFilter}>
                      <SelectTrigger className="w-full border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <SelectValue placeholder="All Projects" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-md">
                        <SelectItem value="all">All Projects</SelectItem>
                        <SelectItem value="villa">Villa Construction</SelectItem>
                        <SelectItem value="office">Office Renovation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">File Type</label>
                    <Select>
                      <SelectTrigger className="w-full border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-md">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="docx">DOCX</SelectItem>
                        <SelectItem value="dwg">DWG</SelectItem>
                        <SelectItem value="images">Images</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-md">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => {
                      setProjectFilter('all');
                      setCategoryFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Document List */}
            <div className="lg:col-span-3">
              <Card className="shadow-md rounded-xl">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input 
                        className="pl-10" 
                        placeholder="Search documents..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select defaultValue="newest">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-md">
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="size">Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="all">
                    <TabsList className="mb-6">
                      <TabsTrigger value="all">All Documents</TabsTrigger>
                      <TabsTrigger value="starred">Starred</TabsTrigger>
                      <TabsTrigger value="recent">Recently Added</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map(doc => (
                          <DocumentItem 
                            key={doc.id} 
                            document={doc} 
                            icon={getFileIcon(doc.type)} 
                            onView={() => openViewDialog(doc)}
                            onDelete={() => handleDeleteDocument(doc.id)}
                            onToggleStar={() => handleToggleStar(doc.id)}
                          />
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No documents found</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            We couldn't find any documents matching your current filters. Try adjusting your search criteria or upload a new document.
                          </p>
                          <Button 
                            onClick={() => setUploadDialogOpen(true)}
                            className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white shadow-md"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload a Document
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="starred" className="space-y-4">
                      {filteredDocuments.filter(doc => doc.starred).length > 0 ? (
                        filteredDocuments.filter(doc => doc.starred).map(doc => (
                          <DocumentItem 
                            key={doc.id} 
                            document={doc} 
                            icon={getFileIcon(doc.type)} 
                            onView={() => openViewDialog(doc)}
                            onDelete={() => handleDeleteDocument(doc.id)}
                            onToggleStar={() => handleToggleStar(doc.id)}
                          />
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <Star className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No starred documents</h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            You haven't starred any documents yet. Star important documents to find them quickly.
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="recent" className="space-y-4">
                      {filteredDocuments.slice(0, 3).map(doc => (
                        <DocumentItem 
                          key={doc.id} 
                          document={doc} 
                          icon={getFileIcon(doc.type)} 
                          onView={() => openViewDialog(doc)}
                          onDelete={() => handleDeleteDocument(doc.id)}
                          onToggleStar={() => handleToggleStar(doc.id)}
                        />
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
            <DialogDescription>
              Add a new document to your project. Fill in the document details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="file" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Document File
              </label>
              <Input
                id="file"
                type="file"
                className="border-gray-300 dark:border-slate-700"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewDocument({
                      ...newDocument,
                      name: file.name,
                      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                      type: file.name.split('.').pop()?.toUpperCase() || ''
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="project" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Project
              </label>
              <Select value={newDocument.project} onValueChange={(value) => setNewDocument({ ...newDocument, project: value })}>
                <SelectTrigger className="w-full border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-md">
                  <SelectItem value="Villa Construction">Villa Construction</SelectItem>
                  <SelectItem value="Office Renovation">Office Renovation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <Select value={newDocument.category} onValueChange={(value) => setNewDocument({ ...newDocument, category: value })}>
                <SelectTrigger className="w-full border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-md">
                  <SelectItem value="plans">Plans & Blueprints</SelectItem>
                  <SelectItem value="permits">Permits & Approvals</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="reports">Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUploadDocument}
              className="bg-[#2B6CB0] hover:bg-[#2B6CB0]/90 text-white"
              disabled={!newDocument.name || !newDocument.project || !newDocument.category}
            >
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>View Document</DialogTitle>
            <DialogDescription>
              View the details of the selected document.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Document Name
              </label>
              <p className="text-gray-500 dark:text-gray-400">{selectedDocument?.name}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Project
              </label>
              <p className="text-gray-500 dark:text-gray-400">{selectedDocument?.project}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <p className="text-gray-500 dark:text-gray-400">{selectedDocument?.category}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                File Type
              </label>
              <p className="text-gray-500 dark:text-gray-400">{selectedDocument?.type}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Size
              </label>
              <p className="text-gray-500 dark:text-gray-400">{selectedDocument?.size}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uploaded
              </label>
              <p className="text-gray-500 dark:text-gray-400">{selectedDocument?.uploaded}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uploaded By
              </label>
              <p className="text-gray-500 dark:text-gray-400">{selectedDocument?.uploadedBy}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <p className="text-gray-500 dark:text-gray-400">{selectedDocument?.status}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-md">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;