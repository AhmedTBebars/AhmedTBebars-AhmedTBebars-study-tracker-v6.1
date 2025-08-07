import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FocusTimer } from "@/components/focus-timer";
import { useFocusStore } from "@/stores/focus-store";
import { Timer, CheckCircle, Clock } from "lucide-react";

export default function Focus() {
  const { sessionsCompleted } = useFocusStore();

  // Fetch today's focus sessions
  const { data: focusSessions = [] } = useQuery({
    queryKey: ["/api/focus-sessions"],
  });

  // Filter today's sessions
  const todayFocusSessions = focusSessions.filter((session: any) => {
    const today = new Date().toISOString().split('T')[0];
    const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
    return sessionDate === today && session.sessionType === "focus";
  });

  const totalFocusTimeToday = todayFocusSessions.reduce(
    (total: number, session: any) => total + session.duration,
    0
  );

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (sessionType: string) => {
    switch (sessionType) {
      case "focus":
        return "bg-success/10 text-success";
      case "break":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Focus Mode</h1>
            <p className="text-muted-foreground mt-1">
              Stay focused with Pomodoro sessions
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Focus Timer */}
            <FocusTimer />

            {/* Focus Sessions Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Today's Focus Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayFocusSessions.length > 0 ? (
                  <>
                    {todayFocusSessions.map((session: any) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 bg-success/10 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-success rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">
                              {session.taskId ? "Task Focus Session" : "General Focus"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.duration} minutes • Completed
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-success font-medium">
                          {new Date(session.completedAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Timer className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No focus sessions yet today</p>
                    <p className="text-sm text-muted-foreground">
                      Start your first session to begin tracking
                    </p>
                  </div>
                )}

                {/* Focus Stats */}
                <div className="pt-6 border-t border-border">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Session Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {todayFocusSessions.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Sessions Today</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">
                        {formatTime(totalFocusTimeToday)}
                      </p>
                      <p className="text-xs text-muted-foreground">Focus Time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Focus Tips */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Focus Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Timer className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium mb-2">25-Minute Sessions</h4>
                  <p className="text-sm text-muted-foreground">
                    The optimal focus duration for maximum productivity
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <h4 className="font-medium mb-2">Single Task Focus</h4>
                  <p className="text-sm text-muted-foreground">
                    Concentrate on one task at a time for better results
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <h4 className="font-medium mb-2">Regular Breaks</h4>
                  <p className="text-sm text-muted-foreground">
                    Take 5-minute breaks to maintain peak performance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
