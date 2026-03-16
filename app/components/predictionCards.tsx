// app/components/predictionCards.tsx
"use client";

import React from "react";

export interface PredictionData {
  risk_pct: number;
  label: "NORMAL" | "WARNING" | "CRITICAL";
  confidence: number;
  temp: number;
  vibration: number;
}

interface PredictionCardsProps {
  prediction: PredictionData;
}

function getRiskColor(risk: number): string {
  if (risk >= 70) return "#EF4444";
  if (risk >= 40) return "#F97316";
  return "#4169E1";
}

function getLabelBg(label: string): string {
  if (label === "CRITICAL") return "#FEE2E2";
  if (label === "WARNING") return "#FFF7ED";
  return "#EFF6FF";
}

function getLabelColor(label: string): string {
  if (label === "CRITICAL") return "#EF4444";
  if (label === "WARNING") return "#F97316";
  return "#4169E1";
}

function getPingColor(label: string): string {
  if (label === "CRITICAL") return "bg-red-500";
  if (label === "WARNING") return "bg-orange-400";
  return "bg-blue-500";
}

export default function PredictionCards({ prediction }: PredictionCardsProps) {
  const { risk_pct, label, confidence, temp, vibration } = prediction;
  const riskColor = getRiskColor(risk_pct);
  const labelBg = getLabelBg(label);
  const labelColor = getLabelColor(label);

  // Temp status
  const tempStatus = temp >= 150 ? "critical" : temp >= 100 ? "warning" : "normal";
  const tempColor = tempStatus === "critical" ? "#EF4444" : tempStatus === "warning" ? "#F97316" : "#4169E1";

  // Vibration status
  const vibStatus = vibration >= 3.0 ? "critical" : vibration >= 1.5 ? "warning" : "normal";
  const vibColor = vibStatus === "critical" ? "#EF4444" : vibStatus === "warning" ? "#F97316" : "#4169E1";

  return (
    <div
      className="border-t bg-white px-6 py-3 flex items-center gap-6"
      style={{ borderColor: "#4169E1" }}
    >
      {/* Status badge with pulse */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <div className="relative flex items-center justify-center w-8 h-8">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
              label !== "NORMAL" ? "animate-ping" : ""
            } ${getPingColor(label)}`}
            style={{ opacity: label !== "NORMAL" ? undefined : 0 }}
          />
          <span
            className={`relative inline-flex rounded-full h-4 w-4 ${getPingColor(label)}`}
          />
        </div>
        <div>
          <div
            className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-widest"
            style={{ backgroundColor: labelBg, color: labelColor }}
          >
            {label}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5 tabular-nums">
            {confidence.toFixed(1)}% conf.
          </div>
        </div>
      </div>

      {/* Risk bar */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Risk Index
          </span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: riskColor }}
          >
            {risk_pct.toFixed(1)}%
          </span>
        </div>
        {/* Bar */}
        <div className="relative h-4 rounded-full bg-gray-100 overflow-visible">
          {/* Gradient fill */}
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
            style={{
              width: `${risk_pct}%`,
              background: `linear-gradient(90deg, #4169E1 0%, #F97316 60%, #EF4444 100%)`,
              backgroundSize: "200% 100%",
              backgroundPosition: `${100 - risk_pct}% 0`,
            }}
          />
          {/* 40% dashed reference */}
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: "40%",
              backgroundImage: "repeating-linear-gradient(to bottom, #F97316 0, #F97316 3px, transparent 3px, transparent 6px)",
            }}
          />
          {/* 70% dashed reference */}
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: "70%",
              backgroundImage: "repeating-linear-gradient(to bottom, #EF4444 0, #EF4444 3px, transparent 3px, transparent 6px)",
            }}
          />
          {/* Labels */}
          <span
            className="absolute -bottom-4 text-[9px] text-orange-400 font-semibold"
            style={{ left: "40%", transform: "translateX(-50%)" }}
          >
            40%
          </span>
          <span
            className="absolute -bottom-4 text-[9px] text-red-400 font-semibold"
            style={{ left: "70%", transform: "translateX(-50%)" }}
          >
            70%
          </span>
        </div>
      </div>

      {/* Contributing factors */}
      <div className="flex flex-col gap-1 min-w-[160px]">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
          Factors
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-16">Temp</span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (temp / 200) * 100)}%`,
                backgroundColor: tempColor,
              }}
            />
          </div>
          <span
            className="text-[10px] font-bold tabular-nums w-10 text-right"
            style={{ color: tempColor }}
          >
            {temp.toFixed(0)}°C
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-16">Vibration</span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (vibration / 5) * 100)}%`,
                backgroundColor: vibColor,
              }}
            />
          </div>
          <span
            className="text-[10px] font-bold tabular-nums w-10 text-right"
            style={{ color: vibColor }}
          >
            {vibration.toFixed(2)}g
          </span>
        </div>
      </div>

      {/* Model info */}
      <div
        className="flex flex-col items-end gap-0.5 min-w-[120px] pl-4 border-l"
        style={{ borderColor: "#e2e8f0" }}
      >
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Model</span>
        <span className="text-[10px] font-semibold text-gray-600">Logistic Reg.</span>
        <span className="text-[9px] text-gray-400">StandardScaler</span>
        <span className="text-[9px] text-gray-400">v1.0.0</span>
      </div>
    </div>
  );
}
