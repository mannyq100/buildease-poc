/**
 * Component for displaying a team member in list format
 */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { TeamMemberListItemProps } from '@/types/team'
import { Building, Eye, Mail, MoreHorizontal, Phone, User, UserCheck, UserX } from 'lucide-react'

export function TeamMemberListItem({ 
  member, 
  onView, 
  onRemove,
  onStatusChange
}: TeamMemberListItemProps) {
  /**
   * Get the appropriate color for the workload progress bar
   */
  function getWorkloadColor(workload: number): string {
    if (workload > 80) {
      return 'var(--red-500)'
    } else if (workload > 60) {
      return 'var(--amber-500)'
    } else {
      return 'var(--blue-500)'
    }
  }

  return (
    <div className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg mb-3 overflow-hidden hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-deepblue-dark/10 transition-all duration-300">
      <div className="p-4 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex items-center space-x-3">
          <Avatar className="ring-2 ring-white/10 dark:ring-slate-700/50 h-10 w-10">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className={`${
              member.status === 'active'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-gray-400 dark:bg-slate-600 text-white'
            }`}>
              {member.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold dark:text-white">{member.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
          </div>
        </div>
        
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center text-sm group">
            <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
            <span className="text-gray-600 dark:text-gray-300 truncate">{member.email}</span>
          </div>
          <div className="flex items-center text-sm group">
            <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
            <span className="text-gray-600 dark:text-gray-300 truncate">{member.phone}</span>
          </div>
          <div className="flex items-center text-sm group">
            <Building className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
            <span className="text-gray-600 dark:text-gray-300 truncate">{member.department}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Badge variant={member.status === 'active' ? "success" : "secondary"}
              className={member.status === 'active' 
                ? 'dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30' 
                : 'dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/30'}>
              {member.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onView(member)}
            className="dark:text-gray-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
          >
            <Eye className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">View</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="dark:text-gray-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 dark:bg-slate-800 dark:border-slate-700">
              <DropdownMenuItem 
                onClick={() => onView(member)}
                className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              
              {onStatusChange && (
                <>
                  {member.status === 'active' ? (
                    <DropdownMenuItem 
                      onClick={() => onStatusChange(member.id, 'inactive')}
                      className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white cursor-pointer"
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      <span>Set as Inactive</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      onClick={() => onStatusChange(member.id, 'active')}
                      className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white cursor-pointer"
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      <span>Set as Active</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="dark:bg-slate-700" />
                </>
              )}
              
              <DropdownMenuItem 
                onClick={() => onRemove(member)}
                className="dark:text-red-400 dark:focus:bg-red-600/20 dark:focus:text-red-300 cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Remove</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800/90 border-t dark:border-slate-700 grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-gray-400">Workload</span>
            <span className="font-medium dark:text-white">{member.workload}%</span>
          </div>
          <Progress 
            value={member.workload} 
            className="h-1.5 dark:bg-slate-700"
            style={{
              '--progress-background': getWorkloadColor(member.workload)
            } as React.CSSProperties}
          />
        </div>
        
        <div className="flex items-center justify-end space-x-1">
          {member.projects.map((project, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs dark:border-slate-600 dark:text-gray-300 dark:bg-slate-700/30 hover:dark:bg-slate-700/60 transition-colors"
            >
              {project}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
} 