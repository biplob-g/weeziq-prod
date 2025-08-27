"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Users, MessageSquare } from "lucide-react";

interface ConversationData {
  time: string;
  conversations: number;
  visitors: number;
  satisfaction: number;
}

interface PerformanceChartProps {
  domainId?: string;
}

const generateMockData = (
  range: "day" | "week" | "month"
): ConversationData[] => {
  const now = new Date();
  const data: ConversationData[] = [];

  if (range === "day") {
    // Last 24 hours
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        conversations: Math.floor(Math.random() * 20) + 5,
        visitors: Math.floor(Math.random() * 50) + 10,
        satisfaction: Math.floor(Math.random() * 20) + 80,
      });
    }
  } else if (range === "week") {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        time: date.toLocaleDateString("en-US", { weekday: "short" }),
        conversations: Math.floor(Math.random() * 100) + 20,
        visitors: Math.floor(Math.random() * 200) + 50,
        satisfaction: Math.floor(Math.random() * 20) + 80,
      });
    }
  } else {
    // Last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        time: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        conversations: Math.floor(Math.random() * 200) + 50,
        visitors: Math.floor(Math.random() * 400) + 100,
        satisfaction: Math.floor(Math.random() * 20) + 80,
      });
    }
  }

  return data;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  domainId: _domainId,
}) => {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [data, setData] = useState<ConversationData[]>([]);

  useEffect(() => {
    setData(generateMockData(timeRange));
  }, [timeRange]);

  const totalConversations = data.reduce(
    (sum, item) => sum + item.conversations,
    0
  );
  const totalVisitors = data.reduce((sum, item) => sum + item.visitors, 0);
  const avgSatisfaction = Math.round(
    data.reduce((sum, item) => sum + item.satisfaction, 0) / data.length
  );

  const renderChart = () => {
    if (chartType === "pie") {
      const pieData = [
        { name: "Conversations", value: totalConversations, color: "#3b82f6" },
        { name: "Visitors", value: totalVisitors, color: "#10b981" },
      ];

      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent || 0 * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    const ChartComponent = chartType === "line" ? LineChart : BarChart;
    const DataComponent = chartType === "line" ? Line : Bar;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <DataComponent
            type="monotone"
            dataKey="conversations"
            stroke="#3b82f6"
            fill="#3b82f6"
            name="Conversations"
          />
          <DataComponent
            type="monotone"
            dataKey="visitors"
            stroke="#10b981"
            fill="#10b981"
            name="Visitors"
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Analytics
          </CardTitle>
          <div className="flex gap-2">
            <Select
              value={timeRange}
              onValueChange={(value: "day" | "week" | "month") =>
                setTimeRange(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={chartType}
              onValueChange={(value: "bar" | "line" | "pie") =>
                setChartType(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Conversations</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {totalConversations}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Total Visitors</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {totalVisitors}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Avg Satisfaction</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {avgSatisfaction}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
