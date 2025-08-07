import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { exportToCSV } from "@/lib/csv-utils";
import { exportToExcel } from "@/lib/excel-utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Settings,
  Database,
  Cloud,
  Filter,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export function EnhancedImportExport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);
  const [importSettings, setImportSettings] = useState({
    skipDuplicates: true,
    defaultTime: "09:00",
    autoComplete: false,
    markDifficulty: "medium" as "easy" | "medium" | "hard"
  });
  const [exportSettings, setExportSettings] = useState({
    format: "csv" as "csv" | "excel",
    dateRange: "all" as "all" | "week" | "month" | "custom",
    includeCompleted: true,
    includePending: true,
    includeFocusSessions: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data for export
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: focusSessions = [] } = useQuery({
    queryKey: ["/api/focus-sessions"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  const importMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      formData.append("skipDuplicates", importSettings.skipDuplicates.toString());
      formData.append("defaultTime", importSettings.defaultTime);
      formData.append("autoComplete", importSettings.autoComplete.toString());
      
      return apiRequest("POST", "/api/import/csv", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },
    onSuccess: (result) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Import successful! 🎉",
        description: `Imported ${result.imported} tasks, skipped ${result.skipped} duplicates.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.response?.data?.message || "Failed to import tasks. Please check your file format.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await importMutation.mutateAsync(formData);
      setImportProgress(100);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsImporting(false);
        setImportProgress(0);
      }, 1000);
    }
  };

  const handleExport = async () => {
    try {
      let filteredTasks = [...tasks];
      
      // Apply filters
      if (!exportSettings.includeCompleted) {
        filteredTasks = filteredTasks.filter((task: any) => !task.isDone);
      }
      if (!exportSettings.includePending) {
        filteredTasks = filteredTasks.filter((task: any) => task.isDone);
      }

      // Apply date range filter
      if (exportSettings.dateRange !== "all") {
        const today = new Date();
        const cutoffDate = new Date();
        
        if (exportSettings.dateRange === "week") {
          cutoffDate.setDate(today.getDate() - 7);
        } else if (exportSettings.dateRange === "month") {
          cutoffDate.setMonth(today.getMonth() - 1);
        }
        
        filteredTasks = filteredTasks.filter((task: any) => 
          new Date(task.date) >= cutoffDate
        );
      }

      const exportData = {
        tasks: filteredTasks.map((task: any) => ({
          Date: task.date,
          Title: task.title,
          Topic: task.topic,
          Time: task.time || importSettings.defaultTime,
          Is_Done: task.isDone ? 1 : 0,
          Progress: task.progress || 0,
          Difficulty: task.difficulty || "medium",
          Focus_Sessions: task.focusSessions || 0,
          Order_Index: task.orderIndex || 0,
        })),
        focusSessions: exportSettings.includeFocusSessions ? focusSessions.map((session: any) => ({
          Task_ID: session.taskId || "General",
          Duration: session.duration,
          Session_Type: session.sessionType,
          Completed_At: new Date(session.completedAt).toLocaleString(),
        })) : [],
        summary: {
          Export_Date: new Date().toLocaleString(),
          Total_Tasks: filteredTasks.length,
          Completed_Tasks: filteredTasks.filter((t: any) => t.isDone).length,
          Total_Focus_Sessions: exportSettings.includeFocusSessions ? focusSessions.length : 0,
          Filter_Applied: exportSettings.dateRange,
        }
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `study-tracker-export-${timestamp}`;

      if (exportSettings.format === "excel") {
        exportToExcel(exportData, `${filename}.xlsx`);
      } else {
        exportToCSV(exportData.tasks, `${filename}.csv`);
      }

      toast({
        title: "Export successful! 📊",
        description: `Your data has been exported as ${exportSettings.format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFilteredTaskCount = () => {
    let count = tasks.length;
    if (!exportSettings.includeCompleted) {
      count = tasks.filter((task: any) => !task.isDone).length;
    }
    if (!exportSettings.includePending) {
      count = tasks.filter((task: any) => task.isDone).length;
    }
    return count;
  };

  return (
    <div className="space-y-8">
      {/* Import Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              Import Tasks
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Import your tasks from CSV files with advanced duplicate detection and formatting options.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Import Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Import Settings
                </h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="skip-duplicates" className="text-sm">Skip duplicate tasks</Label>
                  <Switch
                    id="skip-duplicates"
                    checked={importSettings.skipDuplicates}
                    onCheckedChange={(checked) => 
                      setImportSettings(prev => ({ ...prev, skipDuplicates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-complete" className="text-sm">Auto-complete imported tasks</Label>
                  <Switch
                    id="auto-complete"
                    checked={importSettings.autoComplete}
                    onCheckedChange={(checked) => 
                      setImportSettings(prev => ({ ...prev, autoComplete: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Default time for tasks</Label>
                  <Input
                    type="time"
                    value={importSettings.defaultTime}
                    onChange={(e) => 
                      setImportSettings(prev => ({ ...prev, defaultTime: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Default difficulty</Label>
                  <Select
                    value={importSettings.markDifficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") => 
                      setImportSettings(prev => ({ ...prev, markDifficulty: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">CSV Format Requirements</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Your CSV file should contain these columns:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Date</strong> - Format: YYYY-MM-DD</li>
                    <li><strong>Title</strong> - Task title</li>
                    <li><strong>Topic</strong> - Category/subject</li>
                    <li><strong>Is_Done</strong> - 1 for completed, 0 for pending (optional)</li>
                  </ul>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs font-mono">
                      Example: Date,Title,Topic,Is_Done<br/>
                      2024-01-15,Math homework,Mathematics,0
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <AnimatePresence mode="wait">
                {isImporting ? (
                  <motion.div
                    key="importing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                  >
                    <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-medium">Importing tasks...</p>
                      <p className="text-sm text-muted-foreground">Processing your CSV file</p>
                    </div>
                    <div className="max-w-xs mx-auto">
                      <Progress value={importProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{importProgress}% complete</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                  >
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Drop your CSV file here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      disabled={importMutation.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Import Result */}
            <AnimatePresence>
              {importResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Import completed successfully!</span>
                  </div>
                  <div className="mt-2 text-sm text-green-600 dark:text-green-300">
                    • {importResult.imported} tasks imported
                    • {importResult.skipped} duplicates skipped
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-500" />
              Export Data
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Export your tasks and analytics data with customizable filtering and format options.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Export Filters
                </h4>

                <div className="space-y-2">
                  <Label className="text-sm">Export format</Label>
                  <Select
                    value={exportSettings.format}
                    onValueChange={(value: "csv" | "excel") => 
                      setExportSettings(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                      <SelectItem value="excel">Excel (Advanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Date range</Label>
                  <Select
                    value={exportSettings.dateRange}
                    onValueChange={(value: "all" | "week" | "month" | "custom") => 
                      setExportSettings(prev => ({ ...prev, dateRange: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-completed" className="text-sm">Include completed tasks</Label>
                    <Switch
                      id="include-completed"
                      checked={exportSettings.includeCompleted}
                      onCheckedChange={(checked) => 
                        setExportSettings(prev => ({ ...prev, includeCompleted: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-pending" className="text-sm">Include pending tasks</Label>
                    <Switch
                      id="include-pending"
                      checked={exportSettings.includePending}
                      onCheckedChange={(checked) => 
                        setExportSettings(prev => ({ ...prev, includePending: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-focus" className="text-sm">Include focus sessions</Label>
                    <Switch
                      id="include-focus"
                      checked={exportSettings.includeFocusSessions}
                      onCheckedChange={(checked) => 
                        setExportSettings(prev => ({ ...prev, includeFocusSessions: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Export Preview</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Tasks to export</span>
                    <Badge variant="secondary">{getFilteredTaskCount()}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Focus sessions</span>
                    <Badge variant="secondary">
                      {exportSettings.includeFocusSessions ? focusSessions.length : 0}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Export format</span>
                    <Badge variant="outline" className="uppercase">
                      {exportSettings.format}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Date range</span>
                    <Badge variant="outline">
                      {exportSettings.dateRange === "all" ? "All time" : 
                       exportSettings.dateRange === "week" ? "Last 7 days" : "Last 30 days"}
                    </Badge>
                  </div>
                </div>

                <Button 
                  onClick={handleExport} 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export {exportSettings.format.toUpperCase()}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-500" />
              Data Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.totalTasks || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.completedTasks || 0}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {focusSessions.length}
                </div>
                <div className="text-sm text-muted-foreground">Focus Sessions</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.floor((stats?.totalFocusTime || 0) / 60)}h
                </div>
                <div className="text-sm text-muted-foreground">Total Focus Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}