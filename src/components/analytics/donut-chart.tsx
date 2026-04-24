"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  height?: number;
}

export function DonutChart({ data, height = 220 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius="52%"
          outerRadius="72%"
          paddingAngle={3}
          dataKey="value"
          nameKey="label"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontSize: "12px",
          }}
          formatter={(value, name) => [
            typeof value === "number" ? value.toLocaleString() : String(value),
            String(name),
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
          formatter={(value) => (
            <span style={{ color: "#374151" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
