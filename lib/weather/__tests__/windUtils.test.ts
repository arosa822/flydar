import { describe, it, expect } from "vitest";
import {
  degreesToCardinal,
  formatDirection,
  msToMph,
  kmhToMph,
  celsiusToFahrenheit,
} from "../windUtils";

describe("degreesToCardinal", () => {
  it("converts 0° to N", () => expect(degreesToCardinal(0)).toBe("N"));
  it("converts 360° to N", () => expect(degreesToCardinal(360)).toBe("N"));
  it("converts 90° to E", () => expect(degreesToCardinal(90)).toBe("E"));
  it("converts 180° to S", () => expect(degreesToCardinal(180)).toBe("S"));
  it("converts 270° to W", () => expect(degreesToCardinal(270)).toBe("W"));
  it("converts 132° to SE", () => expect(degreesToCardinal(132)).toBe("SE"));
  it("handles negative degrees", () => expect(degreesToCardinal(-90)).toBe("W"));
});

describe("formatDirection", () => {
  it("formats direction with cardinal and degrees", () => {
    expect(formatDirection(132)).toBe("SE (132°)");
  });
});

describe("msToMph", () => {
  it("converts 0 m/s to 0 mph", () => expect(msToMph(0)).toBe(0));
  it("converts 10 m/s to ~22 mph", () => {
    expect(msToMph(10)).toBeCloseTo(22.4, 0);
  });
  it("converts 4.47 m/s to ~10 mph", () => {
    expect(msToMph(4.47)).toBeCloseTo(10, 0);
  });
});

describe("kmhToMph", () => {
  it("converts 16 km/h to ~10 mph", () => {
    expect(kmhToMph(16)).toBeCloseTo(10, 0);
  });
});

describe("celsiusToFahrenheit", () => {
  it("converts 0°C to 32°F", () => expect(celsiusToFahrenheit(0)).toBe(32));
  it("converts 100°C to 212°F", () => expect(celsiusToFahrenheit(100)).toBe(212));
  it("converts -40°C to -40°F", () => expect(celsiusToFahrenheit(-40)).toBe(-40));
});
