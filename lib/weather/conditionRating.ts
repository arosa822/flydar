import type { ConditionRating, HourlyForecast, DayCondition } from "@/types/weather";

/** Flyability thresholds based on surface wind speed */
const GOOD_MAX_MPH = 10;
const MARGINAL_MAX_MPH = 18;

export function rateCondition(speedMph: number): ConditionRating {
  if (speedMph < GOOD_MAX_MPH) return "good";
  if (speedMph <= MARGINAL_MAX_MPH) return "marginal";
  return "bad";
}

/** Rate a set of hours — returns the worst condition seen during flyable hours (6am–8pm) */
export function rateHoursCondition(hours: HourlyForecast[]): ConditionRating {
  const flyableHours = hours.filter((h) => {
    const hour = new Date(h.time).getHours();
    return hour >= 6 && hour <= 20;
  });

  if (flyableHours.length === 0) return "bad";

  const ratings: ConditionRating[] = flyableHours.map((h) => {
    // Use the surface wind (10m level) for condition rating
    const surface = h.levels.find((l) => l.altitudeFt <= 50);
    const speedMph = surface?.speedMph ?? h.levels[0]?.speedMph ?? 0;
    return rateCondition(speedMph);
  });

  if (ratings.includes("bad")) return "bad";
  if (ratings.includes("marginal")) return "marginal";
  return "good";
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Group hourly forecasts by day and rate each day's flyability */
export function rateDayConditions(hours: HourlyForecast[]): DayCondition[] {
  const byDay = new Map<string, HourlyForecast[]>();

  for (const hour of hours) {
    const date = hour.time.slice(0, 10); // YYYY-MM-DD
    if (!byDay.has(date)) byDay.set(date, []);
    byDay.get(date)!.push(hour);
  }

  return Array.from(byDay.entries())
    .slice(0, 5)
    .map(([date, dayHours]) => {
      const dayLabel = DAY_LABELS[new Date(date + "T12:00:00").getDay()];
      return {
        date,
        dayLabel,
        rating: rateHoursCondition(dayHours),
      };
    });
}
