/**
 * ProjectMedia Page
 * Comprehensive media management interface for projects
 * Integrates all advanced media management features
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MediaGallery, MediaUpload } from '@/components/media';
import { useMediaStats, useMediaCollections } from '@/hooks/queries/useAdvancedMedia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  FolderOpen,
  BarChart3
} from 'lucide-react';
import { formatBytes } from '@/utils/fileUtils';
import type { MediaSearchResult } from '@/types/database';

interface ProjectMediaProps {
  className?: string;
}

export default function ProjectMedia({ className = '' }: ProjectMediaProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState('gallery');
  const [selectedDocument, setSelectedDocument] = useState<MediaSearchResult | null>(null);

  // Data fetching
  const { data: mediaStats, isLoading: statsLoading } = useMediaStats({ 
    projectId: projectId!, 
    enabled: !!projectId 
  });
  
  const { data: collections = [] } = useMediaCollections({ 
    projectId: projectId!, 
    enabled: !!projectId 
  });

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const handleUploadComplete = () => {
    // Switch to gallery tab after successful upload
    setActiveTab('gallery');
  };

  const handleDocumentSelect = (document: MediaSearchResult) => {
    setSelectedDocument(document);
    // Could open document viewer/editor here
  };

  // Calculate type distribution for stats
  const typeStats = mediaStats?.document_types || {};
  const totalFiles = mediaStats?.total_documents || 0;
  const totalSize = mediaStats?.total_size_bytes || 0;

  const getTypeIcon = (type: string) => {
    if (type.toLowerCase().includes('photo') || type.toLowerCase().includes('image')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    if (type.toLowerCase().includes('video')) {
      return <Video className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Media</h1>
          <p className="text-muted-foreground mt-1">
            Manage, organize, and search your project files
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!statsLoading && mediaStats && (
            <div className="text-right text-sm text-muted-foreground">
              <div>{totalFiles} files</div>
              <div>{formatBytes(totalSize)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {!statsLoading && mediaStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                  <p className="text-2xl font-bold">{totalFiles}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold">{mediaStats.total_size_mb}MB</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Uploads</p>
                  <p className="text-2xl font-bold">{mediaStats.recent_uploads}</p>
                </div>
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Collections</p>
                  <p className="text-2xl font-bold">{collections.length}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* File Type Distribution */}
      {Object.keys(typeStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              File Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeStats).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {getTypeIcon(type)}
                  {type}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Media Gallery
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          <MediaGallery
            projectId={projectId}
            onDocumentSelect={handleDocumentSelect}
            className="min-h-[600px]"
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <MediaUpload
            projectId={projectId}
            onUploadComplete={handleUploadComplete}
            maxFiles={20}
            maxFileSize={500}
            className="min-h-[400px]"
          />
          
          {/* Upload Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upload Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-2"></div>
                <p>
                  <strong>Organize your files:</strong> Add captions and tags to make files easier to find later
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-2"></div>
                <p>
                  <strong>Optimize file sizes:</strong> Compress large images and videos to save storage space
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-2"></div>
                <p>
                  <strong>Use descriptive names:</strong> Name your files clearly to identify content quickly
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-2"></div>
                <p>
                  <strong>Batch operations:</strong> Upload multiple files at once and use bulk editing features
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Collections Preview */}
      {collections.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Media Collections
              </CardTitle>
              <Button variant="outline" size="sm">
                Manage Collections
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {collections.slice(0, 8).map((collection) => (
                <Card key={collection.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center">
                      {collection.cover_image_url ? (
                        <img
                          src={collection.cover_image_url}
                          alt={collection.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <FolderOpen className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium truncate">{collection.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {collection.document_count || 0} files
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {collection.collection_type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}