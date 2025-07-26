/**
 * Comprehensive Upload Manager
 * Integrates all upload enhancements: error handling, progress tracking, mobile optimization
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Image, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  X,
  RefreshCw,
  Pause,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Import our enhanced upload services
import { uploadQueueService, useUploadQueue } from '@/services/uploadQueueService';
import { uploadErrorHandlingService } from '@/services/uploadErrorHandlingService';
import UploadProgressTracker from './UploadProgressTracker';
import MobileOptimizedUpload from './MobileOptimizedUpload';

interface ComprehensiveUploadManagerProps {
  projectId: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  allowedTypes?: ('images' | 'documents')[];
  maxFiles?: number;
  compact?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadedAt: Date;
}

interface UploadSession {
  id: string;
  files: File[];
  type: 'images' | 'documents';
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'paused';
  progress: number;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export function ComprehensiveUploadManager({
  projectId,
  onUploadComplete,
  onUploadError,
  className,
  allowedTypes = ['images', 'documents'],
  maxFiles = 20,
  compact = false
}: ComprehensiveUploadManagerProps) {
  const [uploadSessions, setUploadSessions] = useState<UploadSession[]>([]);
  const [activeTab, setActiveTab] = useState<'images' | 'documents'>(allowedTypes[0]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queueStatus = useUploadQueue();

  // Configuration for different upload types
  const uploadConfigs = {
    images: {
      bucket: 'progress-images',
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
      maxSizeBytes: 10 * 1024 * 1024, // 10MB
      label: 'Progress Images',
      icon: Image,
      description: 'Upload construction progress photos'
    },
    documents: {
      bucket: 'documents',
      acceptedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ],
      maxSizeBytes: 25 * 1024 * 1024, // 25MB
      label: 'Documents',
      icon: FileText,
      description: 'Upload project documents, plans, and files'
    }
  };

  const createUploadSession = useCallback((files: File[], type: 'images' | 'documents'): string => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newSession: UploadSession = {
      id: sessionId,
      files,
      type,
      status: 'pending',
      progress: 0,
      startedAt: new Date()
    };

    setUploadSessions(prev => [...prev, newSession]);
    return sessionId;
  }, []);

  const updateUploadSession = useCallback((sessionId: string, updates: Partial<UploadSession>) => {
    setUploadSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates }
          : session
      )
    );
  }, []);

  const removeUploadSession = useCallback((sessionId: string) => {
    setUploadSessions(prev => prev.filter(session => session.id !== sessionId));
  }, []);

  const handleFilesSelected = useCallback(async (files: File[], type: 'images' | 'documents') => {
    if (files.length === 0) return;

    setGlobalError(null);
    const sessionId = createUploadSession(files, type);

    try {
      updateUploadSession(sessionId, { status: 'uploading' });

      // Add files to upload queue
      const uploadPromises = files.map(file => {
        const config = uploadConfigs[type];
        return uploadQueueService.addToQueue({
          file,
          bucket: config.bucket,
          path: `${projectId}/${Date.now()}-${file.name}`,
          metadata: {
            projectId,
            uploadType: type,
            sessionId,
            originalName: file.name
          }
        });
      });

      // Track overall progress
      let completedUploads = 0;
      const totalUploads = files.length;

      const results = await Promise.allSettled(uploadPromises);
      
      // Process results
      const uploadedFiles: UploadedFile[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const file = files[index];
          uploadedFiles.push({
            id: result.value.id || `file-${index}`,
            name: file.name,
            url: result.value.url || '',
            type: type === 'images' ? 'image' : 'document',
            size: file.size,
            uploadedAt: new Date()
          });
          completedUploads++;
        } else {
          const file = files[index];
          const errorMessage = uploadErrorHandlingService.getErrorMessage(result.reason);
          errors.push(`${file.name}: ${errorMessage}`);
        }

        // Update progress
        const progress = Math.round((completedUploads / totalUploads) * 100);
        updateUploadSession(sessionId, { progress });
      });

      if (errors.length > 0) {
        const errorSummary = uploadErrorHandlingService.getErrorMessage({
          message: `${errors.length} of ${totalUploads} files failed to upload`,
          details: errors
        });
        
        updateUploadSession(sessionId, { 
          status: 'failed', 
          error: errorSummary,
          completedAt: new Date()
        });

        toast({
          title: "Upload Partially Failed",
          description: `${uploadedFiles.length} files uploaded successfully, ${errors.length} failed`,
          variant: "destructive"
        });

        onUploadError?.(errorSummary);
      } else {
        updateUploadSession(sessionId, { 
          status: 'completed',
          progress: 100,
          completedAt: new Date()
        });

        toast({
          title: "Upload Successful",
          description: `${uploadedFiles.length} files uploaded successfully`,
          variant: "default"
        });
      }

      if (uploadedFiles.length > 0) {
        onUploadComplete?.(uploadedFiles);
      }

    } catch (error) {
      const errorMessage = uploadErrorHandlingService.getErrorMessage(error);
      updateUploadSession(sessionId, { 
        status: 'failed', 
        error: errorMessage,
        completedAt: new Date()
      });

      setGlobalError(errorMessage);
      onUploadError?.(errorMessage);

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [createUploadSession, updateUploadSession, uploadConfigs, projectId, onUploadComplete, onUploadError, toast]);

  const handleRetrySession = useCallback(async (sessionId: string) => {
    const session = uploadSessions.find(s => s.id === sessionId);
    if (!session || session.status === 'uploading') return;

    await handleFilesSelected(session.files, session.type);
    removeUploadSession(sessionId);
  }, [uploadSessions, handleFilesSelected, removeUploadSession]);

  const handlePauseSession = useCallback((sessionId: string) => {
    updateUploadSession(sessionId, { status: 'paused' });
    // TODO: Implement actual pause functionality in upload queue
    toast({
      title: "Upload Paused",
      description: "Upload has been paused and can be resumed later",
    });
  }, [updateUploadSession, toast]);

  const handleResumeSession = useCallback((sessionId: string) => {
    updateUploadSession(sessionId, { status: 'uploading' });
    // TODO: Implement actual resume functionality in upload queue
    toast({
      title: "Upload Resumed",
      description: "Upload has been resumed",
    });
  }, [updateUploadSession, toast]);

  const getStatusIcon = (status: UploadSession['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: UploadSession['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Global Error Alert */}
        {globalError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        {/* Compact Upload Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'images' | 'documents')}>
          <TabsList className="grid w-full grid-cols-2">
            {allowedTypes.map(type => {
              const config = uploadConfigs[type];
              const Icon = config.icon;
              return (
                <TabsTrigger key={type} value={type} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {allowedTypes.map(type => {
            const config = uploadConfigs[type];
            return (
              <TabsContent key={type} value={type}>
                <MobileOptimizedUpload
                  onFilesSelected={(files) => handleFilesSelected(files, type)}
                  onRemoveFile={() => {}} // Handled by session management
                  acceptedTypes={config.acceptedTypes}
                  maxFiles={maxFiles}
                  maxSizeBytes={config.maxSizeBytes}
                  bucket={config.bucket}
                  compact={true}
                />
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Active Upload Sessions */}
        {uploadSessions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Upload Sessions</h4>
            {uploadSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(session.status)}
                  <div>
                    <p className="text-sm font-medium">
                      {session.files.length} {session.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.status === 'uploading' && `${session.progress}% complete`}
                      {session.status === 'completed' && 'Upload complete'}
                      {session.status === 'failed' && 'Upload failed'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getStatusColor(session.status)}>
                    {session.status}
                  </Badge>
                  
                  {session.status === 'failed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRetrySession(session.id)}
                      className="h-6 w-6 p-0"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadSession(session.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global Upload Progress */}
        {queueStatus.isActive && (
          <UploadProgressTracker
            compact={true}
            className="mt-4"
          />
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Manager</span>
          {queueStatus.isActive && (
            <Badge variant="outline" className="ml-auto">
              {queueStatus.activeUploads} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Global Error Alert */}
        {globalError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        {/* Upload Type Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'images' | 'documents')}>
          <TabsList className="grid w-full grid-cols-2">
            {allowedTypes.map(type => {
              const config = uploadConfigs[type];
              const Icon = config.icon;
              return (
                <TabsTrigger key={type} value={type} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {allowedTypes.map(type => {
            const config = uploadConfigs[type];
            return (
              <TabsContent key={type} value={type} className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {config.description}
                  </p>
                </div>
                
                <MobileOptimizedUpload
                  onFilesSelected={(files) => handleFilesSelected(files, type)}
                  onRemoveFile={() => {}} // Handled by session management
                  acceptedTypes={config.acceptedTypes}
                  maxFiles={maxFiles}
                  maxSizeBytes={config.maxSizeBytes}
                  bucket={config.bucket}
                />
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Upload Sessions Management */}
        {uploadSessions.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Upload Sessions</h4>
            <div className="space-y-3">
              {uploadSessions.map(session => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(session.status)}
                        <div>
                          <h5 className="font-medium">
                            {session.files.length} {session.type}
                          </h5>
                          <p className="text-sm text-gray-500">
                            Started {session.startedAt.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                        
                        {session.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetrySession(session.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        )}
                        
                        {session.status === 'uploading' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePauseSession(session.id)}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </Button>
                        )}
                        
                        {session.status === 'paused' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResumeSession(session.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadSession(session.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {session.status === 'uploading' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{session.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${session.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {session.error && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{session.error}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Global Upload Progress Tracker */}
        {queueStatus.isActive && (
          <UploadProgressTracker />
        )}
      </CardContent>
    </Card>
  );
}

export default ComprehensiveUploadManager;
