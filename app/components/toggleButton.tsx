// app/components/toggleButton.tsx
"use client";

import React from "react";

interface ToggleButtonProps {
  mode: "simulation" | "physical";
  onChange: (mode: "simulation" | "physical") => void;
}

export default function ToggleButton({ mode, onChange }: ToggleButtonProps) {
  return (
    <div
      className="inline-flex rounded-full border border-[#4169E1] overflow-hidden"
      style={{ borderColor: "#4169E1" }}
    >
      <button
        onClick={() => onChange("simulation")}
        className="px-4 py-1.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-150 focus:outline-none"
        style={
          mode === "simulation"
            ? {
                backgroundColor: "#4169E1",
                color: "#ffffff",
              }
            : {
                backgroundColor: "transparent",
                color: "#4169E1",
              }
        }
      >
        SIM
      </button>
      <button
        onClick={() => onChange("physical")}
        className="px-4 py-1.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-150 focus:outline-none"
        style={
          mode === "physical"
            ? {
                backgroundColor: "#4169E1",
                color: "#ffffff",
              }
            : {
                backgroundColor: "transparent",
                color: "#4169E1",
              }
        }
      >
        Physical
      </button>
    </div>
  );
}
