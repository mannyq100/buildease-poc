import React, { useState, useCallback } from 'react';
import { cn } from '@/utils/core/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadDocumentsModal } from './UploadDocumentsModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Upload, 
  Search, 
  MoreHorizontal,
  FileText,
  Image,
  File,
  Download,
  Trash2,
  Eye,
  Edit3,
  Plus,
  FolderOpen,
  Clock,
  User
} from 'lucide-react';

// Document type definition
interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  tags: string[];
  version: number;
  status: string;
}

// Mock document data based on common construction project documents
const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Architectural Plans - Floor 1.pdf',
    type: 'application/pdf',
    size: 2.4, // MB
    category: 'Plans',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: '2024-01-15T10:30:00Z',
    lastModified: '2024-01-18T14:20:00Z',
    tags: ['floor-plan', 'architectural', 'approved'],
    version: 2,
    status: 'approved'
  },
  {
    id: 'doc-2',
    name: 'Building Permit - City Approval.pdf',
    type: 'application/pdf',
    size: 0.8,
    category: 'Permits',
    uploadedBy: 'Mike Chen',
    uploadedAt: '2024-01-10T09:15:00Z',
    lastModified: '2024-01-10T09:15:00Z',
    tags: ['permit', 'legal', 'required'],
    version: 1,
    status: 'approved'
  },
  {
    id: 'doc-3',
    name: 'Site Progress Photos - Week 2.zip',
    type: 'application/zip',
    size: 15.7,
    category: 'Photos',
    uploadedBy: 'David Kumar',
    uploadedAt: '2024-01-20T16:45:00Z',
    lastModified: '2024-01-20T16:45:00Z',
    tags: ['progress', 'foundation', 'week-2'],
    version: 1,
    status: 'review'
  },
  {
    id: 'doc-4',
    name: 'Safety Inspection Report.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1.2,
    category: 'Reports',
    uploadedBy: 'Emma Rodriguez',
    uploadedAt: '2024-01-18T11:30:00Z',
    lastModified: '2024-01-19T08:45:00Z',
    tags: ['safety', 'inspection', 'monthly'],
    version: 1,
    status: 'approved'
  },
  {
    id: 'doc-5',
    name: 'Material Specifications - Steel.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 0.6,
    category: 'Specifications',
    uploadedBy: 'James Wilson',
    uploadedAt: '2024-01-12T13:20:00Z',
    lastModified: '2024-01-16T10:30:00Z',
    tags: ['materials', 'steel', 'specifications'],
    version: 3,
    status: 'draft'
  }
];

const documentCategories = [
  'All Categories',
  'Plans',
  'Permits',
  'Photos',
  'Reports',
  'Specifications',
  'Contracts',
  'Safety'
];

const documentStatuses = [
  'All Status',
  'draft',
  'review',
  'approved',
  'rejected'
];

interface DocumentManagerProps {
  projectId: string;
  className?: string;
  hideUploadButton?: boolean;
}

export function DocumentManager({ projectId: _projectId, className, hideUploadButton = false }: DocumentManagerProps) {
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [_selectedDocument, _setSelectedDocument] = useState<Document | null>(null);

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All Categories' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All Status' || doc.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Group documents by category for better organization
  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setUploadFiles(files);
      setShowUploadModal(true);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      setUploadFiles(files);
      setShowUploadModal(true);
    }
  }, []);

  const handleUpload = async (files: File[], category: string) => {
    // Simulate file upload
    for (const file of files) {
      const newDoc = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size / (1024 * 1024), // Convert to MB
        category: category,
        uploadedBy: 'Current User',
        uploadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [],
        version: 1,
        status: 'draft' as const
      };
      
      setDocuments(prev => [newDoc, ...prev]);
    }
    
    setUploadFiles([]);
    setShowUploadModal(false);
  };

  const handleDelete = (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('image')) return <Image className="h-8 w-8 text-blue-500" />;
    if (type.includes('word')) return <FileText className="h-8 w-8 text-blue-600" />;
    if (type.includes('excel') || type.includes('spreadsheet')) return <FileText className="h-8 w-8 text-green-600" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      draft: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };

    return (
      <Badge variant="outline" className={cn('text-xs', variants[status as keyof typeof variants])}>
        {status}
      </Badge>
    );
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB >= 1) {
      return `${sizeInMB.toFixed(1)} MB`;
    }
    return `${(sizeInMB * 1024).toFixed(0)} KB`;
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Enhanced Header with Search and Filters */}
      <div className="bg-gradient-to-r from-slate-50/80 to-buildease-blue-50/40 dark:from-slate-800/80 dark:to-buildease-blue-950/40 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-slate-500 to-buildease-orange-500 rounded-full" />
                Document Library
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage project files, drawings, and documentation</p>
            </div>
            {!hideUploadButton && (
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-xl font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search documents, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-2 focus:ring-buildease-blue-500/20 focus:border-buildease-blue-500 transition-all duration-300"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 h-12 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40 h-12 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 rounded-xl">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {documentStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Upload Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 group',
          dragActive 
            ? 'border-buildease-blue-500 bg-gradient-to-br from-buildease-blue-50 to-buildease-blue-100/50 dark:from-buildease-blue-950/30 dark:to-buildease-blue-900/20 scale-[1.02] shadow-lg' 
            : 'border-slate-300 dark:border-slate-700 hover:border-buildease-blue-400 dark:hover:border-buildease-blue-600 hover:bg-gradient-to-br hover:from-slate-50 hover:to-buildease-blue-50/30 dark:hover:from-slate-800/50 dark:hover:to-buildease-blue-950/20'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Upload className="h-8 w-8 text-slate-500 dark:text-slate-400 group-hover:text-buildease-blue-600 transition-colors" />
        </div>
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Upload Documents</h4>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Drag and drop files here, or{' '}
          <label className="text-buildease-blue-600 hover:text-buildease-blue-700 cursor-pointer font-semibold underline decoration-2 underline-offset-2 hover:decoration-buildease-blue-700 transition-colors">
            browse your device
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">PDF</span>
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">Images</span>
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">Documents</span>
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">Archives</span>
        </div>
      </div>

      {/* Enhanced Documents Grid */}
      {Object.keys(documentsByCategory).length === 0 ? (
        <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-buildease-blue-950/10 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center">
              <FolderOpen className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {searchTerm || selectedCategory !== 'All Categories' || selectedStatus !== 'All Status'
                ? 'No documents match your criteria'
                : 'No documents uploaded yet'
              }
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-md">
              {searchTerm || selectedCategory !== 'All Categories' || selectedStatus !== 'All Status'
                ? 'Try adjusting your search terms or filters to find what you\'re looking for'
                : 'Start building your project document library by uploading plans, contracts, permits, and other important files'
              }
            </p>
            {!hideUploadButton && (
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 hover:from-buildease-blue-700 hover:to-buildease-blue-800 text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-xl font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                {searchTerm || selectedCategory !== 'All Categories' || selectedStatus !== 'All Status'
                  ? 'Upload Document'
                  : 'Upload First Document'
                }
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(documentsByCategory).map(([category, docs]) => (
            <Card key={category} className="border-slate-200/60 dark:border-slate-700/60 shadow-lg bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-buildease-blue-950/10 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/80 to-buildease-blue-50/40 dark:from-slate-800/80 dark:to-buildease-blue-950/40 border-b border-slate-200/50 dark:border-slate-700/50">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{category}</span>
                      <Badge variant="outline" className="bg-buildease-blue-50 text-buildease-blue-700 border-buildease-blue-200 dark:bg-buildease-blue-900/20 dark:text-buildease-blue-300 dark:border-buildease-blue-700">
                        {docs.length} {docs.length === 1 ? 'file' : 'files'}
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="group bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 hover:border-buildease-blue-300 dark:hover:border-buildease-blue-600"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {getFileIcon(doc.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-buildease-blue-700 dark:group-hover:text-buildease-blue-300 transition-colors">
                              {doc.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                {formatFileSize(doc.size)}
                              </span>
                              {doc.version > 1 && (
                                <Badge variant="outline" className="text-xs bg-buildease-orange-50 text-buildease-orange-700 border-buildease-orange-200 dark:bg-buildease-orange-900/20 dark:text-buildease-orange-300 dark:border-buildease-orange-700">
                                  v{doc.version}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-900/20">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-900/20">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-900/20">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-900/20">
                              <Edit3 className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(doc.id)}
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          {getStatusBadge(doc.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3" />
                            </div>
                            <span>Uploaded by {doc.uploadedBy}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                              <Clock className="h-3 w-3" />
                            </div>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {doc.tags && doc.tags.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                            <div className="flex flex-wrap gap-1">
                              {doc.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadDocumentsModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        uploadFiles={uploadFiles}
      />
    </div>
  );
}