import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/shared/LazyImage';
import { formatDate } from '@/utils/core/date';
import { formatFileSize } from '@/services/documentService';
import { Calendar, FileText, User, ImageIcon } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'document';
  url: string;
  name: string;
  category: string;
  size?: number;
  createdAt?: string;
}

interface MediaGridProps {
  items: MediaItem[];
  viewMode: 'grid' | 'list';
  onImageClick: (url: string) => void;
  onSelectProfileImage?: (url: string) => void;
  currentProfileImage?: string | null;
  getCategoryDisplayName: (category: string) => string;
}

export function MediaGrid({
  items,
  viewMode,
  onImageClick,
  onSelectProfileImage,
  currentProfileImage,
  getCategoryDisplayName
}: MediaGridProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (url: string) => {
    setImageErrors(prev => new Set(prev).add(url));
  };

  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <div key={item.id} className="group relative">
          <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200/50 hover:border-buildease-blue-300 transition-all duration-200 hover:shadow-lg">
            {item.type === 'image' ? (
              <div className="relative w-full h-full">
                {!imageErrors.has(item.id) ? (
                  <div 
                    className="w-full h-full cursor-pointer"
                    onClick={() => onImageClick(item.url)}
                  >
                    <LazyImage
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      onError={() => handleImageError(item.id)}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                
                {/* Profile Image Indicator */}
                {currentProfileImage === item.url && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
                    Profile
                  </div>
                )}
                
                {/* Set as Profile Button */}
                {onSelectProfileImage && currentProfileImage !== item.url && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProfileImage(item.url);
                      }}
                      className="bg-white/90 text-slate-900 hover:bg-white text-xs"
                    >
                      <User className="h-3 w-3 mr-1" />
                      Set as Profile
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                <FileText className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-xs text-slate-600 text-center font-medium truncate w-full">
                  {item.name}
                </span>
                {item.size && (
                  <span className="text-xs text-slate-400 mt-1">
                    {formatFileSize(item.size)}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Item Info */}
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-slate-700 truncate">
              {item.name}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="bg-slate-100 px-2 py-1 rounded-full">
                {getCategoryDisplayName(item.category)}
              </span>
              {item.createdAt && (
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(item.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-slate-200/50 hover:border-buildease-blue-300 hover:shadow-sm transition-all duration-200">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
            {item.type === 'image' ? (
              !imageErrors.has(item.id) ? (
                <div 
                  className="w-full h-full cursor-pointer"
                  onClick={() => onImageClick(item.url)}
                >
                  <LazyImage
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={() => handleImageError(item.id)}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
            )}
          </div>
          
          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-slate-900 truncate">
                {item.name}
              </h4>
              {currentProfileImage === item.url && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                  Profile
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="bg-slate-100 px-2 py-1 rounded-full">
                {getCategoryDisplayName(item.category)}
              </span>
              {item.size && (
                <span>{formatFileSize(item.size)}</span>
              )}
              {item.createdAt && (
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(item.createdAt)}
                </span>
              )}
            </div>
          </div>
          
          {/* Actions */}
          {item.type === 'image' && onSelectProfileImage && currentProfileImage !== item.url && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectProfileImage(item.url)}
              className="text-xs"
            >
              <User className="h-3 w-3 mr-1" />
              Set as Profile
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No media found</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          Upload images or documents to get started with your project media library.
        </p>
      </div>
    );
  }

  return viewMode === 'grid' ? renderGridView() : renderListView();
}
