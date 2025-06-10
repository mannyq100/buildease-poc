import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { AuthFormLayoutProps } from '@/types/auth'

export default function AuthFormLayout({ 
  title, 
  description, 
  error, 
  children 
}: AuthFormLayoutProps) {
  return (
    <Card className="border border-gray-200/50 dark:border-gray-800/50 shadow-xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#2B6CB0] to-[#ED8936]"></div>
      
      <CardHeader className="pb-6 relative">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#ED8936]/10 rounded-full blur-xl z-0"></div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white font-inter relative z-10">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400 font-opensans relative z-10">
          {description}
        </CardDescription>
      </CardHeader>
      
      {error && (
        <Alert variant="destructive" className="mx-6 mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-200">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <CardContent className="p-6 pt-0">
        {children}
      </CardContent>
    </Card>
  )
}