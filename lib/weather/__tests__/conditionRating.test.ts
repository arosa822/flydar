import { describe, it, expect } from "vitest";
import { rateCondition, rateHoursCondition, rateDayConditions } from "../conditionRating";
import type { HourlyForecast } from "@/types/weather";

describe("rateCondition", () => {
  it("rates < 10 mph as good", () => expect(rateCondition(5)).toBe("good"));
  it("rates exactly 10 mph as marginal", () => expect(rateCondition(10)).toBe("marginal"));
  it("rates 15 mph as marginal", () => expect(rateCondition(15)).toBe("marginal"));
  it("rates exactly 18 mph as marginal", () => expect(rateCondition(18)).toBe("marginal"));
  it("rates > 18 mph as bad", () => expect(rateCondition(20)).toBe("bad"));
  it("rates 0 mph as good", () => expect(rateCondition(0)).toBe("good"));
});

function makeHour(timeStr: string, speedMph: number): HourlyForecast {
  return {
    time: timeStr,
    levels: [{ altitudeFt: 33, speedMph, directionDeg: 180, tempF: 60 }],
    surface: {
      gustMph: speedMph + 5,
      cloudCoverPct: 20,
      precipMm: 0,
      cape: 0,
      cin: 0,
      cloudBaseFt: 3000,
    },
  };
}

describe("rateHoursCondition", () => {
  it("returns good when all flyable hours are calm", () => {
    const hours = [
      makeHour("2025-01-01T08:00:00", 5),
      makeHour("2025-01-01T12:00:00", 7),
    ];
    expect(rateHoursCondition(hours)).toBe("good");
  });

  it("returns bad when any flyable hour has bad conditions", () => {
    const hours = [
      makeHour("2025-01-01T08:00:00", 5),
      makeHour("2025-01-01T14:00:00", 25),
    ];
    expect(rateHoursCondition(hours)).toBe("bad");
  });

  it("ignores non-flyable hours (before 6am and after 8pm)", () => {
    const hours = [
      makeHour("2025-01-01T03:00:00", 30), // 3am — ignored
      makeHour("2025-01-01T08:00:00", 5),
    ];
    expect(rateHoursCondition(hours)).toBe("good");
  });

  it("returns bad with empty hours", () => {
    expect(rateHoursCondition([])).toBe("bad");
  });
});

describe("rateDayConditions", () => {
  it("groups hours by day and returns up to 4 days", () => {
    const hours: HourlyForecast[] = [
      makeHour("2025-01-01T10:00:00", 5),
      makeHour("2025-01-02T10:00:00", 5),
      makeHour("2025-01-03T10:00:00", 20),
      makeHour("2025-01-04T10:00:00", 5),
      makeHour("2025-01-05T10:00:00", 5),
    ];
    const result = rateDayConditions(hours);
    expect(result).toHaveLength(4);
    expect(result[2].rating).toBe("bad");
  });

  it("includes a dayLabel and date for each entry", () => {
    const hours = [makeHour("2025-01-01T10:00:00", 5)];
    const result = rateDayConditions(hours);
    expect(result[0].date).toBe("2025-01-01");
    expect(typeof result[0].dayLabel).toBe("string");
  });
});
