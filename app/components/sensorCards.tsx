// app/components/sensorCards.tsx
"use client";

import React from "react";

export interface SensorData {
  temp: number;
  vibration: number;
  current: number;
  rpm: number;
  roll: number;
  pitch: number;
  yaw: number;
}

interface SensorThreshold {
  warning: number;
  critical: number;
  min: number;
  max: number;
}

const THRESHOLDS: Record<keyof SensorData, SensorThreshold> = {
  temp: { warning: 100, critical: 150, min: 20, max: 200 },
  vibration: { warning: 1.5, critical: 3.0, min: 0, max: 5 },
  current: { warning: 3.0, critical: 4.0, min: 0, max: 5 },
  rpm: { warning: 35000, critical: 45000, min: 0, max: 50000 },
  roll: { warning: 30, critical: 60, min: -180, max: 180 },
  pitch: { warning: 25, critical: 50, min: -90, max: 90 },
  yaw: { warning: 30, critical: 60, min: -180, max: 180 },
};

interface SensorConfig {
  key: keyof SensorData;
  label: string;
  unit: string;

  formatValue: (v: number) => string;
}

const SENSOR_CONFIGS: SensorConfig[] = [
  {
    key: "temp",
    label: "Temperature",
    unit: "°C",

    formatValue: (v) => v.toFixed(1),
  },
  {
    key: "vibration",
    label: "Vibration",
    unit: "g",

    formatValue: (v) => v.toFixed(3),
  },
  {
    key: "current",
    label: "Current",
    unit: "A",

    formatValue: (v) => v.toFixed(2),
  },
  {
    key: "rpm",
    label: "RPM",
    unit: "rpm",
  
    formatValue: (v) => v.toLocaleString(undefined, { maximumFractionDigits: 0 }),
  },
  {
    key: "roll",
    label: "Roll",
    unit: "°",

    formatValue: (v) => v.toFixed(1),
  },
  {
    key: "pitch",
    label: "Pitch",
    unit: "°",

    formatValue: (v) => v.toFixed(1),
  },
  {
    key: "yaw",
    label: "Yaw",
    unit: "°",
  
    formatValue: (v) => v.toFixed(1),
  },
];

function getStatus(key: keyof SensorData, value: number): "normal" | "warning" | "critical" {
  const t = THRESHOLDS[key];
  const absVal = Math.abs(value);
  if (absVal >= t.critical) return "critical";
  if (absVal >= t.warning) return "warning";
  return "normal";
}

function getBarColor(status: "normal" | "warning" | "critical"): string {
  if (status === "critical") return "#EF4444";
  if (status === "warning") return "#F97316";
  return "#4169E1";
}

function getBarPct(key: keyof SensorData, value: number): number {
  const t = THRESHOLDS[key];
  const absVal = Math.abs(value);
  return Math.min(100, Math.max(0, ((absVal - t.min) / (t.max - t.min)) * 100));
}

interface SensorCardItemProps {
  config: SensorConfig;
  value: number;
}

function SensorCardItem({ config, value }: SensorCardItemProps) {
  const status = getStatus(config.key, value);
  const barColor = getBarColor(status);
  const barPct = getBarPct(config.key, value);

  return (
    <div
      className="rounded-lg border p-3 flex flex-col gap-1.5 bg-white"
      style={{
        borderColor: status === "critical" ? "#EF4444" : status === "warning" ? "#F97316" : "#e2e8f0",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {config.label}
          </span>
        </div>
        {status !== "normal" && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{
              backgroundColor: status === "critical" ? "#FEE2E2" : "#FFF7ED",
              color: barColor,
            }}
          >
            {status}
          </span>
        )}
      </div>

      <div className="flex items-end gap-1">
        <span className="text-lg font-bold tabular-nums leading-none" style={{ color: barColor }}>
          {config.formatValue(value)}
        </span>
        <span className="text-xs text-gray-400 mb-0.5">{config.unit}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${barPct}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}

interface SensorCardsProps {
  data: SensorData;
}

export default function SensorCards({ data }: SensorCardsProps) {
  return (
    <div
      className="rounded-xl border bg-white p-4 flex flex-col gap-3 h-full overflow-y-auto"
      style={{ borderColor: "#4169E1" }}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-black">
          Live Sensor Data
        </h2>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1"
          style={{ borderColor: "#22C55E", color: "#22C55E" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
          HW MODE
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {SENSOR_CONFIGS.map((cfg) => (
          <SensorCardItem key={cfg.key} config={cfg} value={data[cfg.key]} />
        ))}
      </div>
    </div>
  );
}
