// app/components/Charts.tsx
"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";

interface HistoryPoint {
  t: number;
  v: number;
}

interface ChartsProps {
  history: HistoryPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string | number;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const val = payload[0]?.value;
  if (val === undefined) return null;
  const color = val >= 3.0 ? "#EF4444" : val >= 1.5 ? "#F97316" : "#4169E1";
  return (
    <div
      className="rounded-lg border bg-white px-3 py-2 shadow-md text-xs"
      style={{ borderColor: "#4169E1" }}
    >
      <div className="font-semibold" style={{ color }}>
        {val.toFixed(3)} g
      </div>
      <div className="text-gray-400 text-[10px]">Vibration</div>
    </div>
  );
}

export default function Charts({ history }: ChartsProps) {
  return (
    <div
      className="rounded-xl border bg-white p-4 flex flex-col h-full"
      style={{ borderColor: "#4169E1" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-black">
          Vibration History
        </h2>
        <span className="text-[10px] text-gray-400 tabular-nums">
          Last {history.length} pts
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={history.map((p, i) => ({ t: i, v: p.v }))}
            margin={{ top: 8, right: 8, left: -20, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="t"
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              label={{ value: "Samples", position: "insideBottomRight", offset: -4, fontSize: 9, fill: "#9ca3af" }}
            />
            <YAxis
              domain={[0, 5]}
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={1.5}
              stroke="#F97316"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: "WARN 1.5g", position: "insideTopRight", fontSize: 9, fill: "#F97316" }}
            />
            <ReferenceLine
              y={3.0}
              stroke="#EF4444"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: "CRIT 3.0g", position: "insideTopRight", fontSize: 9, fill: "#EF4444" }}
            />
            <Line
              type="monotone"
              dataKey="v"
              stroke="#4169E1"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name="Vibration (g)"
            />
            <Legend
              wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }}
              formatter={() => "Vibration (g)"}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
