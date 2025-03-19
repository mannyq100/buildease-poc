import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WeatherAlert {
  id: string | number;
  type: 'wind' | 'rain' | 'snow' | 'heat' | 'cold' | 'storm';
  severity: 'warning' | 'watch' | 'advisory';
  description: string;
  startTime: string;
  endTime: string;
}

export interface WeatherForecast {
  date: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'stormy' | 'partly-cloudy';
  highTemp: number;
  lowTemp: number;
  precipitation: number; // percentage
  windSpeed: number; // mph or kph
}

export interface WeatherCardProps {
  /** Location name */
  location: string;
  /** Current weather condition */
  currentCondition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'stormy' | 'partly-cloudy';
  /** Current temperature */
  currentTemp: number;
  /** Feels like temperature */
  feelsLike?: number;
  /** Humidity percentage */
  humidity?: number;
  /** Wind speed */
  windSpeed?: number;
  /** Precipitation chance */
  precipitation?: number;
  /** Weather alerts */
  alerts?: WeatherAlert[];
  /** Weather forecast */
  forecast?: WeatherForecast[];
  /** Temperature unit */
  unit?: 'F' | 'C';
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

/**
 * WeatherCard component for displaying weather information.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue (#2B6CB0) accents
 * - Progressive disclosure for complex information
 */
export function WeatherCard({
  location,
  currentCondition,
  currentTemp,
  feelsLike,
  humidity,
  windSpeed,
  precipitation,
  alerts = [],
  forecast = [],
  unit = 'F',
  className,
  onClick,
  animate = true
}: WeatherCardProps) {
  const getWeatherIcon = (condition: string, size = 'large') => {
    const iconSize = size === 'large' ? 'h-10 w-10' : 'h-5 w-5';
    const iconColor = 'text-blue-600 dark:text-blue-400';
    
    switch (condition) {
      case 'sunny':
        return <Sun className={cn(iconSize, iconColor)} />;
      case 'cloudy':
        return <Cloud className={cn(iconSize, iconColor)} />;
      case 'rainy':
        return <CloudRain className={cn(iconSize, iconColor)} />;
      case 'snowy':
        return <CloudSnow className={cn(iconSize, iconColor)} />;
      case 'windy':
        return <Wind className={cn(iconSize, iconColor)} />;
      case 'partly-cloudy':
        return (
          <div className="relative">
            <Sun className={cn(iconSize, iconColor)} />
            <Cloud className={cn('absolute -bottom-1 -right-1', size === 'large' ? 'h-6 w-6' : 'h-3 w-3', iconColor)} />
          </div>
        );
      case 'stormy':
        return (
          <div className="relative">
            <CloudRain className={cn(iconSize, iconColor)} />
            <AlertTriangle className={cn('absolute -bottom-1 -right-1', size === 'large' ? 'h-5 w-5' : 'h-3 w-3', 'text-amber-500')} />
          </div>
        );
      default:
        return <Cloud className={cn(iconSize, iconColor)} />;
    }
  };

  const getConditionText = (condition: string) => {
    return condition.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300',
        'hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        {/* Header with Location and Current Condition */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{location}</h3>
            <p className="text-sm text-muted-foreground">
              {getConditionText(currentCondition)}
            </p>
          </div>
          <div>
            {getWeatherIcon(currentCondition)}
          </div>
        </div>

        {/* Current Temperature */}
        <div className="flex items-end space-x-3">
          <span className="text-3xl font-bold">{currentTemp}°{unit}</span>
          {feelsLike && (
            <span className="text-sm text-muted-foreground pb-1">
              Feels like {feelsLike}°{unit}
            </span>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          {humidity !== undefined && (
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-900/30 rounded-md">
              <Droplets className="h-4 w-4 mb-1 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">{humidity}%</span>
              <span className="text-xs text-muted-foreground">Humidity</span>
            </div>
          )}
          {windSpeed !== undefined && (
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-900/30 rounded-md">
              <Wind className="h-4 w-4 mb-1 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">{windSpeed}</span>
              <span className="text-xs text-muted-foreground">Wind (mph)</span>
            </div>
          )}
          {precipitation !== undefined && (
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-900/30 rounded-md">
              <CloudRain className="h-4 w-4 mb-1 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">{precipitation}%</span>
              <span className="text-xs text-muted-foreground">Precip</span>
            </div>
          )}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Alerts</h4>
            <div className="space-y-1">
              {alerts.map((alert) => (
                <Badge 
                  key={alert.id}
                  className={cn(
                    'flex items-center',
                    alert.severity === 'warning' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    alert.severity === 'watch' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  )}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} {alert.severity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Forecast */}
        {forecast.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Forecast</h4>
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {forecast.slice(0, 5).map((day, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center min-w-[60px] p-2 bg-slate-50 dark:bg-slate-900/30 rounded-md"
                >
                  <span className="text-xs text-muted-foreground">
                    {index === 0 ? 'Today' : day.date}
                  </span>
                  <div className="my-1">
                    {getWeatherIcon(day.condition, 'small')}
                  </div>
                  <div className="flex text-xs space-x-1">
                    <span className="font-medium">{day.highTemp}°</span>
                    <span className="text-muted-foreground">{day.lowTemp}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
