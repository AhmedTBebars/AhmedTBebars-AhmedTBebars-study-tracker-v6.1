import { Task } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Play, MoreHorizontal, Clock, Target, GripVertical, Edit, Trash2, Zap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { forwardRef } from "react";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onLogProgress: (task: Task) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  onStartFocus, 
  onLogProgress,
  isDragging = false,
  dragHandleProps,
  ...props
}, ref) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <motion.div
      ref={ref}
      {...props}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.2 }
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.15 }
      }}
      className={`transition-all ${isDragging ? 'rotate-2 shadow-xl z-50' : ''}`}
    >
      <Card className={`transition-all duration-300 hover:shadow-lg border-l-4 ${
        task.isDone 
          ? 'opacity-75 border-l-green-400' 
          : task.difficulty === 'hard' 
            ? 'border-l-red-400' 
            : task.difficulty === 'medium' 
              ? 'border-l-yellow-400' 
              : 'border-l-green-400'
      } ${isDragging ? 'shadow-2xl ring-2 ring-primary/20' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {dragHandleProps && (
              <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing pt-1 hover:text-primary transition-colors">
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            
            <motion.div
              initial={false}
              animate={{
                scale: task.isDone ? 1.1 : 1,
                transition: { duration: 0.2 }
              }}
            >
              <Checkbox
                checked={task.isDone || false}
                onCheckedChange={() => onToggleComplete(task)}
                className="mt-1"
              />
            </motion.div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium ${task.isDone ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLogProgress(task)}>
                    Log Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStartFocus(task)}>
                    Start Focus Session
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(task)}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{task.topic}</Badge>
              <Badge className={getDifficultyColor(task.difficulty || "medium")}>
                {task.difficulty || "medium"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{task.time || "09:00"}</span>
              </div>
              
              {task.progress !== null && task.progress > 0 && (
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{task.progress || 0}% Complete</span>
                </div>
              )}
              
              {task.focusSessions !== null && task.focusSessions > 0 && (
                <div className="flex items-center space-x-1">
                  <Play className="w-4 h-4" />
                  <span>{task.focusSessions || 0} sessions</span>
                </div>
              )}
            </div>
            
            {task.progress !== null && task.progress > 0 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
});