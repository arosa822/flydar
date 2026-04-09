"use client";

import { useEffect, useRef } from "react";
import type { DailySunTimes, HourlyForecast, WindLevel } from "@/types/weather";
import { rateCondition } from "@/lib/weather/conditionRating";
import { WindArrow } from "@/components/WindArrow/WindArrow";

const COL_W = 68;  // px per hour column
const ALT_W = 76;  // px for sticky altitude label column

const SPEED_COLORS = { good: "#ebdbb2", marginal: "#fabd2f", bad: "#fb4934" };

function findClosestLevel(levels: WindLevel[], targetFt: number): WindLevel | null {
  if (!levels.length) return null;
  return levels.reduce((best, l) =>
    Math.abs(l.altitudeFt - targetFt) < Math.abs(best.altitudeFt - targetFt) ? l : best
  );
}

function formatHour(isoTime: string): string {
  const h = new Date(isoTime).getHours();
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function formatDayLabel(isoTime: string): string {
  return new Date(isoTime).toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
}

function altLabel(ft: number): string {
  return ft <= 50 ? "Surface" : `${ft.toLocaleString()} ft`;
}

interface WindGridProps {
  hours: HourlyForecast[];
  selectedHourIndex: number;
  onSelectHour: (index: number) => void;
  sunTimes?: DailySunTimes[];
}

export function WindGrid({ hours, selectedHourIndex, onSelectHour, sunTimes }: WindGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected column into view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const colLeft = ALT_W + selectedHourIndex * COL_W;
    const colCenter = colLeft + COL_W / 2;
    const target = colCenter - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, target);
  }, [selectedHourIndex]);

  // Derive altitude levels from data (descending)
  const altitudeLevels: number[] = hours[0]
    ? [...hours[0].levels].sort((a, b) => b.altitudeFt - a.altitudeFt).map(l => l.altitudeFt)
    : [];

  // Build a set of hour indices that are in daylight
  const daylightSet = new Set<number>();
  if (sunTimes) {
    for (const { sunrise, sunset } of sunTimes) {
      const srMs = new Date(sunrise).getTime();
      const ssMs = new Date(sunset).getTime();
      hours.forEach((h, i) => {
        const t = new Date(h.time).getTime();
        if (t >= srMs && t < ssMs) daylightSet.add(i);
      });
    }
  }

  const isNewDay  = (i: number) => i === 0 || hours[i].time.slice(0, 10) !== hours[i - 1].time.slice(0, 10);
  const isSunrise = (i: number) => i > 0 && !daylightSet.has(i - 1) && daylightSet.has(i) && !isNewDay(i);
  const isSunset  = (i: number) => i > 0 && daylightSet.has(i - 1) && !daylightSet.has(i);
  const showLabel = (i: number) => isNewDay(i) || isSunrise(i) || isSunset(i);

  function transitionLabel(i: number): string {
    const date = formatDayLabel(hours[i].time);
    if (isSunrise(i)) return `▲ ${date}`;
    if (isSunset(i))  return `▼ ${date}`;
    return date;
  }

  return (
    <div ref={scrollRef} style={{ overflowX: "auto", backgroundColor: "#282828" }}>
      <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: ALT_W + hours.length * COL_W }}>
        <thead>
          <tr>
            <th style={{
              width: ALT_W, minWidth: ALT_W, position: "sticky", left: 0,
              backgroundColor: "#282828", zIndex: 2,
            }} />
            {hours.map((hour, i) => {
              const isSelected = i === selectedHourIndex;
              const isDay = daylightSet.has(i);
              const newDay = isNewDay(i);
              const hasLabel = showLabel(i);
              const borderLeft = newDay
                ? "3px solid #7c6f64"
                : hasLabel ? "1px solid #504945" : "none";
              return (
                <th
                  key={hour.time}
                  onClick={() => onSelectHour(i)}
                  style={{
                    width: COL_W, padding: "6px 0 4px", cursor: "pointer",
                    backgroundColor: isDay ? "rgba(255,190,40,0.05)" : "transparent",
                    borderLeft,
                    borderTop: isSelected ? "2px solid #83a598" : "2px solid transparent",
                    verticalAlign: "bottom", userSelect: "none",
                    position: "relative",
                  }}
                >
                  {hasLabel && (
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0,
                      fontSize: 9, color: "#7c6f64", textTransform: "uppercase",
                      letterSpacing: "0.06em", textAlign: "center", paddingTop: 2,
                      whiteSpace: "nowrap", overflow: "hidden",
                    }}>
                      {transitionLabel(i)}
                    </div>
                  )}
                  <div style={{
                    fontSize: 12, textAlign: "center", paddingTop: hasLabel ? 12 : 0,
                    color: isSelected ? "#ebdbb2" : "#a89984",
                    fontWeight: isSelected ? 600 : 400,
                  }}>
                    {formatHour(hour.time)}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {altitudeLevels.map((ft) => (
            <tr key={ft} style={{ borderTop: "1px solid #3c3836" }}>
              <td style={{
                position: "sticky", left: 0, backgroundColor: "#282828", zIndex: 1,
                fontSize: 12, color: "#7c6f64", padding: "0 8px 0 4px",
                textAlign: "right", whiteSpace: "nowrap", width: ALT_W,
              }}>
                {altLabel(ft)}
              </td>
              {hours.map((hour, i) => {
                const level = findClosestLevel(hour.levels, ft);
                const rating = level ? rateCondition(level.speedMph) : "good";
                const isSelected = i === selectedHourIndex;
                const isDay = daylightSet.has(i);
                const newDay = isNewDay(i);
                const hasLabel = showLabel(i);
                const borderLeft = newDay
                  ? "3px solid #7c6f64"
                  : hasLabel ? "1px solid #504945" : "none";
                return (
                  <td
                    key={hour.time}
                    onClick={() => onSelectHour(i)}
                    style={{
                      width: COL_W, padding: "2px 1px", cursor: "pointer",
                      textAlign: "center",
                      backgroundColor: isDay ? "rgba(255,190,40,0.05)" : "transparent",
                      borderLeft,
                    }}
                  >
                    {level && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, height: isSelected ? 38 : 28 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <WindArrow directionDeg={level.directionDeg} speedMph={level.speedMph} rating={rating} color={SPEED_COLORS[rating]} size={15} />
                          <span style={{
                            fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                            color: SPEED_COLORS[rating],
                          }}>
                            {Math.round(level.speedMph)}
                          </span>
                        </div>
                        {isSelected && (
                          <span style={{ fontSize: 10, color: "#a89984", fontVariantNumeric: "tabular-nums" }}>
                            {level.tempF}°F
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
