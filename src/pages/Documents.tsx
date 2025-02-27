import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { 
  FileText, 
  Filter, 
  Search, 
  Upload, 
  Plus, 
  Star, 
  Folder, 
  Download, 
  Share2, 
  Trash2, 
  Image, 
  MoreHorizontal,
  FileType,
  Archive,
  CheckCircle2,
  CalendarIcon,
  Eye
} from 'lucide-react';
import { 
  DashboardLayout, 
  DashboardSection, 
  Grid 
} from '@/components/layout/test';
import { 
  MetricCard,
  PageHeader,
  StatusBadge
} from '@/components/shared';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import MainNavigation from '@/components/layout/MainNavigation';

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

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
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

  // Filter documents based on search query and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.project.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = projectFilter === 'all' || doc.project.includes(projectFilter === 'villa' ? 'Villa' : 'Office');
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesProject && matchesCategory && matchesStatus;
  });

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <MainNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Documents"
          subtitle="Manage and organize your project documents"
          icon={<FileText className="h-6 w-6" />}
          actions={[
            {
              label: "Upload Document",
              icon: <Upload />,
              variant: "construction",
              onClick: () => setUploadDialogOpen(true)
            },
            {
              label: "Export",
              icon: <Download />,
              variant: "blueprint",
              onClick: () => {/* Export functionality */}
            }
          ]}
        />

        {/* Main Content */}
        <div className="mt-8">
          <DashboardLayout>
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
                      <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                        <SelectContent>
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
                        <SelectContent>
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
                        <SelectContent>
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
                        <SelectContent>
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
          </DashboardLayout>

          {/* Upload Document Dialog */}
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogContent className="sm:max-w-md rounded-xl shadow-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Upload Document</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Add a new document to your project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Upload area with drag & drop */}
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-6 text-center">
                  <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Drop your file here, or <span className="text-blue-600 dark:text-blue-400">browse</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Supports PDF, DOCX, XLS, DWG, JPG, PNG (Up to 10MB)
                    </p>
                  </div>
                </div>
                
                {/* Form fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Name</label>
                    <Input
                      placeholder="Enter document name"
                      value={newDocument.name}
                      onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
                      className="mt-1 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project</label>
                    <Select value={newDocument.project} onValueChange={(value) => setNewDocument({...newDocument, project: value})}>
                      <SelectTrigger className="mt-1 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Villa Construction">Villa Construction</SelectItem>
                        <SelectItem value="Office Renovation">Office Renovation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <Select value={newDocument.category} onValueChange={(value) => setNewDocument({...newDocument, category: value})}>
                      <SelectTrigger className="mt-1 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plans">Plans & Blueprints</SelectItem>
                        <SelectItem value="permits">Permits & Approvals</SelectItem>
                        <SelectItem value="contracts">Contracts</SelectItem>
                        <SelectItem value="reports">Reports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-end border-t border-gray-200 dark:border-slate-700 pt-4">
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadDocument}>
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Document Dialog */}
          {selectedDocument && (
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{selectedDocument.name}</DialogTitle>
                  <DialogDescription>
                    Uploaded on {selectedDocument.uploaded} by {selectedDocument.uploadedBy}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    {/* This would be a document preview in a real app */}
                    <div className="text-center p-8">
                      {getFileIcon(selectedDocument.type)}
                      <p className="text-gray-500 mt-2">Document Preview</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Project:</span>
                      <span className="ml-2 font-medium">{selectedDocument.project}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">File Type:</span>
                      <span className="ml-2 font-medium">{selectedDocument.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Size:</span>
                      <span className="ml-2 font-medium">{selectedDocument.size}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2">
                        <StatusBadge status={selectedDocument.status === 'approved' ? 'completed' : 'pending'} />
                      </span>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                    Close
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

// Document list item component
const DocumentItem = ({ document, icon, onView, onDelete, onToggleStar }) => {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="p-2 mr-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-6">
            {document.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {document.project}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 dark:text-gray-500 dark:hover:text-yellow-300"
        >
          <Star className={`w-5 h-5 ${document.starred ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-300 dark:text-yellow-300' : ''}`} />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={`${
              document.status === 'approved' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : document.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300">
              {document.type}
            </Badge>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {document.size}
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {document.uploaded}
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/20"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/20"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents; 