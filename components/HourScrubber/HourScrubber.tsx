"use client";

import type { DailySunTimes, HourlyForecast } from "@/types/weather";

interface HourScrubberProps {
  hours: HourlyForecast[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  sunTimes?: DailySunTimes[];
}

const NIGHT_COLOR = "rgba(0,0,0,0.35)";
const DAY_COLOR = "rgba(255,190,40,0.13)";

function buildDaylightGradient(hours: HourlyForecast[], sunTimes: DailySunTimes[]): string {
  const total = hours.length - 1;
  if (total <= 0) return NIGHT_COLOR;

  // Collect hard-stop transition points: {pct, color starting here}
  const transitions: { pct: number; color: string }[] = [{ pct: 0, color: NIGHT_COLOR }];

  for (const { sunrise, sunset } of sunTimes) {
    const srMs = new Date(sunrise).getTime();
    const ssMs = new Date(sunset).getTime();
    const srIdx = hours.findIndex((h) => new Date(h.time).getTime() >= srMs);
    const ssIdx = hours.findIndex((h) => new Date(h.time).getTime() >= ssMs);
    if (srIdx >= 0) transitions.push({ pct: (srIdx / total) * 100, color: DAY_COLOR });
    if (ssIdx >= 0) transitions.push({ pct: (ssIdx / total) * 100, color: NIGHT_COLOR });
  }

  transitions.sort((a, b) => a.pct - b.pct);

  const stops: string[] = [];
  for (let i = 0; i < transitions.length; i++) {
    const { pct, color } = transitions[i];
    if (i === 0) {
      stops.push(`${color} ${pct.toFixed(1)}%`);
    } else {
      stops.push(`${transitions[i - 1].color} ${pct.toFixed(1)}%`);
      stops.push(`${color} ${pct.toFixed(1)}%`);
    }
  }
  stops.push(`${transitions[transitions.length - 1].color} 100%`);

  return `linear-gradient(to right, ${stops.join(", ")})`;
}

function formatTime(isoTime: string): string {
  const date = new Date(isoTime);
  const h = date.getHours();
  if (h === 0) return "12:00 am";
  if (h === 12) return "12:00 pm";
  return h < 12 ? `${h}:00 am` : `${h - 12}:00 pm`;
}

function formatDate(isoTime: string): string {
  const date = new Date(isoTime);
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${day} ${m}/${d}`;
}

export function HourScrubber({ hours, selectedIndex, onSelect, sunTimes }: HourScrubberProps) {
  if (!hours.length) return null;
  const selectedHour = hours[selectedIndex];

  return (
    <div style={{ padding: "14px 16px 18px", backgroundColor: "#3c3836", borderTop: "1px solid #504945" }}>
      {/* Date + time label */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "#a89984" }}>{formatDate(selectedHour.time)}</span>
        <span style={{ fontSize: 18, fontWeight: 600, color: "#ebdbb2" }}>{formatTime(selectedHour.time)}</span>
        <span style={{ fontSize: 11, color: "#665c54", marginLeft: "auto" }}>
          {selectedIndex + 1} / {hours.length}
        </span>
      </div>

      {/* Daylight bar */}
      {sunTimes && sunTimes.length > 0 && (
        <div style={{
          height: 4,
          borderRadius: 2,
          marginBottom: 6,
          background: buildDaylightGradient(hours, sunTimes),
        }} />
      )}

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={hours.length - 1}
        value={selectedIndex}
        onChange={(e) => onSelect(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#83a598", cursor: "pointer", display: "block" }}
      />

      {/* Start / end labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#665c54" }}>
        <span>{formatDate(hours[0].time)} {formatTime(hours[0].time)}</span>
        <span>{formatDate(hours[hours.length - 1].time)} {formatTime(hours[hours.length - 1].time)}</span>
      </div>
    </div>
  );
}
