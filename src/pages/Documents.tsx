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
  CalendarIcon
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Documents" 
        subtitle="Manage your project documents"
        action={
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        }
      />
      
      <DashboardLayout>
        {/* Document Stats */}
        <Grid cols={3} className="mb-6">
          <MetricCard
            icon={<FileText className="w-5 h-5" />}
            label="Total Documents"
            value={documents.length.toString()}
            subtext="Across all projects"
          />
          <MetricCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Approved Documents"
            value={documents.filter(d => d.status === 'approved').length.toString()}
            subtext="Ready for use"
          />
          <MetricCard
            icon={<CalendarIcon className="w-5 h-5" />}
            label="Recent Uploads"
            value={documents.filter(d => new Date(d.uploaded) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length.toString()}
            subtext="Last 7 days"
          />
        </Grid>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-1">
            <DashboardSection>
              <div className="space-y-1">
                <h3 className="font-medium mb-3 text-gray-900">Categories</h3>
                
                {categories.map(category => (
                  <button
                    key={category.id}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setCategoryFilter(category.id)}
                  >
                    <div className="flex items-center">
                      <Folder className="w-4 h-4 mr-2 text-primary" />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{category.count}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-3 text-gray-900">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Project</label>
                    <Select value={projectFilter} onValueChange={setProjectFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Projects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        <SelectItem value="villa">Villa Construction</SelectItem>
                        <SelectItem value="office">Office Renovation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">File Type</label>
                    <Select>
                      <SelectTrigger>
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
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
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
                </div>
              </div>
            </DashboardSection>
          </div>
          
          {/* Main Content - Document List */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center gap-4">
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
            
            <DashboardSection>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Documents</TabsTrigger>
                  <TabsTrigger value="starred">Starred</TabsTrigger>
                  <TabsTrigger value="recent">Recently Added</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-2">
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
                    <div className="text-center py-8 text-gray-500">
                      No documents found matching your search criteria.
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="starred" className="space-y-2">
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
                    <div className="text-center py-8 text-gray-500">
                      No starred documents found.
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="recent" className="space-y-2">
                  {/* We'd normally track recently added docs, using a subset for demo */}
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
            </DashboardSection>
          </div>
        </div>
      </DashboardLayout>
      
      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
            <DialogDescription>
              Upload a document to add to your project files.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select 
                value={newDocument.project}
                onValueChange={(value) => setNewDocument({...newDocument, project: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Villa Construction">Villa Construction</SelectItem>
                  <SelectItem value="Office Renovation">Office Renovation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={newDocument.category}
                onValueChange={(value) => setNewDocument({...newDocument, category: value})}
              >
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Title</label>
              <Input 
                placeholder="Enter document title" 
                value={newDocument.name}
                onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
              />
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag & drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports: PDF, DOCX, XLSX, DWG, JPG, PNG (max 25MB)
              </p>
              <Button variant="outline" className="mt-4">
                Select File
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument}>
              Upload Document
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
  );
};

// Document list item component
const DocumentItem = ({ document, icon, onView, onDelete, onToggleStar }) => {
  return (
    <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-all">
      <div className="p-2 bg-gray-100 rounded-lg mr-3">
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <h4 className="font-medium truncate mr-2">{document.name}</h4>
          {document.starred && <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
        </div>
        <div className="flex text-sm text-gray-600 items-center space-x-2 mt-1">
          <span>{document.project}</span>
          <span>•</span>
          <span>{document.uploaded}</span>
          <span>•</span>
          <span>{document.size}</span>
          {document.status === 'approved' && (
            <>
              <span>•</span>
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                <span>Approved</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-2">
        <Button variant="ghost" size="sm" onClick={onView}>
          View
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleStar}>
              <Star className="w-4 h-4 mr-2" />
              {document.starred ? 'Unstar' : 'Star'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Documents; 