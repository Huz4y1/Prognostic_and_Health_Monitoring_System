# Jet Engine Digital Twin — PHM Dashboard

A full-stack Prognostic Health Monitor (PHM) for a jet engine digital twin.
Real-time ML inference, 3D R3F visualization, WebSocket telemetry, and ESP32 hardware support.

---

## Tech Stack

| Layer      | Technology                                                              |
|------------|-------------------------------------------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS, React Three Fiber, Recharts       |
| Backend    | FastAPI, WebSockets, PySerial, Scikit-Learn, Joblib                     |
| Hardware   | ESP32, MPU6500, ACS712-5A, DS18B20, KY-003 Hall RPM, TB6612FNG          |
| ML Model   | StandardScaler → LogisticRegression (balanced class weight)             |

---

## Project Structure

```
jet-engine-phm/
├── app/
│   ├── layout.tsx                  IBM Plex Mono font, metadata
│   ├── page.tsx                    Main dashboard, mode state, WS logic
│   ├── globals.css                 Tailwind directives, custom scrollbar & range
│   └── components/
│       ├── jetEngineScene.tsx      R3F canvas, GLTF + procedural fallback
│       ├── simulationCards.tsx     Sliders for all 7 sensor values + presets
│       ├── sensorCards.tsx         Read-only live hardware sensor cards
│       ├── predictionCards.tsx     Risk bar, label, confidence, factors
│       ├── toggleButton.tsx        SIM / HW pill toggle
│       └── Charts.tsx              Recharts vibration history line chart
├── machineLearning/
│   ├── requirements.txt
│   ├── train_model.py              Train pipeline, save to model/
│   └── data/
│       └── synthetic_data.py       Generate 10,000-row data.csv
├── api/
│   ├── main.py                     FastAPI server, WS, serial reader, /predict
│   └── requirements.txt
├── public/
│   └── engine.gltf                 (optional — procedural fallback used if absent)
├── package.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.ts
└── tsconfig.json
```

---

## Quick Start

### 1. Frontend

```bash
npm install
npm run dev
# → http://localhost:3000
```

### 2. ML — Generate Data & Train Model

```bash
cd machineLearning
pip install -r requirements.txt

# Generate synthetic dataset (10,000 rows → data/data.csv)
python data/synthetic_data.py

# Train model (saves → model/logistic_regression.pkl)
python train_model.py
```

Expected output:
```
AUC-ROC (test)   : ~0.99
5-Fold CV AUC    : ~0.99 ± 0.001
```

### 3. API Server

```bash
cd api
pip install -r requirements.txt

# Simulation mode (no hardware)
uvicorn main:app --reload --port 8000

# With hardware serial
SERIAL_PORT=/dev/ttyUSB0 uvicorn main:app --reload --port 8000
```

---

## Environment Variables

| Variable               | Default                                        | Description                  |
|------------------------|------------------------------------------------|------------------------------|
| `NEXT_PUBLIC_WS_URL`   | `ws://localhost:8000/ws`                       | WebSocket URL for frontend   |
| `SERIAL_PORT`          | `/dev/ttyUSB0`                                 | ESP32 serial device          |
| `MODEL_PATH`           | `../machineLearning/model/logistic_regression.pkl` | Path to trained model    |

Create a `.env.local` in the project root:
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

---

## ESP32 Firmware

The ESP32 should emit newline-delimited JSON at 115200 baud:

```json
{"temp": 72.4, "vibration": 0.35, "current": 2.18, "rpm": 25800, "roll": 0.5, "pitch": 2.8, "yaw": -0.3}
```

### Sensor Wiring

| Sensor         | GPIO         | Notes                              |
|----------------|--------------|------------------------------------|
| MPU6500        | SDA=21, SCL=22 | I²C; provides roll/pitch/yaw/vibration |
| DS18B20        | GPIO 4       | OneWire; temperature               |
| ACS712-5A      | GPIO 34 (ADC)| Current sense; 185mV/A             |
| KY-003 Hall    | GPIO 35      | RPM pulse counting                 |
| TB6612FNG      | PWM GPIO 25  | Motor driver PWM speed control     |

### Minimal Arduino Sketch (pseudocode)

```cpp
#include <ArduinoJson.h>
#include <MPU6500_WE.h>
#include <DallasTemperature.h>

void loop() {
  StaticJsonDocument<256> doc;
  doc["temp"]      = ds18b20.getTempC();
  doc["vibration"] = mpu.getResultantG();
  doc["current"]   = (analogRead(ACS_PIN) * 3.3 / 4095.0 - 2.5) / 0.185;
  doc["rpm"]       = calculateRPM();
  doc["roll"]      = mpu.getRoll();
  doc["pitch"]     = mpu.getPitch();
  doc["yaw"]       = mpu.getYaw();
  serializeJson(doc, Serial);
  Serial.println();
  delay(100); // 10 Hz
}
```

---

## ML Model Details

- **Features**: `[temp, vibration, current, rpm]`
- **Target**: `0 = NORMAL`, `1 = FAILURE`
- **Pipeline**: `StandardScaler → LogisticRegression(C=1.0, class_weight="balanced")`
- **Failure modes** in synthetic data:
  1. Thermal + vibration: `temp~N(155,15)`, `vib~N(3.2,0.7)`
  2. Overspeed: `rpm~N(46000,1500)`, `current~N(4.0,0.3)`
  3. Electrical fault: `current~N(4.5,0.25)`

### Risk Thresholds

| `risk_pct` | Label      |
|------------|------------|
| < 40%      | NORMAL     |
| 40–70%     | WARNING    |
| ≥ 70%      | CRITICAL   |

---

## Dashboard Features

- **SIM mode**: Sliders control all 7 sensor values live. Four quick presets (Idle / Cruise / Stress / FAIL). Sends frames to WS at 10 Hz.
- **HW mode**: Receives live scored telemetry from serial ESP32 via WS broadcast.
- **3D Scene**: R3F canvas renders GLTF engine or procedural fallback. Pitch/roll/yaw lerped at 0.12 coefficient. Sinusoidal jitter scales with vibration. Glow shifts blue→red.
- **Vibration history**: 120-point rolling window, threshold reference lines at 1.5g (warn) and 3.0g (critical).
- **Prediction footer**: Animated pulse dot, gradient risk bar, contributing factor bars, model metadata.

---

## Theme

- Background: `#ffffff`
- Text: `#000000`
- Primary accent: `#4169E1` (Royal Blue)
- Warning: `#F97316` (Orange)
- Critical: `#EF4444` (Red)
- Font: IBM Plex Mono (400/500/600/700)
