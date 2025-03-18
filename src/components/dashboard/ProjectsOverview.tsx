import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Briefcase, ChevronRight } from 'lucide-react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/project'

interface ProjectsOverviewProps {
  projects: Project[]
  className?: string
}

/**
 * ProjectsOverview component
 * Displays a summary of active projects with key information in the dashboard
 */
export function ProjectsOverview({ projects, className = '' }: ProjectsOverviewProps) {
  const navigate = useNavigate()
  const isDarkMode = document.documentElement.classList.contains('dark')
  
  // Get only active projects and limit to 5
  const activeProjects = projects
    .filter(project => project.status === 'active')
    .slice(0, 5)
  
  return (
    <div className={className}>
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-b border-blue-100 dark:border-blue-900/20 p-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center text-base">
              <Briefcase className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Active Projects
            </CardTitle>
            <Badge 
              variant="outline" 
              className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30"
            >
              {activeProjects.length} Projects
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <LazyMotion features={domAnimation}>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {activeProjects.length > 0 ? (
                activeProjects.map((project, i) => (
                  <m.div 
                    key={project.id}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {project.name}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            project.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30' : 
                            project.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30' : 
                            'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30'
                          )}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Budget: ${project.budget.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Progress: {project.progress}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Client: {project.client}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      size="icon"
                      variant="ghost"
                      className="ml-auto h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </m.div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No active projects found</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <Button 
                variant="ghost" 
                className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => navigate('/projects')}
              >
                View All Projects
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </LazyMotion>
        </CardContent>
      </Card>
    </div>
  )
} 