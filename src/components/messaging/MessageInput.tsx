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
  Mic
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

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
      />
      
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <Popover>
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
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className={cn(
              "w-48 p-2 rounded-xl", 
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"
            )}
            align="start"
          >
            <div className="flex flex-col gap-1">
              <motion.div
                whileHover={{ scale: 1.02, x: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start rounded-lg", 
                    isDarkMode ? "hover:bg-slate-700 text-slate-300" : ""
                  )}
                  onClick={() => triggerAttachmentDialog("image")}
                >
                  <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Image
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02, x: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start rounded-lg", 
                    isDarkMode ? "hover:bg-slate-700 text-slate-300" : ""
                  )}
                  onClick={() => triggerAttachmentDialog("document")}
                >
                  <FileText className="h-4 w-4 mr-2 text-amber-500" />
                  Document
                </Button>
              </motion.div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Voice message button */}
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
        >
          <Mic className="h-4 w-4" />
        </Button>
        
        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[40px] py-2 pr-10 resize-none rounded-xl",
              isDarkMode 
                ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                : "bg-slate-100 border-slate-100 focus:border-blue-500 text-slate-900 placeholder:text-slate-500",
              !message && "h-10" // Default height when empty
            )}
            maxLength={1000}
            disabled={disabled}
          />
          
          <AnimatePresence>
            {message && (
              <motion.div
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Emoji Picker Button - Placeholder */}
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
        >
          <Smile className="h-4 w-4" />
        </Button>
        
        {/* Send Button */}
        <motion.div
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button 
            variant={message.trim() ? "default" : "outline"}
            size="icon"
            className={cn(
              "rounded-full transition-all shadow-sm", 
              !message.trim() && 
              (isDarkMode 
                ? "bg-slate-800 text-slate-400 border-slate-700" 
                : "bg-slate-100 text-slate-400")
            )}
            onClick={handleSendMessage}
            disabled={!message.trim() || disabled}
          >
            <Send className={cn(
              "h-4 w-4", 
              message.trim() && "text-white"
            )} />
          </Button>
        </motion.div>
      </div>
      
      {/* Character counter */}
      <AnimatePresence>
        {message.length > 500 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn(
              "text-xs px-4 py-1 mt-1 self-end rounded-full",
              message.length > 900 
                ? (isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-100 text-red-500") 
                : message.length > 800 
                  ? (isDarkMode ? "bg-yellow-900/20 text-yellow-400" : "bg-yellow-100 text-yellow-600")
                  : (isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")
            )}
          >
            {message.length}/1000 characters
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 