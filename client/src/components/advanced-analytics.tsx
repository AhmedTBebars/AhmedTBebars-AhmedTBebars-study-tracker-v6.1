import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, Target, Clock, Zap, Award, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AdvancedAnalyticsProps {
  data?: {
    totalTasks: number;
    completedTasks: number;
    todayTasks: number;
    totalFocusTime: number;
    streak: number;
    weeklyProgress?: Array<{ day: string; completed: number; total: number }>;
    difficultyBreakdown?: Array<{ name: string; value: number; color: string }>;
    focusPattern?: Array<{ hour: number; sessions: number }>;
    productivityTrend?: Array<{ date: string; productivity: number }>;
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export function AdvancedAnalytics({ data }: AdvancedAnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedChart, setSelectedChart] = useState("overview");

  // Mock data for demonstration - in real app this would come from props/API
  const mockData = {
    totalTasks: 124,
    completedTasks: 89,
    todayTasks: 8,
    totalFocusTime: 2430, // minutes
    streak: 12,
    weeklyProgress: [
      { day: 'Mon', completed: 12, total: 15 },
      { day: 'Tue', completed: 8, total: 10 },
      { day: 'Wed', completed: 15, total: 18 },
      { day: 'Thu', completed: 11, total: 14 },
      { day: 'Fri', completed: 9, total: 12 },
      { day: 'Sat', completed: 6, total: 8 },
      { day: 'Sun', completed: 7, total: 9 }
    ],
    difficultyBreakdown: [
      { name: 'Easy', value: 45, color: '#22c55e' },
      { name: 'Medium', value: 65, color: '#f59e0b' },
      { name: 'Hard', value: 14, color: '#ef4444' }
    ],
    focusPattern: [
      { hour: 9, sessions: 3 },
      { hour: 10, sessions: 5 },
      { hour: 11, sessions: 4 },
      { hour: 14, sessions: 6 },
      { hour: 15, sessions: 8 },
      { hour: 16, sessions: 4 },
      { hour: 19, sessions: 2 }
    ],
    productivityTrend: [
      { date: 'Jan 20', productivity: 75 },
      { date: 'Jan 21', productivity: 82 },
      { date: 'Jan 22', productivity: 78 },
      { date: 'Jan 23', productivity: 85 },
      { date: 'Jan 24', productivity: 92 },
      { date: 'Jan 25', productivity: 88 },
      { date: 'Jan 26', productivity: 95 }
    ]
  };

  const analytics = data || mockData;
  const completionRate = Math.round((analytics.completedTasks / analytics.totalTasks) * 100);
  const focusHours = Math.floor(analytics.totalFocusTime / 60);
  const focusMinutes = analytics.totalFocusTime % 60;

  const statCards = [
    {
      title: "Total Tasks",
      value: analytics.totalTasks,
      icon: Target,
      change: "+12%",
      color: "text-blue-600"
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: Award,
      change: "+5%",
      color: "text-green-600"
    },
    {
      title: "Focus Time",
      value: `${focusHours}h ${focusMinutes}m`,
      icon: Clock,
      change: "+23%",
      color: "text-purple-600"
    },
    {
      title: "Current Streak",
      value: `${analytics.streak} days`,
      icon: Zap,
      change: "New record!",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Advanced Analytics
          </h2>
          <p className="text-muted-foreground">
            Deep insights into your productivity patterns
          </p>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedChart} onValueChange={setSelectedChart}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
              <SelectItem value="focus">Focus Patterns</SelectItem>
              <SelectItem value="difficulty">Task Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className={cn("p-3 rounded-full bg-muted", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dynamic Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.weeklyProgress || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                  <Bar dataKey="total" fill="#e5e7eb" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Difficulty Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5" />
                Task Difficulty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.difficultyBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(analytics.difficultyBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Productivity Trend Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Productivity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics.productivityTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="productivity" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Focus Session Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Focus Session Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.focusPattern || []} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="hour" type="category" />
                <Tooltip />
                <Bar dataKey="sessions" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}