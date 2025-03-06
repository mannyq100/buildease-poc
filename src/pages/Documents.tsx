/**
 * Documents.tsx - Document management page
 * Upload, organize, and manage project documents
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Icons
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Folder,
  MoreHorizontal,
  Search,
  Share2,
  Star,
  Trash2,
  Upload
} from 'lucide-react'

// UI Components
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Shared Components
import { MainNavigation } from '@/components/navigation/MainNavigation'
import {
  PageHeader
} from '@/components/shared'
import { usePageActions } from '@/hooks/usePageActions'

// Custom Components
import { DocumentItem } from '@/components/documents/DocumentItem'

// Types and Utilities
import { Document, NewDocument } from '@/types/documents'
import { filterDocuments, getFileIcon } from '@/utils/documentUtils'

// Mock Data
import {
  DOCUMENT_CATEGORIES,
  FILE_TYPE_OPTIONS,
  INITIAL_DOCUMENTS,
  PROJECT_OPTIONS,
  STATUS_OPTIONS
} from '@/data/mock/documents'

/**
 * Documents management page component
 * Provides functionality to upload, manage, and view documents
 */
export function Documents() {
  const navigate = useNavigate()
  const { getCommonActions } = usePageActions('documents')
  
  // State management
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [newDocument, setNewDocument] = useState<NewDocument>({
    name: '',
    project: '',
    category: '',
    type: '',
    size: '',
    status: 'pending'
  })
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [actionDocument, setActionDocument] = useState<Document | null>(null)
  const [newDocumentName, setNewDocumentName] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('')

  // Filtered documents - memoized to prevent recalculation on every render
  const filteredDocuments = useMemo(() => {
    return filterDocuments(documents, searchQuery, projectFilter, categoryFilter, statusFilter)
  }, [documents, searchQuery, projectFilter, categoryFilter, statusFilter])

  /**
   * Handle opening document view dialog
   */
  function openViewDialog(document: Document) {
    setSelectedDocument(document)
    setViewDialogOpen(true)
  }

  /**
   * Handle uploading a new document
   */
  function handleUploadDocument() {
    // Validate required fields
    if (!newDocument.name || !newDocument.project || !newDocument.category) {
      return
    }
    
    // In a real app, this would handle the actual file upload
    const id = Math.max(...documents.map(d => d.id)) + 1
    const newDoc: Document = {
      ...newDocument,
      id,
      uploaded: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      uploadedBy: 'John Doe', // Would be the current user
      starred: false
    } as Document
    
    setDocuments([newDoc, ...documents])
    setNewDocument({
      name: '',
      project: '',
      category: '',
      type: '',
      size: '',
      status: 'pending'
    })
    setUploadDialogOpen(false)
  }

  /**
   * Handle deleting a document
   */
  function handleDeleteDocument(id: number) {
    setDocuments(documents.filter(doc => doc.id !== id))
    if (selectedDocument && selectedDocument.id === id) {
      setViewDialogOpen(false)
    }
  }

  /**
   * Handle toggling star status
   */
  function handleToggleStar(id: number) {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, starred: !doc.starred } : doc
    ))
    
    if (selectedDocument && selectedDocument.id === id) {
      setSelectedDocument({ ...selectedDocument, starred: !selectedDocument.starred })
    }
  }

  /**
   * Reset all filters to default values
   */
  function handleResetFilters() {
    setProjectFilter('all')
    setCategoryFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
  }

  /**
   * Opens the rename dialog for a document
   */
  function openRenameDialog(document: Document) {
    setActionDocument(document)
    setNewDocumentName(document.name)
    setRenameDialogOpen(true)
  }

  /**
   * Handles document rename operation
   */
  function handleRenameDocument() {
    if (!actionDocument || !newDocumentName.trim()) return
    
    setDocuments(documents.map(doc => 
      doc.id === actionDocument.id 
        ? { ...doc, name: newDocumentName } 
        : doc
    ))
    
    setRenameDialogOpen(false)
    setActionDocument(null)
    setNewDocumentName('')
  }

  /**
   * Opens the move dialog for a document
   */
  function openMoveDialog(document: Document) {
    setActionDocument(document)
    setSelectedFolder('')
    setMoveDialogOpen(true)
  }

  /**
   * Handles moving a document to a different folder
   */
  function handleMoveDocument() {
    if (!actionDocument || !selectedFolder) return
    
    // In a real app, this would update the document's folder/category
    setDocuments(documents.map(doc => 
      doc.id === actionDocument.id 
        ? { ...doc, category: selectedFolder } 
        : doc
    ))
    
    setMoveDialogOpen(false)
    setActionDocument(null)
    setSelectedFolder('')
  }

  /**
   * Copies a shareable link for the document
   */
  function handleCopyLink(document: Document) {
    // In a real app, this would copy a shareable link to the clipboard
    const link = `https://buildease-app.com/documents/${document.id}`
    navigator.clipboard.writeText(link)
      .then(() => {
        // Show a toast notification in a real app
        alert(`Link for "${document.name}" copied to clipboard`)
      })
      .catch(err => {
        console.error('Failed to copy link:', err)
        alert('Failed to copy link')
      })
  }

  /**
   * Download a document
   */
  function handleDownloadDocument(document: Document) {
    // In a real app, this would trigger a download
    alert(`Downloading ${document.name}`)
    console.log(`Downloading document ID: ${document.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <MainNavigation
        title="Documents"
        icon={<FileText className="h-6 w-6" />}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
              onClick: () => setUploadDialogOpen(true)
            }
          ]}
        />

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 mb-8">
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
                    {DOCUMENT_CATEGORIES.map(category => (
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
                        {PROJECT_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
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
                        {FILE_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
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
                        {STATUS_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={handleResetFilters}
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
                            onRename={() => openRenameDialog(doc)}
                            onMove={() => openMoveDialog(doc)}
                            onCopy={() => handleCopyLink(doc)}
                            onDownload={() => handleDownloadDocument(doc)}
                          />
                        ))
                      ) : (
                        <EmptyDocumentState onUpload={() => setUploadDialogOpen(true)} />
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
                            onRename={() => openRenameDialog(doc)}
                            onMove={() => openMoveDialog(doc)}
                            onCopy={() => handleCopyLink(doc)}
                            onDownload={() => handleDownloadDocument(doc)}
                          />
                        ))
                      ) : (
                        <EmptyStarredState />
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
                          onRename={() => openRenameDialog(doc)}
                          onMove={() => openMoveDialog(doc)}
                          onCopy={() => handleCopyLink(doc)}
                          onDownload={() => handleDownloadDocument(doc)}
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
          {selectedDocument && (
            <div className="grid gap-4 py-4">
              <DocumentDetail label="Document Name" value={selectedDocument.name} />
              <DocumentDetail label="Project" value={selectedDocument.project} />
              <DocumentDetail label="Category" value={selectedDocument.category} />
              <DocumentDetail label="File Type" value={selectedDocument.type} />
              <DocumentDetail label="Size" value={selectedDocument.size} />
              <DocumentDetail label="Uploaded" value={selectedDocument.uploaded} />
              <DocumentDetail label="Uploaded By" value={selectedDocument.uploadedBy} />
              <DocumentDetail label="Status" value={selectedDocument.status} />
            </div>
          )}
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
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400"
                  onClick={() => {
                    if (selectedDocument) {
                      handleDeleteDocument(selectedDocument.id)
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Document Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>
              Enter a new name for the document.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Document Name
              </label>
              <Input
                id="name"
                value={newDocumentName}
                onChange={(e) => setNewDocumentName(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameDocument}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Document Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move Document</DialogTitle>
            <DialogDescription>
              Select a folder to move the document to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="folder" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Destination Folder
              </label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-full border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-md">
                  {DOCUMENT_CATEGORIES.filter(c => c.id !== 'all').map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMoveDocument} disabled={!selectedFolder}>
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Component to display a field in the document detail view
 */
interface DocumentDetailProps {
  label: string
  value: string
}

function DocumentDetail({ label, value }: DocumentDetailProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <p className="text-gray-500 dark:text-gray-400">{value}</p>
    </div>
  )
}

/**
 * Empty state for document list
 */
interface EmptyDocumentStateProps {
  onUpload: () => void
}

function EmptyDocumentState({ onUpload }: EmptyDocumentStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
        <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No documents found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        We couldn't find any documents matching your current filters. Try adjusting your search criteria or upload a new document.
      </p>
      <Button 
        onClick={onUpload}
        className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white shadow-md"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload a Document
      </Button>
    </div>
  )
}

/**
 * Empty state for starred documents
 */
function EmptyStarredState() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
        <Star className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No starred documents</h3>
      <p className="text-gray-500 dark:text-gray-400">
        You haven't starred any documents yet. Star important documents to find them quickly.
      </p>
    </div>
  )
}

export default Documents