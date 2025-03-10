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
  Link
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendAttachment?: (file: File) => void;
  className?: string;
  placeholder?: string;
  isDarkMode?: boolean;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendAttachment,
  className,
  placeholder = "Type a message...",
  isDarkMode = false,
  disabled = false
}) => {
  const [message, setMessage] = useState<string>("");
  const [attachmentType, setAttachmentType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize the textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (without Shift key)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      // Clear input first for better UX
      setMessage("");
      // Then send the message
      onSendMessage(trimmedMessage);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendAttachment) {
      onSendAttachment(file);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const triggerAttachmentDialog = (type: string) => {
    setAttachmentType(type);
    // Trigger the file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
  
  return (
    <div className={cn(
      "relative flex flex-col",
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
      />
      
      <div className="flex items-end gap-2 p-3">
        {/* Attachment Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className={isDarkMode ? "border-slate-700 bg-slate-800 hover:bg-slate-700" : ""}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className={cn(
              "w-48 p-2", 
              isDarkMode ? "bg-slate-800 border-slate-700" : ""
            )}
            align="start"
          >
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start", 
                  isDarkMode ? "hover:bg-slate-700 text-slate-300" : ""
                )}
                onClick={() => triggerAttachmentDialog("image")}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start", 
                  isDarkMode ? "hover:bg-slate-700 text-slate-300" : ""
                )}
                onClick={() => triggerAttachmentDialog("document")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Document
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[40px] py-2 pr-10 resize-none",
              isDarkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-400" : "",
              !message && "h-10" // Default height when empty
            )}
            maxLength={1000}
            disabled={disabled}
          />
          
          {message && (
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
                    onClick={() => setMessage("")}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Clear message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {/* Emoji Picker Button - Placeholder */}
        <Button 
          variant="outline" 
          size="icon"
          className={isDarkMode ? "border-slate-700 bg-slate-800 hover:bg-slate-700" : ""}
          disabled={disabled}
        >
          <Smile className="h-4 w-4" />
        </Button>
        
        {/* Send Button */}
        <Button 
          variant="default" 
          size="icon"
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Character counter */}
      {message.length > 500 && (
        <div 
          className={cn(
            "text-xs px-4 pb-2",
            message.length > 900 
              ? "text-red-500" 
              : message.length > 800 
                ? (isDarkMode ? "text-yellow-300" : "text-yellow-600")
                : (isDarkMode ? "text-slate-400" : "text-slate-500")
          )}
        >
          {message.length}/1000 characters
        </div>
      )}
    </div>
  );
}; 