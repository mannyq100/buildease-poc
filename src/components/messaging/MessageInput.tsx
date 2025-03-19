import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Paperclip, 
  Smile, 
  XCircle,
  Image as ImageIcon,
  FileText,
  Link,
  Mic,
  Camera,
  Gift,
  Trash,
  Clock,
  ChevronDown,
  Film,
  Users,
  X,
  Plus,
  Calendar,
  FileUp,
  Map
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { m, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSendAttachment?: (file: File) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  className?: string;
  placeholder?: string;
  isDarkMode?: boolean;
  disabled?: boolean;
  replyingTo?: {
    id: string;
    content: string;
    senderName: string;
  } | null;
  onCancelReply?: () => void;
}

// Emoji categories for the emoji picker
const EMOJI_CATEGORIES = [
  { name: "Smileys", emoji: "😀", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊"] },
  { name: "People", emoji: "👋", emojis: ["👋", "👌", "👍", "👎", "👏", "🙌", "🤝", "🙏"] },
  { name: "Nature", emoji: "🌿", emojis: ["🌿", "🌲", "🌳", "🌴", "🌵", "🌷", "🌸", "🌹", "🌺"] },
  { name: "Food", emoji: "🍎", emojis: ["🍎", "🍏", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓"] },
  { name: "Activities", emoji: "⚽", emojis: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱"] },
  { name: "Travel", emoji: "🚗", emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑"] },
];

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onSendAttachment,
  onTypingStart,
  onTypingEnd,
  className,
  placeholder = "Type a message...",
  isDarkMode = false,
  disabled = false,
  replyingTo,
  onCancelReply
}) => {
  const [attachmentType, setAttachmentType] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<string>("Smileys");
  const [recordingAudio, setRecordingAudio] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Auto-resize the textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);
  
  // Typing indicator handling
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout | null = null;
    
    if (value && onTypingStart) {
      onTypingStart();
      typingTimeout = setTimeout(() => {
        if (onTypingEnd) onTypingEnd();
      }, 3000);
    }
    
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [value, onTypingStart, onTypingEnd]);
  
  // Cleanup recording timer
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (without Shift key)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = () => {
    const trimmedMessage = value.trim();
    if (trimmedMessage && !disabled) {
      // Clear input first for better UX
      onChange("");
      // Then send the message
      onSend();
      
      if (onTypingEnd) {
        onTypingEnd();
      }
      
      // Clear attachments and reply after sending
      setAttachments([]);
      if (replyingTo && onCancelReply) {
        onCancelReply();
      }
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFiles = Array.from(files);
      setAttachments(prev => [...prev, ...selectedFiles]);
      
      // Simulate file upload
      setIsUploading(true);
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      
      // Call attachment handler if provided
      if (onSendAttachment) {
        selectedFiles.forEach(file => {
          onSendAttachment(file);
        });
      }
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const triggerAttachmentDialog = (type: string) => {
    setAttachmentType(type);
    // Trigger the file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Start audio recording (simulated)
  const startAudioRecording = () => {
    setRecordingAudio(true);
    setRecordingTime(0);
    
    // Start timer to track recording time
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };
  
  // Stop audio recording (simulated)
  const stopAudioRecording = () => {
    setRecordingAudio(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    // Simulate sending audio message
    onChange(`[Audio message - ${formatRecordingTime(recordingTime)}]`);
  };
  
  // Format recording time as mm:ss
  const formatRecordingTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Accepted file types based on attachment type
  const getAcceptedFileTypes = () => {
    switch (attachmentType) {
      case "image":
        return "image/*";
      case "document":
        return ".pdf,.doc,.docx,.xls,.xlsx,.txt";
      default:
        return "";
    }
  };
  
  // Add emoji to message
  const addEmoji = (emoji: string) => {
    onChange(prev => prev + emoji);
    textareaRef.current?.focus();
  };
  
  // Placeholder for attachment handling
  const handleAttachment = (type: string) => {
    console.log(`Attaching ${type}`);
    setIsAttachMenuOpen(false);
  };
  
  // Placeholder for voice recording
  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
    console.log(isRecording ? "Stopping recording" : "Starting recording");
  };
  
  return (
    <div className={cn(
      "relative flex flex-col p-3",
      isDarkMode ? "bg-slate-900" : "bg-white",
      className
    )}>
      {/* File input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={getAcceptedFileTypes()}
        onChange={handleFileSelect}
        multiple
      />
      
      {/* Reply to message display */}
      <AnimatePresence>
        {replyingTo && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "mb-2 p-2 rounded-lg border",
              isDarkMode 
                ? "bg-slate-800 border-slate-700" 
                : "bg-slate-50 border-slate-200"
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-slate-500">
                    Replying to
                  </span>
                  <span className={cn(
                    "text-xs font-semibold",
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  )}>
                    {replyingTo.senderName}
                  </span>
                </div>
                <div className={cn(
                  "text-sm mt-0.5 truncate max-w-full",
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                )}>
                  {replyingTo.content}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={onCancelReply}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
      
      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex flex-wrap gap-2"
          >
            {attachments.map((file, index) => (
              <Badge
                key={`${file.name}-${index}`}
                variant="outline"
                className={cn(
                  "pl-2 pr-1 py-1 h-6 flex items-center gap-1",
                  isDarkMode ? "bg-slate-800" : "bg-slate-100"
                )}
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-3 w-3 mr-1" />
                ) : (
                  <FileText className="h-3 w-3 mr-1" />
                )}
                <span className="text-xs truncate max-w-[100px]">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 rounded-full"
                  onClick={() => removeAttachment(index)}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </m.div>
        )}
      </AnimatePresence>
      
      {/* Upload progress indicator */}
      <AnimatePresence>
        {isUploading && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">
                Uploading {attachments.length} {attachments.length === 1 ? 'file' : 'files'}...
              </span>
              <span className="text-xs font-medium text-slate-500">
                {uploadProgress}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-1" />
          </m.div>
        )}
      </AnimatePresence>
      
      {/* Voice recording interface */}
      <AnimatePresence>
        {recordingAudio && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "mb-2 p-2 rounded-lg flex items-center justify-between",
              isDarkMode 
                ? "bg-red-900/20 border border-red-900/30" 
                : "bg-red-50 border border-red-100"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className={cn(
                "text-sm font-medium",
                isDarkMode ? "text-red-400" : "text-red-600"
              )}>
                Recording audio...
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {formatRecordingTime(recordingTime)}
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={stopAudioRecording}
              >
                Stop
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <Popover open={isAttachMenuOpen} onOpenChange={setIsAttachMenuOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                "rounded-full transition-all",
                isDarkMode 
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              )}
              disabled={disabled || recordingAudio}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className={cn(
              "w-60 p-2 rounded-xl", 
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"
            )}
            align="start"
          >
            <div className="grid grid-cols-4 gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex flex-col h-16 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => handleAttachment("image")}
                    >
                      <ImageIcon className="h-6 w-6 mb-1 text-blue-500" />
                      <span className="text-xs">Image</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send an image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex flex-col h-16 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => handleAttachment("document")}
                    >
                      <FileText className="h-6 w-6 mb-1 text-amber-500" />
                      <span className="text-xs">File</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send a document</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex flex-col h-16 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => handleAttachment("camera")}
                    >
                      <Camera className="h-6 w-6 mb-1 text-rose-500" />
                      <span className="text-xs">Camera</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Take a photo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex flex-col h-16 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => handleAttachment("schedule")}
                    >
                      <Calendar className="h-6 w-6 mb-1 text-green-500" />
                      <span className="text-xs">Schedule</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Schedule meeting</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Voice message button */}
        {!recordingAudio ? (
          <Button 
            variant="ghost" 
            size="icon"
            className={cn(
              "rounded-full transition-all",
              isDarkMode 
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            )}
            disabled={disabled}
            onClick={startAudioRecording}
          >
            <Mic className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-red-100 text-red-600 hover:bg-red-200"
            onClick={stopAudioRecording}
          >
            <Clock className="h-4 w-4" />
          </Button>
        )}
        
        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={recordingAudio ? "Recording audio..." : placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[40px] py-2 pr-10 resize-none rounded-xl",
              isDarkMode 
                ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                : "bg-slate-100 border-slate-100 focus:border-blue-500 text-slate-900 placeholder:text-slate-500",
              !value && "h-10", // Default height when empty
              recordingAudio && "opacity-50 pointer-events-none"
            )}
            maxLength={1000}
            disabled={disabled || recordingAudio}
          />
          
          <AnimatePresence>
            {value && (
              <m.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-5 w-5 absolute right-3 top-2.5",
                          isDarkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-600"
                        )}
                        onClick={() => onChange("")}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Clear message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </m.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Emoji Picker Button */}
        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                "rounded-full transition-all",
                isDarkMode 
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              )}
              disabled={disabled || recordingAudio}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className={cn(
              "w-64 p-2", 
              isDarkMode ? "bg-slate-800 border-slate-700" : ""
            )}
            align="end"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">Emoji</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs flex items-center gap-1"
                    >
                      {EMOJI_CATEGORIES.find(c => c.name === activeEmojiCategory)?.emoji}
                      <span>{activeEmojiCategory}</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {EMOJI_CATEGORIES.map(category => (
                      <DropdownMenuItem 
                        key={category.name}
                        onClick={() => setActiveEmojiCategory(category.name)}
                        className="flex items-center gap-2"
                      >
                        <span>{category.emoji}</span>
                        <span>{category.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="grid grid-cols-8 gap-1 p-1">
                {EMOJI_CATEGORIES.find(c => c.name === activeEmojiCategory)?.emojis.map(emoji => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-lg"
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Send Button */}
        <m.div
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button 
            variant={value.trim() || attachments.length > 0 ? "default" : "outline"}
            size="icon"
            className={cn(
              "rounded-full transition-all shadow-sm", 
              (!value.trim() && attachments.length === 0) && 
              (isDarkMode 
                ? "bg-slate-800 text-slate-400 border-slate-700" 
                : "bg-slate-100 text-slate-400")
            )}
            onClick={handleSendMessage}
            disabled={(!value.trim() && attachments.length === 0) || disabled || recordingAudio}
          >
            <Send className={cn(
              "h-4 w-4", 
              (value.trim() || attachments.length > 0) && "text-white"
            )} />
          </Button>
        </m.div>
      </div>
      
      {/* Character counter */}
      <AnimatePresence>
        {value.length > 500 && (
          <m.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn(
              "text-xs px-4 py-1 mt-1 self-end rounded-full",
              value.length > 900 
                ? (isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-100 text-red-500") 
                : value.length > 800 
                  ? (isDarkMode ? "bg-yellow-900/20 text-yellow-400" : "bg-yellow-100 text-yellow-600")
                  : (isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")
            )}
          >
            {value.length}/1000 characters
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 