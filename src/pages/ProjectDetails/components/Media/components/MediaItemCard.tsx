/**
 * MediaItemCard component for individual media items
 * Handles display and actions for images and documents
 */

import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreVertical, Download, Star, Trash2, FileText, ImageIcon, Calendar, Play } from 'lucide-react';
import { MediaItem } from '../types';
import { useLazyImage } from '../hooks/useMemoryManagement';
import { formatFileSize, formatMediaDate, getCategoryBadgeConfig, isImageType, isVideoType, isDownloadableDocument } from '../utils/mediaUtils';

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
  const isVideo = isVideoType(item);
  const isDocument = isDownloadableDocument(item);
  const canDelete = permissions.canDelete(item);
  const canSetAsProfile = permissions.canSetAsProfile(item);
  

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/50 overflow-hidden hover:shadow-xl hover:shadow-slate-900/8 hover:-translate-y-1 transition-all duration-300 hover:border-slate-300/60 backdrop-blur-sm">
      {/* Media Content */}
      <div 
        className="aspect-[5/4] cursor-pointer relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100"
        onClick={(e) => onClick(item, e)}
      >
        {isImage ? (
          <>
            <LazyImage
              src={item.url}
              alt={item.name}
              className="rounded-t-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {/* Subtle overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : isVideo ? (
          <>
            <video
              className="w-full h-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
              src={item.url}
              poster={item.url}
              preload="metadata"
            />
            {/* Video play indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-4 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div 
            className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6 group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(item);
            }}
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl mb-4 group-hover:from-blue-600 group-hover:to-indigo-700 group-hover:scale-105 transition-all duration-300 shadow-lg">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <span className="text-sm text-slate-800 text-center font-semibold truncate w-full leading-tight mb-3 px-2">
              {item.name}
            </span>
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-2 text-xs font-semibold">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </div>
            </div>
          </div>
        )}

        {/* Modern Category Badge */}
        <Badge 
          variant="secondary" 
          className={`absolute top-3 left-3 text-xs backdrop-blur-xl border-0 shadow-lg font-semibold px-3 py-1.5 rounded-full ${getCategoryBadgeConfig(item.category).className}`}
        >
          {getCategoryBadgeConfig(item.category).showStar && <Star className="h-3 w-3 mr-1.5 fill-current" />}
          <span className="capitalize">{item.category}</span>
        </Badge>
      </div>

      {/* Compact Item Info */}
      <div className="p-4 bg-gradient-to-br from-white via-slate-50/30 to-white">
        <h4 className="text-sm font-bold text-slate-900 truncate mb-3 group-hover:text-blue-700 transition-colors duration-300 leading-tight">
          {item.name}
        </h4>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            {item.size && (
              <div className="flex items-center bg-slate-100 rounded-full px-2 py-1">
                <span className="font-semibold">{formatFileSize(item.size)}</span>
              </div>
            )}
            {item.created_at && (
              <div className="flex items-center space-x-1 bg-slate-100 rounded-full px-2 py-1">
                <Calendar className="h-3 w-3 text-slate-500" />
                <span className="font-medium">{formatMediaDate(item.created_at)}</span>
              </div>
            )}
          </div>
        
        </div>
      </div>


      {/* Modern Actions */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
        {(canDelete || canSetAsProfile || isDocument) ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 bg-white/90 backdrop-blur-xl hover:bg-white shadow-lg hover:shadow-xl border border-white/60 hover:border-slate-300 transition-all duration-200 rounded-full"
              >
                <MoreVertical className="h-4 w-4 text-slate-700" />
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
