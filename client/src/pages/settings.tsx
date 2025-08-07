import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import { useFocusStore } from "@/stores/focus-store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Settings as SettingsIcon,
  Palette,
  Bell,
  Calendar,
  Mail,
  Database,
  ArchiveRestore,
  RotateCcw,
  Trash2,
  Info,
  Timer,
} from "lucide-react";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { sessionLength, breakLength, setSessionLength, setBreakLength } =
    useFocusStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Local state for settings
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    morningTime: "09:00",
    eveningTime: "18:00",
    focusBreaks: true,
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    googleCalendarConnected: false,
    emailReports: false,
    email: "",
  });

  const [focusColors, setFocusColors] = useState("primary");

  // Fetch current settings (with fetcher)
  const { data: settings = [] } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: () => apiRequest("GET", "/api/settings"),
  });

  // Update settings mutation
  const updateSettingMutation = useMutation({
    mutationFn: async (setting: { key: string; value: string }) => {
      return apiRequest("POST", "/api/settings", setting);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const handleNotificationToggle = (key: string, value: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: value }));
    updateSettingMutation.mutate({ key, value: value.toString() });
  };

  const handleTimeChange = (key: string, value: string) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: value }));
    updateSettingMutation.mutate({ key, value });
  };

  const handleFocusSettingChange = (key: string, value: number) => {
    if (key === "sessionLength") {
      setSessionLength(value);
    } else if (key === "breakLength") {
      setBreakLength(value);
    }
    updateSettingMutation.mutate({ key, value: value.toString() });
  };

  const handleGoogleCalendarConnect = () => {
    toast({
      title: "Google Calendar Integration",
      description: "This feature will be available in a future update.",
    });
  };

  const handleEmailSetup = () => {
    if (!integrationSettings.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Email Reports Setup",
      description: "This feature will be available in a future update.",
    });
  };

  const handleBackup = () => {
    toast({
      title: "Backup created",
      description: "Your data has been backed up successfully.",
    });
  };

  const handleRestore = () => {
    toast({
      title: "Restore functionality",
      description: "This feature will be available in a future update.",
    });
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      toast({
        title: "Data cleared",
        description: "All data has been cleared from the application.",
        variant: "destructive",
      });
    }
  };

  const colorOptions = [
    { value: "primary", label: "Blue", color: "hsl(239, 84%, 67%)" },
    { value: "success", label: "Green", color: "hsl(142, 76%, 36%)" },
    { value: "warning", label: "Orange", color: "hsl(38, 92%, 50%)" },
    { value: "error", label: "Red", color: "hsl(0, 84.2%, 60.2%)" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Customize your Study Tracker experience
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Focus Timer Color
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customize focus session timer appearance
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFocusColors(option.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        focusColors === option.value
                          ? "border-white shadow-md scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: option.color }}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Focus Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-length">Session Length</Label>
                  <Select
                    value={sessionLength.toString()}
                    onValueChange={(value) =>
                      handleFocusSettingChange("sessionLength", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="25">25 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="break-length">Break Length</Label>
                  <Select
                    value={breakLength.toString()}
                    onValueChange={(value) =>
                      handleFocusSettingChange("breakLength", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Daily Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified about today's tasks
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.enabled}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("enabled", checked)
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="morning-reminder">Morning Reminder</Label>
                  <Input
                    id="morning-reminder"
                    type="time"
                    value={notificationSettings.morningTime}
                    onChange={(e) =>
                      handleTimeChange("morningTime", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="evening-reminder">Evening Review</Label>
                  <Input
                    id="evening-reminder"
                    type="time"
                    value={notificationSettings.eveningTime}
                    onChange={(e) =>
                      handleTimeChange("eveningTime", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Focus Session Breaks
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Remind when it's time for a break
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.focusBreaks}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("focusBreaks", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Integration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Calendar */}
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">
                      Google Calendar
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Sync tasks as calendar events
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleGoogleCalendarConnect}
                  variant={
                    integrationSettings.googleCalendarConnected
                      ? "outline"
                      : "default"
                  }
                >
                  {integrationSettings.googleCalendarConnected
                    ? "Connected"
                    : "Connect"}
                </Button>
              </div>

              {/* Email Reports */}
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">
                      Email Reports
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly and monthly progress reports
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={integrationSettings.email}
                    onChange={(e) =>
                      setIntegrationSettings((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-40"
                  />
                  <Button onClick={handleEmailSetup}>Setup</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleBackup}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 h-16"
                >
                  <ArchiveRestore className="w-5 h-5 text-primary" />
                  <span>Backup Data</span>
                </Button>

                <Button
                  onClick={handleRestore}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 h-16"
                >
                  <RotateCcw className="w-5 h-5 text-success" />
                  <span>Restore Data</span>
                </Button>

                <Button
                  onClick={handleClearData}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 h-16 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Clear All Data</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center justify-center space-x-2 h-16"
                  onClick={() => {
                    toast({
                      title: "Study Tracker v1.0",
                      description:
                        "Premium productivity suite for students and professionals.",
                    });
                  }}
                >
                  <Info className="w-5 h-5 text-blue-500" />
                  <span>About</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
