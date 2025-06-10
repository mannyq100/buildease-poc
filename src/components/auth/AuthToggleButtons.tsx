import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface AuthToggleButtonsProps {
  currentPage: 'login' | 'signup'
}

export default function AuthToggleButtons({ currentPage }: AuthToggleButtonsProps) {
  const navigate = useNavigate()

  return (
    <div className="flex space-x-3 mb-6">
      <Button 
        className={`flex-1 h-12 min-h-[44px] rounded-md transition-all duration-200 font-semibold ${
          currentPage === 'login' 
            ? 'bg-[#2B6CB0] hover:bg-blue-700 text-white' 
            : 'bg-transparent border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        variant={currentPage === 'login' ? 'default' : 'outline'}
        onClick={() => currentPage !== 'login' && navigate('/login')}
      >
        Login
      </Button>
      <Button 
        className={`flex-1 h-12 min-h-[44px] rounded-md transition-all duration-500 shadow-md hover:shadow-lg font-medium ${
          currentPage === 'signup' 
            ? 'bg-gradient-to-r from-[#2B6CB0] to-[#2B6CB0] hover:from-[#2B6CB0] hover:to-[#ED8936] text-white' 
            : 'bg-transparent border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        variant={currentPage === 'signup' ? 'default' : 'outline'}
        onClick={() => currentPage !== 'signup' && navigate('/signup')}
      >
        Sign Up
      </Button>
    </div>
  )
}