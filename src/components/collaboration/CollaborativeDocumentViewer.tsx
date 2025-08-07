/**
 * CollaborativeDocumentViewer Component
 * Document viewer with real-time collaboration features
 * Shows live cursors, presence indicators, and collaborative editing
 */

import { useState, useRef, useEffect } from 'react';
import { useRealTimeCollaboration } from '@/hooks/useRealTimeCollaboration';
import { PresenceIndicator } from './PresenceIndicator';
import { ContainerLiveCursors } from './LiveCursors';
import { RealTimeComments, InlineRealTimeComments } from './RealTimeComments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  FileText, 
  MessageCircle, 
  Eye,
  Download,
  Share2,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { formatBytes } from '@/utils/fileUtils';
import { formatDistanceToNow } from 'date-fns';
import type { Document } from '@/types/database';

interface CollaborativeDocumentViewerProps {
  document: Document;
  projectId: string;
  className?: string;
  showComments?: boolean;
  showPresence?: boolean;
  showCursors?: boolean;
  allowEditing?: boolean;
}

export function CollaborativeDocumentViewer({
  document,
  projectId,
  className = '',
  showComments = true,
  showPresence = true,
  showCursors = true,
  allowEditing = false
}: CollaborativeDocumentViewerProps) {
  const [activeTab, setActiveTab] = useState('view');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const roomId = `document-${document.id}`;

  // Real-time collaboration
  const {
    isJoined,
    users,
    otherUsers,
    onlineCount,
    updatePresence
  } = useRealTimeCollaboration({
    roomId,
    roomType: 'document',
    entityId: document.id,
    enabled: true
  });

  // Update presence when user is viewing document
  useEffect(() => {
    if (isJoined) {
      updatePresence({
        current_page: `document/${document.id}`,
        status: 'online'
      });
    }
  }, [isJoined, document.id, updatePresence]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Get document preview URL
  const getDocumentPreviewUrl = () => {
    // In a real implementation, this would generate a preview URL or embed viewer
    return document.file_path;
  };

  // Check if document is an image
  const isImage = document.mime_type?.startsWith('image/');
  const isPDF = document.mime_type === 'application/pdf';
  const isVideo = document.mime_type?.startsWith('video/');

  // Get document icon
  const getDocumentIcon = () => {
    if (isImage) return '🖼️';
    if (isPDF) return '📄';
    if (isVideo) return '🎥';
    return '📄';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with document info and presence */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="text-2xl flex-shrink-0">
                {getDocumentIcon()}
              </div>
              
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg truncate">
                  {document.name}
                </CardTitle>
                
                {document.caption && (
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                    {document.caption}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {document.document_type}
                    </Badge>
                  </div>
                  
                  {document.file_size_bytes && (
                    <span>{formatBytes(document.file_size_bytes)}</span>
                  )}
                  
                  <span>
                    {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions and presence */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {showPresence && (
                <PresenceIndicator
                  roomId={roomId}
                  roomType="document"
                  entityId={document.id}
                />
              )}
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button variant="ghost" size="sm" className="touch-manipulation">
                <Download className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" className="touch-manipulation">
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleFullscreen}
                className="touch-manipulation"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>

              {showComments && (
                <Sheet open={showCommentsSheet} onOpenChange={setShowCommentsSheet}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="touch-manipulation">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                      <SheetTitle>Document Comments</SheetTitle>
                      <SheetDescription>
                        Collaborate on this document with your team
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <RealTimeComments
                        entityType="project"
                        entityId={document.project_id}
                        maxHeight="calc(100vh - 200px)"
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main content with tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Document
          </TabsTrigger>
          {showComments && (
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comments
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          {/* Document viewer with collaboration features */}
          <Card className="relative">
            <CardContent className="p-0">
              <div 
                ref={viewerRef}
                className="relative min-h-[600px] bg-muted/30 rounded-lg overflow-hidden"
              >
                {/* Live cursors overlay */}
                {showCursors && (
                  <ContainerLiveCursors
                    roomId={roomId}
                    roomType="document"
                    entityId={document.id}
                    containerRef={viewerRef}
                    className="z-20"
                  />
                )}

                {/* Document content */}
                <div className="relative z-10 h-full">
                  {isImage ? (
                    <img
                      src={getDocumentPreviewUrl()}
                      alt={document.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png';
                      }}
                    />
                  ) : isPDF ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">PDF Document</h3>
                          <p className="text-muted-foreground text-sm">
                            Click to open in a new tab
                          </p>
                        </div>
                        <Button
                          onClick={() => window.open(getDocumentPreviewUrl(), '_blank')}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open PDF
                        </Button>
                      </div>
                    </div>
                  ) : isVideo ? (
                    <video
                      src={getDocumentPreviewUrl()}
                      controls
                      className="w-full h-full"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Document Preview</h3>
                          <p className="text-muted-foreground text-sm">
                            Preview not available for this file type
                          </p>
                        </div>
                        <Button
                          onClick={() => window.open(getDocumentPreviewUrl(), '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download File
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Collaboration overlay info */}
                {isJoined && otherUsers.length > 0 && (
                  <div className="absolute top-4 right-4 z-30">
                    <Card className="bg-background/90 backdrop-blur-sm">
                      <CardContent className="p-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-muted-foreground">
                            {otherUsers.length} other{otherUsers.length !== 1 ? 's' : ''} viewing
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Document metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.description && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{document.description}</p>
                </div>
              )}

              {document.tags && document.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {document.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">File Type:</span>
                  <span className="ml-2">{document.mime_type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-2">
                    {document.file_size_bytes ? formatBytes(document.file_size_bytes) : 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">
                    {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="ml-2">
                    {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {showComments && (
          <TabsContent value="comments">
            <InlineRealTimeComments
              entityType="project"
              entityId={document.project_id}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}