"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface ComparisonBarData {
  label: string;
  "Last 7 days": number;
  "Last 30 days": number;
}

interface ComparisonBarChartProps {
  data: ComparisonBarData[];
  height?: number;
}

export function ComparisonBarChart({
  data,
  height = 200,
}: ComparisonBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
        <Bar
          dataKey="Last 7 days"
          fill="#007521"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
        <Bar
          dataKey="Last 30 days"
          fill="#86efac"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
