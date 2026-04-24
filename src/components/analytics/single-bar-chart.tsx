"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface SingleBarData {
  label: string;
  value: number;
  color?: string;
}

interface SingleBarChartProps {
  data: SingleBarData[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
}

const DEFAULT_COLORS = [
  "#007521",
  "#86efac",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];

export function SingleBarChart({
  data,
  height = 200,
  valuePrefix = "",
  valueSuffix = "",
}: SingleBarChartProps) {
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
          formatter={(value) => [
            `${valuePrefix}${typeof value === "number" ? value.toLocaleString() : value}${valueSuffix}`,
            "Value",
          ]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
