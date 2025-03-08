/**
 * Project image upload component
 * Handles uploading, previewing, and managing project reference images
 */
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Camera, ImageIcon, FileImage, Trash2, RotateCcw } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { getRandomImage } from '@/data/mock/projectInputs/exampleImages';

interface ProjectImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  isDarkMode: boolean;
}

export function ProjectImageUpload({
  images,
  onImagesChange,
  isDarkMode
}: ProjectImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Simulate file upload progress
  const simulateUpload = (file: File) => {
    setShowProgress(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowProgress(false);
            // Create a fake URL for the uploaded image
            const imageUrl = URL.createObjectURL(file);
            onImagesChange([...images, imageUrl]);
          }, 500);
          return 100;
        }
        return next;
      });
    }, 200);
  };
  
  // Handle file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateUpload(files[0]);
    }
  };
  
  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      simulateUpload(files[0]);
    }
  };

  // Add example images
  const addExampleImages = () => {
    const exampleUrls = [
      getRandomImage('building', 'modern'),
      getRandomImage('building', 'traditional'),
      getRandomImage('feature', 'kitchen'),
      getRandomImage('feature', 'bathroom')
    ];
    onImagesChange([...images, ...exampleUrls]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <FileImage className="h-5 w-5 text-blue-500" />
        <div>
          <h3 className={`font-medium text-lg ${isDarkMode ? "text-slate-200" : "text-gray-900"}`}>
            Project Images
          </h3>
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
            Upload site photos or reference images for your project
          </p>
        </div>
      </div>
      
      {/* Upload area */}
      <div 
        className={`border-2 ${isDragging ? 'border-blue-500 border-solid' : 'border-dashed'} rounded-lg p-8 text-center transition-all duration-200 ${
          isDarkMode 
            ? isDragging 
                ? "border-blue-500 bg-blue-900/20" 
                : "border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-blue-600" 
            : isDragging 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-300"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className={`h-20 w-20 rounded-full flex items-center justify-center transform transition-transform ${isDragging ? 'scale-110' : 'scale-100'} ${
              isDarkMode 
                ? "bg-blue-900/30 text-blue-400 border border-blue-700" 
                : "bg-blue-50 text-blue-600 border border-blue-200"
            }`}>
              <Camera className="h-10 w-10" />
            </div>
          </div>
          <h3 className={`text-base font-medium ${
            isDarkMode ? "text-slate-200" : "text-gray-700"
          }`}>
            {isDragging ? "Drop your images here" : "Drag and drop your images"}
          </h3>
          <p className={`text-sm ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}>
            Upload photos of your site, inspiration, or similar projects
          </p>
          
          <div className="flex items-center justify-center gap-3">
            <Button 
              variant={isDarkMode ? "outline" : "secondary"}
              size="sm"
              className={`relative overflow-hidden transition-all duration-200 ${
                isDarkMode 
                  ? "bg-blue-900/20 hover:bg-blue-800/30 border-blue-800 text-blue-400" 
                  : "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
              }`}
            >
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleImageSelect}
              />
              <Upload className="h-4 w-4 mr-2" />
              Select Images
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={addExampleImages}
              className={`transition-all duration-200 ${
                isDarkMode 
                  ? "bg-purple-900/20 hover:bg-purple-800/30 border-purple-800 text-purple-400" 
                  : "bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200"
              }`}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Use Example Images
            </Button>
          </div>
        </div>
      </div>
      
      {/* Upload progress */}
      {showProgress && (
        <m.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 p-4 border rounded-lg bg-white dark:bg-slate-800 shadow-sm border-blue-200 dark:border-blue-900/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Uploading image...</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{uploadProgress}% complete</div>
              </div>
            </div>
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {uploadProgress}%
            </div>
          </div>
          <Progress value={uploadProgress} className="h-2 bg-blue-100 dark:bg-blue-900/30" indicatorClassName="bg-blue-500 dark:bg-blue-400" />
        </m.div>
      )}
      
      {/* Image previews */}
      {images.length > 0 && (
        <LazyMotion features={domAnimation}>
          <div className="mt-6 p-5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-slate-950">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-medium ${isDarkMode ? "text-slate-200" : "text-gray-900"}`}>
                Uploaded Images ({images.length})
              </h3>
              {images.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onImagesChange([])}
                  className={`text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ${
                    isDarkMode ? "border-slate-700 hover:bg-red-900/20" : "border-gray-200 hover:bg-red-50"
                  }`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <m.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="relative group"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm group-hover:shadow-md transition-all duration-200">
                    <img 
                      src={image} 
                      alt={`Project reference ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-slate-800 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-gray-200 dark:border-gray-700"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-xs text-white font-medium truncate bg-black/70 px-2 py-1 rounded-sm">
                        {image.includes('http') ? `Reference ${index + 1}` : `Uploaded Image ${index + 1}`}
                      </span>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        </LazyMotion>
      )}
      
      <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300">
        <h4 className="font-medium mb-1 text-sm">Tip: High-Quality Images Help AI Planning</h4>
        <p className="text-xs">
          Clear, high-resolution images of your site and design preferences help our AI generate more accurate construction plans tailored to your specific requirements.
        </p>
      </div>
    </div>
  );
} 