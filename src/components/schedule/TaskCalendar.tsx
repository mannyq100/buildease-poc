import { useState } from 'react';
import { Task } from '@/types/schedule';
import { formatDate, getStatusColor } from '@/utils/scheduleUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  isWeekend
} from 'date-fns';

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const TaskCalendar = ({ tasks, onTaskClick }: TaskCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  
  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const startDate = parseISO(task.startDate);
      const dueDate = parseISO(task.dueDate);
      
      // Check if the day falls within the task's date range
      return (
        (day >= startDate && day <= dueDate) ||
        isSameDay(day, startDate) || 
        isSameDay(day, dueDate)
      );
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div 
            key={day} 
            className="text-center py-2 font-medium text-sm"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {monthDays.map((day, i) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isWeekendDay = isWeekend(day);
          
          return (
            <Card 
              key={i} 
              className={`min-h-[120px] ${!isCurrentMonth ? 'opacity-40' : ''} ${isWeekendDay ? 'bg-gray-50' : ''}`}
            >
              <CardContent className="p-2">
                <div className={`text-right text-sm mb-1 ${isToday ? 'font-bold text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayTasks.slice(0, 3).map(task => (
                    <div 
                      key={task.id}
                      className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="flex items-center space-x-1">
                        <Badge className={`${getStatusColor(task.status)} h-2 w-2 p-0 rounded-full`} />
                        <span className="truncate">{task.title}</span>
                      </div>
                    </div>
                  ))}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 pl-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}; 