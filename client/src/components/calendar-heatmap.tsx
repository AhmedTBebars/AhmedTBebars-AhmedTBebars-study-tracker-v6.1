import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarHeatmapProps {
  className?: string;
}

interface DayData {
  date: string;
  value: number;
  tasks: number;
  completed: number;
  focusTime: number;
  level: 0 | 1 | 2 | 3 | 4; // Intensity level for color
}

export function CalendarHeatmap({ className }: CalendarHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMetric, setSelectedMetric] = useState<"completion" | "tasks" | "focus">("completion");

  // Fetch data
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: focusSessions = [] } = useQuery({
    queryKey: ["/api/focus-sessions"],
  });

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    const year = parseInt(selectedYear);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const data: DayData[] = [];

    // Create data for each day of the year
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      
      // Get tasks for this date
      const dayTasks = tasks.filter((task: any) => task.date === dateString);
      const completedTasks = dayTasks.filter((task: any) => task.isDone);
      
      // Get focus sessions for this date
      const dayFocusSessions = focusSessions.filter((session: any) => {
        const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
        return sessionDate === dateString;
      });
      
      const totalFocusTime = dayFocusSessions.reduce((sum: number, session: any) => sum + session.duration, 0);
      
      // Calculate value based on selected metric
      let value = 0;
      if (selectedMetric === "completion") {
        value = dayTasks.length > 0 ? (completedTasks.length / dayTasks.length) * 100 : 0;
      } else if (selectedMetric === "tasks") {
        value = dayTasks.length;
      } else if (selectedMetric === "focus") {
        value = totalFocusTime;
      }

      // Determine intensity level (0-4)
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (selectedMetric === "completion") {
        if (value >= 90) level = 4;
        else if (value >= 70) level = 3;
        else if (value >= 50) level = 2;
        else if (value > 0) level = 1;
      } else if (selectedMetric === "tasks") {
        if (value >= 8) level = 4;
        else if (value >= 6) level = 3;
        else if (value >= 4) level = 2;
        else if (value > 0) level = 1;
      } else if (selectedMetric === "focus") {
        if (value >= 120) level = 4; // 2+ hours
        else if (value >= 90) level = 3; // 1.5+ hours  
        else if (value >= 60) level = 2; // 1+ hour
        else if (value > 0) level = 1;
      }

      data.push({
        date: dateString,
        value,
        tasks: dayTasks.length,
        completed: completedTasks.length,
        focusTime: totalFocusTime,
        level
      });
    }

    return data;
  }, [tasks, focusSessions, selectedYear, selectedMetric]);

  // Group data by months and weeks
  const monthsData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(parseInt(selectedYear), i, 1);
      const monthEnd = new Date(parseInt(selectedYear), i + 1, 0);
      
      const monthData = heatmapData.filter(day => {
        const date = new Date(day.date);
        return date >= monthStart && date <= monthEnd;
      });

      // Group by weeks
      const weeks: DayData[][] = [];
      let currentWeek: DayData[] = [];
      
      // Add padding for the first week
      const firstDay = monthStart.getDay(); // 0 = Sunday
      for (let j = 0; j < firstDay; j++) {
        currentWeek.push({
          date: "",
          value: 0,
          tasks: 0,
          completed: 0,
          focusTime: 0,
          level: 0
        });
      }

      monthData.forEach(day => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });

      // Add padding for the last week
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push({
            date: "",
            value: 0,
            tasks: 0,
            completed: 0,
            focusTime: 0,
            level: 0
          });
        }
        weeks.push(currentWeek);
      }

      return {
        name: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        weeks
      };
    });

    return months;
  }, [heatmapData, selectedYear]);

  // Calculate statistics
  const stats = useMemo(() => {
    const activeDays = heatmapData.filter(day => day.level > 0).length;
    const totalTasks = heatmapData.reduce((sum, day) => sum + day.tasks, 0);
    const totalCompleted = heatmapData.reduce((sum, day) => sum + day.completed, 0);
    const totalFocusTime = heatmapData.reduce((sum, day) => sum + day.focusTime, 0);
    
    const maxValue = Math.max(...heatmapData.map(day => day.value));
    const avgValue = heatmapData.length > 0 ? heatmapData.reduce((sum, day) => sum + day.value, 0) / heatmapData.length : 0;

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedData = [...heatmapData].reverse();
    
    for (const day of sortedData) {
      if (day.date > today) continue;
      if (day.level > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      activeDays,
      totalTasks,
      totalCompleted,
      totalFocusTime: Math.floor(totalFocusTime / 60), // Convert to hours
      maxValue,
      avgValue,
      currentStreak
    };
  }, [heatmapData]);

  const getCellColor = (level: 0 | 1 | 2 | 3 | 4) => {
    const colors = {
      0: "bg-muted/30",
      1: "bg-green-200 dark:bg-green-900/40",
      2: "bg-green-300 dark:bg-green-800/60", 
      3: "bg-green-400 dark:bg-green-700/80",
      4: "bg-green-500 dark:bg-green-600"
    };
    return colors[level];
  };

  const formatValue = (day: DayData) => {
    if (selectedMetric === "completion") {
      return `${Math.round(day.value)}%`;
    } else if (selectedMetric === "focus") {
      return `${Math.floor(day.value / 60)}h ${day.value % 60}m`;
    }
    return day.value.toString();
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case "completion": return "Completion Rate";
      case "tasks": return "Task Count";
      case "focus": return "Focus Time";
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Productivity Calendar
            </h2>
            <p className="text-muted-foreground">
              Visual overview of your productivity patterns throughout the year
            </p>
          </div>
          
          <div className="flex gap-3">
            <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completion">Completion Rate</SelectItem>
                <SelectItem value="tasks">Task Count</SelectItem>
                <SelectItem value="focus">Focus Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.activeDays}
              </div>
              <div className="text-sm text-muted-foreground">Active Days</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.currentStreak}
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {selectedMetric === "completion" ? `${Math.round(stats.avgValue)}%` : 
                 selectedMetric === "focus" ? `${Math.floor(stats.avgValue / 60)}h` : 
                 Math.round(stats.avgValue)}
              </div>
              <div className="text-sm text-muted-foreground">Daily Average</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.totalTasks}
              </div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{getMetricLabel()} - {selectedYear}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={cn("w-3 h-3 rounded-sm", getCellColor(level as any))}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-2">
              {monthsData.map((month, monthIndex) => (
                <motion.div
                  key={month.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: monthIndex * 0.05 }}
                  className="space-y-1"
                >
                  <div className="text-xs font-medium text-center text-muted-foreground mb-2">
                    {month.name}
                  </div>
                  <div className="space-y-1">
                    {month.weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex gap-1">
                        {week.map((day, dayIndex) => (
                          <Tooltip key={`${weekIndex}-${dayIndex}`}>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                className={cn(
                                  "w-3 h-3 rounded-sm cursor-pointer transition-all",
                                  day.date ? getCellColor(day.level) : "bg-transparent"
                                )}
                              />
                            </TooltipTrigger>
                            {day.date && (
                              <TooltipContent>
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {new Date(day.date).toLocaleDateString()}
                                  </div>
                                  <div className="space-y-1 mt-2">
                                    <div>{getMetricLabel()}: {formatValue(day)}</div>
                                    <div>Tasks: {day.completed}/{day.tasks}</div>
                                    <div>Focus: {Math.floor(day.focusTime / 60)}h {day.focusTime % 60}m</div>
                                  </div>
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}