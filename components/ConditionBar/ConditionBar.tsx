import type { DayCondition } from "@/types/weather";

const BAR_COLORS = {
  good:     "#b8bb26",
  marginal: "#fabd2f",
  bad:      "#fb4934",
};

export function ConditionBar({ days, onDayClick }: { days: DayCondition[]; onDayClick?: (date: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {days.map((day) => (
        <div
          key={day.date}
          onClick={onDayClick ? (e) => { e.stopPropagation(); onDayClick(day.date); } : undefined}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            cursor: onDayClick ? "pointer" : undefined,
          }}
        >
          <div style={{ width: 52, height: 10, borderRadius: 99, backgroundColor: BAR_COLORS[day.rating], opacity: 0.85 }} />
          <span style={{ fontSize: 11, color: "#a89984" }}>{day.dayLabel}</span>
        </div>
      ))}
    </div>
  );
}
