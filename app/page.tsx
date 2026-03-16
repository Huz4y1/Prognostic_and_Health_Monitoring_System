// app/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import ToggleButton from "./components/toggleButton";
import SimulationCards, { SimValues } from "./components/simulationCards";
import SensorCards, { SensorData } from "./components/sensorCards";
import PredictionCards, { PredictionData } from "./components/predictionCards";
import Charts from "./components/Charts";

// ─── Dynamic import for R3F (no SSR) ─────────────────────────────────────────
const JetEngineScene = dynamic(() => import("./components/jetEngineScene"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-xl border flex items-center justify-center bg-gray-950 text-gray-400 text-xs"
      style={{ width: 420, height: 340, borderColor: "#4169E1" }}
    >
      Loading 3D Engine…
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface HistoryPoint {
  t: number;
  v: number;
}

interface WsPayload extends SensorData {
  risk_pct: number;
  label: "NORMAL" | "WARNING" | "CRITICAL";
  confidence: number;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_SIM: SimValues = {
  temp: 72,
  vibration: 0.35,
  current: 2.2,
  rpm: 26000,
  roll: 0,
  pitch: 3,
  yaw: 0,
};

const DEFAULT_PREDICTION: PredictionData = {
  risk_pct: 0,
  label: "NORMAL",
  confidence: 0,
  temp: 72,
  vibration: 0.35,
};

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws";

// ─── Component ────────────────────────────────────────────────────────────────
export default function Page() {
  const [mode, setMode] = useState<"simulation" | "physical">("simulation");
  const [simValues, setSimValues] = useState<SimValues>(DEFAULT_SIM);
  const [hwData, setHwData] = useState<SensorData>(DEFAULT_SIM);
  const [prediction, setPrediction] = useState<PredictionData>(DEFAULT_PREDICTION);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [wsStatus, setWsStatus] = useState<"connecting" | "live" | "offline">("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyCounterRef = useRef(0);

  // ── Push vibration into history ──────────────────────────────────────────
  const pushHistory = useCallback((v: number) => {
    setHistory((prev) => {
      const next = [...prev, { t: historyCounterRef.current++, v }];
      return next.length > 120 ? next.slice(next.length - 120) : next;
    });
  }, []);

  // ── Merge WS payload into state ──────────────────────────────────────────
  const handleWsMessage = useCallback(
    (raw: string) => {
      try {
        const payload: WsPayload = JSON.parse(raw);
        const pred: PredictionData = {
          risk_pct: payload.risk_pct ?? 0,
          label: payload.label ?? "NORMAL",
          confidence: payload.confidence ?? 0,
          temp: payload.temp,
          vibration: payload.vibration,
        };
        setPrediction(pred);
        pushHistory(payload.vibration);

        if (mode === "physical") {
          setHwData({
            temp: payload.temp,
            vibration: payload.vibration,
            current: payload.current,
            rpm: payload.rpm,
            roll: payload.roll,
            pitch: payload.pitch,
            yaw: payload.yaw,
          });
        }
      } catch {
        // ignore malformed
      }
    },
    [mode, pushHistory]
  );

  // ── WebSocket lifecycle ───────────────────────────────────────────────────
  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let ws: WebSocket;

    function connect() {
      setWsStatus("connecting");
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setWsStatus("live");
      ws.onclose = () => {
        setWsStatus("offline");
        reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onerror = () => {
        setWsStatus("offline");
      };
      ws.onmessage = (e) => handleWsMessage(e.data as string);
    }

    connect();
    return () => {
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [handleWsMessage]);

  // ── Simulation send loop ──────────────────────────────────────────────────
  useEffect(() => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    if (mode === "simulation") {
      simIntervalRef.current = setInterval(() => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(simValues));
        }
      }, 100);
    }

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [mode, simValues]);

  // ── Display data for scene ────────────────────────────────────────────────
  const displayData: SensorData = mode === "simulation" ? simValues : hwData;

  // ── WS status indicator ───────────────────────────────────────────────────
  const wsIndicatorColor =
    wsStatus === "live" ? "#22C55E" : wsStatus === "connecting" ? "#F97316" : "#EF4444";
  const wsLabel =
    wsStatus === "live" ? "LIVE" : wsStatus === "connecting" ? "CONNECTING" : "OFFLINE";

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 bg-white border-b flex items-center justify-between px-6 py-3"
        style={{ borderColor: "#4169E1" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-black">
            ✈ JET ENGINE PHM
          </span>
          <span className="hidden sm:block text-[10px] text-gray-400 uppercase tracking-widest">
            Digital Twin · Prognostic Health Monitor
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* WS Status */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: wsIndicatorColor,
                boxShadow: wsStatus === "live" ? `0 0 5px ${wsIndicatorColor}` : "none",
              }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: wsIndicatorColor }}
            >
              {wsLabel}
            </span>
          </div>

          <ToggleButton mode={mode} onChange={setMode} />
        </div>
      </header>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex-1 grid gap-4 p-4 overflow-hidden"
          style={{
            gridTemplateColumns: "420px 1fr 1fr",
            minHeight: 0,
          }}
        >
          {/* Left: 3D Scene */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <JetEngineScene
              pitch={displayData.pitch}
              roll={displayData.roll}
              yaw={displayData.yaw}
              vibration={displayData.vibration}
            />
            {/* Quick stats under scene */}
            <div
              className="rounded-xl border p-3 grid grid-cols-2 gap-2"
              style={{ borderColor: "#4169E1" }}
            >
              {[
                { label: "RPM", value: displayData.rpm.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                { label: "Temp", value: `${displayData.temp.toFixed(1)}°C` },
                { label: "Current", value: `${displayData.current.toFixed(2)}A` },
                { label: "Vibration", value: `${displayData.vibration.toFixed(3)}g` },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-bold tabular-nums text-black">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Middle: Controls / Sensors */}
          <div className="overflow-y-auto min-h-0">
            {mode === "simulation" ? (
              <SimulationCards values={simValues} onChange={setSimValues} />
            ) : (
              <SensorCards data={hwData} />
            )}
          </div>

          {/* Right: Charts */}
          <div className="min-h-0 flex flex-col gap-4">
            <div className="flex-1 min-h-0">
              <Charts history={history} />
            </div>
            {/* Attitude readout */}
            <div
              className="rounded-xl border p-3 grid grid-cols-3 gap-2 shrink-0"
              style={{ borderColor: "#4169E1" }}
            >
              {[
                { label: "PITCH", value: displayData.pitch, color: "#EF4444" },
                { label: "YAW", value: displayData.yaw, color: "#22C55E" },
                { label: "ROLL", value: displayData.roll, color: "#4169E1" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color }}>
                    {label}
                  </span>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color }}
                  >
                    {value.toFixed(1)}°
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer: Prediction ──────────────────────────────────────────────── */}
      <footer className="shrink-0">
        <PredictionCards prediction={prediction} />
      </footer>
    </div>
  );
}