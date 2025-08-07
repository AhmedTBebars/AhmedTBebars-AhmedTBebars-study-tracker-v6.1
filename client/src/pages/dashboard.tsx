import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/task-card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@shared/schema";
import {
  Calendar,
  CheckCircle,
  Timer,
  Flame,
  Plus,
  Bell,
  PictureInPicture,
} from "lucide-react";
import { useState } from "react";
import { AddTaskModal } from "@/components/add-task-modal";
import { ProgressModal } from "@/components/progress-modal";
import { useFocusStore } from "@/stores/focus-store";
import { PiPCircularTimer } from "@/components/PiPCircularTimer";

interface FocusSession {
  completedAt: string;
  duration: number;
}

interface Stats {
  todayTasks: number;
  streak: number;
}

export default function Dashboard() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  const startSession = useFocusStore((state) => state.startSession);

  // Fetch data with proper typing
  const {
    data: todayTasks = [],
    isLoading: isLoadingTodayTasks,
    error: todayTasksError,
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks/today"],
  });

  const {
    data: overdueTasks = [],
    isLoading: isLoadingOverdueTasks,
    error: overdueTasksError,
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks/overdue"],
  });

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery<Stats>({
    queryKey: ["/api/analytics/stats"],
  });

  const {
    data: focusSessions = [],
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useQuery<FocusSession[]>({
    queryKey: ["/api/focus-sessions"],
  });

  // Handle loading and error states
  if (
    isLoadingTodayTasks ||
    isLoadingOverdueTasks ||
    isLoadingStats ||
    isLoadingSessions
  ) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  if (todayTasksError || overdueTasksError || statsError || sessionsError) {
    return (
      <div className="flex items-center justify-center h-full">
        Error loading data
      </div>
    );
  }

  // Calculate daily progress
  const completedToday = todayTasks.filter((task) => task.isDone).length;
  const totalToday = todayTasks.length;
  const progressPercentage =
    totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  // Today's focus sessions - improved date handling
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayFocusSessions = focusSessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });

  const totalFocusTimeToday = todayFocusSessions.reduce(
    (total, session) => total + session.duration,
    0
  );

  const handleTaskAction = () => {
    // Placeholder for task actions
  };
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your progress overview.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </Button>
            <Button
              onClick={() => setShowAddTask(true)}
              className="btn-premium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Today's Tasks
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.todayTasks || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Completed
                  </p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {completedToday}
                  </p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Focus Sessions
                  </p>
                  <p className="text-2xl font-bold mt-1 text-warning">
                    {todayFocusSessions.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Timer className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Streak
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.streak || 0} days
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Today's Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Tasks</CardTitle>
                  <Badge variant="outline">
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayTasks.length > 0 ? (
                  <>
                    {todayTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleTaskAction}
                        onEdit={handleTaskAction}
                        onDelete={handleTaskAction}
                        onStartFocus={() => {
                          startSession(task.id);
                        }}
                        onLogProgress={(task) => {
                          setSelectedTask(task);
                          setShowProgress(true);
                        }}
                      />
                    ))}
                    {overdueTasks.length > 0 && (
                      <>
                        <div className="flex items-center space-x-2 mt-6 mb-3">
                          <div className="h-px bg-border flex-1"></div>
                          <span className="text-sm text-muted-foreground">
                            Related Overdue Tasks
                          </span>
                          <div className="h-px bg-border flex-1"></div>
                        </div>
                        {overdueTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggleComplete={handleTaskAction}
                            onEdit={handleTaskAction}
                            onDelete={handleTaskAction}
                            onStartFocus={() => {
                              startSession(task.id);
                            }}
                            onLogProgress={(task) => {
                              setSelectedTask(task);
                              setShowProgress(true);
                            }}
                            isOverdue
                          />
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tasks for today</p>
                    <Button
                      variant="ghost"
                      onClick={() => setShowAddTask(true)}
                      className="mt-2"
                    >
                      Add your first task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Progress */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Daily Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Circular Progress */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <svg
                      className="w-32 h-32 transform -rotate-90"
                      viewBox="0 0 120 120"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-muted opacity-20"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        className="text-primary transition-all duration-1000"
                        strokeDasharray="339.292"
                        strokeDashoffset={
                          339.292 * (1 - progressPercentage / 100)
                        }
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {Math.round(progressPercentage)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Complete
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Tasks
                      </span>
                      <span className="text-sm font-medium">
                        {completedToday}/{totalToday}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Focus Time
                      </span>
                      <span className="text-sm font-medium">
                        {Math.floor(totalFocusTimeToday / 60)}h{" "}
                        {totalFocusTimeToday % 60}m
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Sessions
                      </span>
                      <span className="text-sm font-medium">
                        {todayFocusSessions.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button className="flex-1" onClick={() => startSession()}>
                        Start Focus Session
                      </Button>
                      {/* New PiP Circular Timer Button */}
                      <PiPCircularTimer />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal open={showAddTask} onOpenChange={setShowAddTask} />
      {selectedTask && (
        <ProgressModal
          open={showProgress}
          onOpenChange={setShowProgress}
          task={selectedTask}
        />
      )}
    </div>
  );
}
