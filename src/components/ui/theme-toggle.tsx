import React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  iconSize?: number;
  variant?: 'default' | 'outline' | 'ghost';
}

export function ThemeToggle({ className, iconSize = 18, variant = 'outline' }: ThemeToggleProps) {
  const { theme, setTheme, isDarkMode } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size="icon" 
          className={cn(
            'rounded-full w-9 h-9 transition-all', 
            isDarkMode ? 'text-slate-100 hover:text-white' : 'text-slate-700 hover:text-slate-900',
            className
          )}
          aria-label="Toggle theme"
        >
          <Sun 
            size={iconSize} 
            className="rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" 
          />
          <Moon 
            size={iconSize} 
            className="absolute rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" 
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] p-2">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-2 cursor-pointer rounded-md px-3 py-2',
            theme === 'light' ? 'bg-primary/10 text-primary' : ''
          )}
        >
          <Sun size={16} className="text-yellow-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-2 cursor-pointer rounded-md px-3 py-2',
            theme === 'dark' ? 'bg-primary/10 text-primary' : ''
          )}
        >
          <Moon size={16} className="text-blue-500" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={cn(
            'flex items-center gap-2 cursor-pointer rounded-md px-3 py-2',
            theme === 'system' ? 'bg-primary/10 text-primary' : ''
          )}
        >
          <Laptop size={16} className="text-gray-500 dark:text-gray-400" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
