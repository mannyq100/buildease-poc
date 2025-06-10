import { AuthPageLayoutProps } from '@/types/auth'

export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 z-0"></div>
      
      <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-[#ED8936]/10 via-[#2B6CB0]/5 to-transparent rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gradient-to-tr from-[#2B6CB0]/10 via-[#ED8936]/5 to-transparent rounded-full blur-3xl z-0"></div>
      
      <div className="hidden lg:block absolute top-20 left-20 w-16 h-16 bg-[#ED8936]/10 rounded-lg rotate-12 z-0 animate-float"></div>
      <div className="hidden lg:block absolute bottom-20 right-20 w-24 h-24 bg-[#2B6CB0]/10 rounded-lg -rotate-12 z-0 animate-float-delayed"></div>
      <div className="hidden lg:block absolute top-1/3 right-1/4 w-12 h-12 bg-[#2B6CB0]/20 rounded-full z-0 animate-pulse"></div>
      
      <div className="w-full flex items-center justify-center p-4 sm:p-6 relative">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#ED8936]/10 rounded-full blur-2xl z-0"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#2B6CB0]/10 rounded-full blur-2xl z-0"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[#ED8936]/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0 lg:hidden"></div>
        
        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}