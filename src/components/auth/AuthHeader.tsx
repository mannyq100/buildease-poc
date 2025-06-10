import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface AuthHeaderProps {
  showLogo?: boolean
}

export default function AuthHeader({ showLogo = true }: AuthHeaderProps) {
  if (!showLogo) {
    return (
      <div className="flex justify-end items-center mb-6 sm:mb-8">
        <ThemeToggle />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between mb-6 sm:mb-8">
      <Link to="/" className="inline-flex items-center group">
        <img 
          src="/buildease-logo-1.svg" 
          alt="BuildEase Logo" 
          className="w-10 h-10 sm:w-12 sm:h-12 mr-3 transition-transform group-hover:scale-105"
        />
        <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">BuildEase</span>
      </Link>
      <ThemeToggle />
    </div>
  )
}