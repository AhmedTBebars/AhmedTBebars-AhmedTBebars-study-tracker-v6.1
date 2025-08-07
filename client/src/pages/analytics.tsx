import { useQuery } from "@tanstack/react-query";
import { AdvancedAnalytics } from "@/components/advanced-analytics";
import { exportToCSV } from "@/lib/csv-utils";
import { exportToExcel } from "@/lib/excel-utils";
import { useToast } from "@/hooks/use-toast";

export default function Analytics() {
  const { toast } = useToast();

  // Fetch data
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: focusSessions = [] } = useQuery({
    queryKey: ["/api/focus-sessions"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  // Process data for charts
  const processWeeklyData = () => {
    const today = new Date();
    const weeklyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter((task: any) => task.date === dateString);
      const completedTasks = dayTasks.filter((task: any) => task.isDone);
      const percentage = dayTasks.length > 0 ? (completedTasks.length / dayTasks.length) * 100 : 0;
      
      weeklyData.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: Math.round(percentage),
        date: dateString,
      });
    }
    
    return weeklyData;
  };

  const processMonthlyData = () => {
    const today = new Date();
    const monthlyData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter((task: any) => task.date === dateString);
      const completedTasks = dayTasks.filter((task: any) => task.isDone);
      const percentage = dayTasks.length > 0 ? (completedTasks.length / dayTasks.length) * 100 : 0;
      
      monthlyData.push({
        value: Math.round(percentage),
        date: dateString,
      });
    }
    
    return monthlyData;
  };

  const processFocusDistribution = () => {
    const topicTimes: Record<string, number> = {};
    
    focusSessions.forEach((session: any) => {
      const task = tasks.find((t: any) => t.id === session.taskId);
      const topic = task?.topic || "General";
      topicTimes[topic] = (topicTimes[topic] || 0) + session.duration;
    });
    
    return Object.entries(topicTimes).map(([topic, time]) => ({
      name: topic,
      value: time,
    }));
  };

  const processDailyProgress = () => {
    const todayTasks = tasks.filter((task: any) => {
      const today = new Date().toISOString().split('T')[0];
      return task.date === today;
    });
    
    const completedToday = todayTasks.filter((task: any) => task.isDone);
    const percentage = todayTasks.length > 0 ? (completedToday.length / todayTasks.length) * 100 : 0;
    
    const todayFocusSessions = focusSessions.filter((session: any) => {
      const today = new Date().toISOString().split('T')[0];
      const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
      return sessionDate === today;
    });
    
    const totalFocusTime = todayFocusSessions.reduce((total: number, session: any) => total + session.duration, 0);
    
    return [
      { value: Math.round(percentage) },
      { label: "Tasks", value: `${completedToday.length}/${todayTasks.length}` },
      { label: "Focus Time", value: `${Math.floor(totalFocusTime / 60)}h ${totalFocusTime % 60}m` },
      { label: "Sessions", value: todayFocusSessions.length.toString() },
    ];
  };

  const handleExport = (format: "csv" | "excel") => {
    try {
      const exportData = {
        tasks: tasks.map((task: any) => ({
          Date: task.date,
          Title: task.title,
          Topic: task.topic,
          Time: task.time,
          Is_Done: task.isDone ? 1 : 0,
          Progress: task.progress,
          Difficulty: task.difficulty,
          Focus_Sessions: task.focusSessions,
        })),
        focusSessions: focusSessions.map((session: any) => ({
          Task_ID: session.taskId || "General",
          Duration: session.duration,
          Session_Type: session.sessionType,
          Completed_At: new Date(session.completedAt).toLocaleString(),
        })),
        weeklyProgress: processWeeklyData(),
        focusDistribution: processFocusDistribution(),
      };

      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === "excel") {
        exportToExcel(exportData, `study-tracker-analytics-${timestamp}.xlsx`);
      } else {
        exportToCSV(exportData.tasks, `study-tracker-analytics-${timestamp}.csv`);
      }

      toast({
        title: "Export successful! 📊",
        description: `Analytics data has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Prepare analytics data
  const analyticsData = {
    totalTasks: stats?.totalTasks || 0,
    completedTasks: stats?.completedTasks || 0,
    todayTasks: stats?.todayTasks || 0,
    totalFocusTime: stats?.totalFocusTime || 0,
    streak: stats?.streak || 0,
    weeklyProgress: processWeeklyData(),
    difficultyBreakdown: [
      { name: 'Easy', value: tasks.filter((t: any) => t.difficulty === 'easy').length, color: '#22c55e' },
      { name: 'Medium', value: tasks.filter((t: any) => t.difficulty === 'medium').length, color: '#f59e0b' },
      { name: 'Hard', value: tasks.filter((t: any) => t.difficulty === 'hard').length, color: '#ef4444' }
    ],
    focusPattern: processFocusDistribution(),
    productivityTrend: processMonthlyData().map((item, index) => ({
      date: `Day ${index + 1}`,
      productivity: item.value
    }))
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your productivity and progress over time
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <AdvancedAnalytics data={analyticsData} />
        </div>
      </div>
    </div>
  );
}
