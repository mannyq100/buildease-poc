/**
 * MediaItemCard component for individual media items
 * Handles display and actions for images and documents
 */

import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreVertical, Download, Star, Trash2, FileText, ImageIcon, Calendar, Eye } from 'lucide-react';
import { MediaItem } from '../types';
import { useLazyImage } from '../hooks/useMemoryManagement';
import { formatFileSize, formatMediaDate, getCategoryBadgeConfig, isImageType, getTypeBadgeConfig, isDownloadableDocument } from '../utils/mediaUtils';

interface MediaItemCardProps {
  item: MediaItem;
  onClick: (item: MediaItem, e: React.MouseEvent) => void;
  onDelete: (item: MediaItem) => Promise<void>;
  onSetAsProfile: (imageUrl: string) => void;
  onDownload: (item: MediaItem) => Promise<void>;
  permissions: {
    canDelete: (item: MediaItem) => boolean;
    canEdit: (item: MediaItem) => boolean;
    canSetAsProfile: (item: MediaItem) => boolean;
  };
}

const LazyImage = memo<{ src: string; alt: string; className?: string }>(({ src, alt, className }) => {
  const { imgRef, isLoaded, error, shouldLoad, handleLoad, handleError } = useLazyImage(src);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && !error && shouldLoad && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse rounded" />
      )}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />
      )}
      {error && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-slate-400" />
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export const MediaItemCard = memo<MediaItemCardProps>(({
  item,
  onClick,
  onDelete,
  onSetAsProfile,
  onDownload,
  permissions
}) => {
  const isImage = isImageType(item);
  const isDocument = isDownloadableDocument(item);
  const canDelete = permissions.canDelete(item);
  const canSetAsProfile = permissions.canSetAsProfile(item);
  

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200/60 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 hover:border-slate-300/80">
      {/* Media Content */}
      <div 
        className="aspect-square cursor-pointer relative overflow-hidden"
        onClick={(e) => onClick(item, e)}
      >
        {isImage ? (
          <>
            <LazyImage
              src={item.url}
              alt={item.name}
              className="rounded-t-xl group-hover:scale-105 transition-transform duration-300"
            />
            {/* Enhanced Image Preview Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center space-x-2 text-slate-800 text-sm font-medium">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span>Preview Image</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div 
            className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-300 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(item);
            }}
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl mb-3 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <span className="text-sm text-slate-700 text-center font-medium truncate w-full leading-tight mb-2">
              {item.name}
            </span>
            {/* Enhanced download indicator */}
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
              <div className="flex items-center space-x-1 text-xs font-medium">
                <Download className="h-3 w-3" />
                <span>Download</span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Category Badge with gradients and shadows */}
        <Badge 
          variant="secondary" 
          className={`absolute top-3 left-3 text-xs backdrop-blur-md border-0 shadow-lg font-medium px-2.5 py-1 ${getCategoryBadgeConfig(item.category).className}`}
        >
          {getCategoryBadgeConfig(item.category).showStar && <Star className="h-3 w-3 mr-1" />}
          <span className="capitalize">{item.category}</span>
        </Badge>
      </div>

      {/* Enhanced Item Info */}
      <div className="p-4 bg-gradient-to-r from-white to-slate-50/50">
        <h4 className="text-sm font-semibold text-slate-800 truncate mb-2 group-hover:text-slate-900 transition-colors">
          {item.name}
        </h4>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            {item.size && (
              <span className="font-medium">{formatFileSize(item.size)}</span>
            )}
            {item.createdAt && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatMediaDate(item.createdAt)}</span>
              </div>
            )}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeConfig(item).className}`}>
            {getTypeBadgeConfig(item).label}
          </div>
        </div>
      </div>

      {/* Quick Preview Button for Images */}
      {isImage && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            variant="default"
            size="sm"
            onClick={(e) => onClick(item, e)}
            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl text-xs font-medium"
          >
            <Eye className="h-3 w-3 mr-1.5" />
            Preview
          </Button>
        </div>
      )}

      {/* Enhanced Actions */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
        {(canDelete || canSetAsProfile || isDocument) ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 bg-white/95 backdrop-blur-md hover:bg-white shadow-lg hover:shadow-xl border border-white/50 hover:border-slate-200 transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isDocument && (
                <DropdownMenuItem onClick={() => onDownload(item)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              
              {canSetAsProfile && item.category !== 'profile' && (
                <DropdownMenuItem onClick={() => {
                  onSetAsProfile(item.url);
                }}>
                  <Star className="h-4 w-4 mr-2" />
                  Set as Profile
                </DropdownMenuItem>
              )}
              
              {(canDelete || canSetAsProfile) && isDocument && (
                <DropdownMenuSeparator />
              )}
              
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {isDocument ? 'Document' : 'Image'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{item.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(item)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
});

MediaItemCard.displayName = 'MediaItemCard';
