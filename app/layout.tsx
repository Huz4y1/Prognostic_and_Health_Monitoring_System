// app/layout.tsx
import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jet Engine Digital Twin — PHM Dashboard",
  description:
    "Prognostic Health Monitor for jet engine digital twin with real-time ML inference, sensor telemetry, and 3D visualization.",
  keywords: ["jet engine", "digital twin", "PHM", "predictive maintenance", "IoT"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ibmPlexMono.variable}>
      <body className="font-mono antialiased bg-white text-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
