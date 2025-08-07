import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DragDropTaskList } from "@/components/drag-drop-task-list";
import { AddTaskModal } from "@/components/add-task-modal";
import { ProgressModal } from "@/components/progress-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";
import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusStore } from "@/stores/focus-store";

const filters = [
  { id: "all", label: "All Tasks" },
  { id: "today", label: "Today" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Focus store
  const startFocusSession = useFocusStore((state) => state.startSession);

  // Fetch tasks
  const getQueryKey = () => {
    switch (activeFilter) {
      case "today":
        return ["/api/tasks/today"];
      case "overdue":
        return ["/api/tasks/overdue"];
      default:
        return ["/api/tasks"];
    }
  };

  const { data: tasks = [] } = useQuery({
    queryKey: getQueryKey(),
  });

  // Filter tasks
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.topic.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === "completed") {
      return matchesSearch && task.isDone;
    }
    return matchesSearch;
  });

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) =>
      apiRequest("PATCH", `/api/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue"] });
      toast({
        title: "Task deleted",
        description: "The task has been removed from your list.",
      });
    },
  });

  // Handlers
  const handleToggleComplete = (taskId: string, isCompleted: boolean) => {
    updateTaskMutation.mutate({
      id: taskId,
      data: { isDone: isCompleted, progress: isCompleted ? 100 : 0 },
    });
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setShowAddTask(true);
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleStartFocus = (taskId: string) => {
    // تشغيل المؤقت لمهمة محددة
    startFocusSession(taskId);
    toast({
      title: "Focus session started",
      description: "Timer is now running for this task.",
    });
  };

  const handleLogProgress = (task: Task) => {
    setSelectedTask(task);
    setShowProgress(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Task Management</h1>
            <p className="text-muted-foreground mt-1">
              Organize and track your daily tasks
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Filters and Search */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "ghost"}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "transition-all duration-200",
                    activeFilter === filter.id && "btn-premium"
                  )}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                onClick={() => setShowAddTask(true)}
                className="btn-premium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Task List */}
          <DragDropTaskList
            tasks={filteredTasks}
            onReorderTasks={(taskIds) => {
              console.log("Reordering tasks:", taskIds);
            }}
            onToggleComplete={(task) =>
              handleToggleComplete(task.id, !task.isDone)
            }
            onEditTask={handleEdit}
            onDeleteTask={(task) => handleDelete(task.id)}
            onStartFocus={(task) => handleStartFocus(task.id)}
            onLogProgress={handleLogProgress}
            onAddTask={() => setShowAddTask(true)}
            title={
              activeFilter === "all"
                ? "All Tasks"
                : activeFilter === "today"
                ? "Today's Tasks"
                : activeFilter === "overdue"
                ? "Overdue Tasks"
                : "Completed Tasks"
            }
            emptyMessage={
              searchTerm
                ? "No tasks match your search"
                : activeFilter === "all"
                ? "No tasks yet. Create your first task to get started!"
                : "No tasks found for this filter"
            }
          />
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
