import type { HourlyForecast } from "@/types/weather";
import { rateCondition } from "@/lib/weather/conditionRating";
import { WindArrow } from "@/components/WindArrow/WindArrow";

const SPEED_COLORS = { good: "#b8bb26", marginal: "#fabd2f", bad: "#fb4934" };
const SPEED_BG    = { good: "rgba(184,187,38,0.10)", marginal: "rgba(250,189,47,0.10)", bad: "rgba(251,73,52,0.10)" };

export function TabularView({ hour }: { hour: HourlyForecast }) {
  const sortedLevels = [...hour.levels].sort((a, b) => b.altitudeFt - a.altitudeFt);

  const pills = [
    { label: "Gusts",       value: `${Math.round(hour.surface.gustMph)} mph` },
    { label: "Cloud cover", value: `${Math.round(hour.surface.cloudCoverPct)}%` },
    ...(hour.surface.cloudBaseFt
      ? [{ label: "Cloud base", value: `~${hour.surface.cloudBaseFt.toLocaleString()} ft` }]
      : []),
    { label: "CAPE", value: String(Math.round(hour.surface.cape)) },
    { label: "CIN",  value: String(Math.round(hour.surface.cin))  },
  ];

  return (
    <div style={{ backgroundColor: "#282828", overflowX: "auto" }}>

      {/* Conditions pills */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", flexWrap: "wrap" }}>
        {pills.map(({ label, value }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 6,
            borderRadius: 99, padding: "4px 12px",
            backgroundColor: "#3c3836", fontSize: 12,
          }}>
            <span style={{ color: "#a89984" }}>{label}</span>
            <span style={{ color: "#ebdbb2", fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 80px 130px 110px",
        padding: "6px 16px",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#7c6f64",
        borderBottom: "1px solid #3c3836",
      }}>
        <span>Altitude</span>
        <span>Temp</span>
        <span>Direction</span>
        <span>Speed</span>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", padding: "8px 8px", gap: 3 }}>
        {sortedLevels.map((level, i) => {
          const rating   = rateCondition(level.speedMph);
          const altLabel = level.altitudeFt <= 50 ? "Surface" : `${level.altitudeFt.toLocaleString()} ft`;

          return (
            <div key={level.altitudeFt} style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 130px 110px",
              alignItems: "center",
              borderRadius: 10,
              padding: "9px 8px",
              backgroundColor: i % 2 === 0 ? "#2e2b27" : "transparent",
            }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#d5c4a1" }}>{altLabel}</span>

              <span style={{ fontSize: 14, color: "#a89984" }}>{level.tempF}°F</span>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <WindArrow directionDeg={level.directionDeg} speedMph={level.speedMph} rating={rating} size={18} />
                <span style={{ fontSize: 11, color: "#665c54" }}>{Math.round(level.directionDeg)}°</span>
              </div>

              <div>
                <span style={{
                  display: "inline-block",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: SPEED_COLORS[rating],
                  backgroundColor: SPEED_BG[rating],
                }}>
                  {Math.round(level.speedMph)} mph
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
