// app/components/simulationCards.tsx
"use client";

import React from "react";

export interface SimValues {
  temp: number;
  vibration: number;
  current: number;
  rpm: number;
  roll: number;
  pitch: number;
  yaw: number;
}

interface SliderConfig {
  key: keyof SimValues;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: SliderConfig[] = [
  { key: "temp", label: "Temperature", unit: "°C", min: 20, max: 200, step: 0.5 },
  { key: "vibration", label: "Vibration", unit: "g", min: 0, max: 5, step: 0.01 },
  { key: "current", label: "Current", unit: "A", min: 0, max: 5, step: 0.01 },
  { key: "rpm", label: "RPM", unit: "rpm", min: 0, max: 50000, step: 100 },
  { key: "roll", label: "Roll", unit: "°", min: -180, max: 180, step: 1 },
  { key: "pitch", label: "Pitch", unit: "°", min: -90, max: 90, step: 1 },
  { key: "yaw", label: "Yaw", unit: "°", min: -180, max: 180, step: 1 },
];

const PRESETS: { label: string; values: SimValues }[] = [
  {
    label: "Idle",

    values: {
      temp: 45,
      vibration: 0.1,
      current: 0.8,
      rpm: 5000,
      roll: 0,
      pitch: 0,
      yaw: 0,
    },
  },
  {
    label: "Cruise",

    values: {
      temp: 72,
      vibration: 0.35,
      current: 2.2,
      rpm: 26000,
      roll: 0,
      pitch: 3,
      yaw: 0,
    },
  },
  {
    label: "Stress",
  
    values: {
      temp: 148,
      vibration: 3.1,
      current: 3.8,
      rpm: 43000,
      roll: 12,
      pitch: -8,
      yaw: 5,
    },
  },
  {
    label: "FAIL",
  
    values: {
      temp: 190,
      vibration: 4.8,
      current: 4.9,
      rpm: 49500,
      roll: 45,
      pitch: -30,
      yaw: 20,
    },
  },
];

interface SimulationCardsProps {
  values: SimValues;
  onChange: (values: SimValues) => void;
}

function SliderRow({
  config,
  value,
  onChange,
}: {
  config: SliderConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  const { min, max, step } = config;
  const pct = ((value - min) / (max - min)) * 100;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          {config.label}
        </span>
        <span className="text-xs font-bold tabular-nums" style={{ color: "#4169E1" }}>
          {config.key === "rpm"
            ? value.toLocaleString()
            : value.toFixed(config.key === "temp" || config.key === "roll" || config.key === "pitch" || config.key === "yaw" ? 1 : 2)}{" "}
          {config.unit}
        </span>
      </div>
      {/* Custom slider track */}
      <div className="relative h-6 flex items-center">
        {/* Track background */}
        <div className="absolute left-0 right-0 h-[3px] rounded-full bg-gray-200">
          {/* Filled portion */}
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${pct}%`,
              backgroundColor: "#4169E1",
            }}
          />
        </div>
        {/* Custom thumb */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 shadow-sm pointer-events-none z-20"
          style={{
            left: `calc(${pct}% - 8px)`,
            backgroundColor: "#ffffff",
            borderColor: "#4169E1",
            boxShadow: "0 1px 4px rgba(65,105,225,0.4)",
          }}
        />
        {/* Native range input overlay */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          style={{ margin: 0, padding: 0 }}
        />
      </div>
    </div>
  );
}

export default function SimulationCards({ values, onChange }: SimulationCardsProps) {
  const handleSliderChange = (key: keyof SimValues, v: number) => {
    onChange({ ...values, [key]: v });
  };

  const applyPreset = (preset: SimValues) => {
    onChange({ ...preset });
  };

  return (
    <div
      className="rounded-xl border bg-white p-4 flex flex-col gap-3 h-full overflow-y-auto"
      style={{ borderColor: "#4169E1" }}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-black">
          Simulation Controls
        </h2>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
          style={{ borderColor: "#4169E1", color: "#4169E1" }}
        >
          SIM MODE
        </span>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.values)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-[10px] font-semibold tracking-wide transition-all duration-100 hover:opacity-80 active:scale-95"
            style={{
              borderColor: "#4169E1",
              color: "#4169E1",
              backgroundColor: "rgba(65,105,225,0.06)",
            }}
          >
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-3">
        {SLIDERS.map((s) => (
          <SliderRow
            key={s.key}
            config={s}
            value={values[s.key]}
            onChange={(v) => handleSliderChange(s.key, v)}
          />
        ))}
      </div>
    </div>
  );
}
