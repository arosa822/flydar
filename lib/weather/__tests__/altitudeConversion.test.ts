import { describe, it, expect } from "vitest";
import { hPaToAltitudeFt, pressureLevelAltitudesAgl } from "../altitudeConversion";

describe("hPaToAltitudeFt", () => {
  it("returns ~0 ft AGL at sea level pressure and 0 elevation", () => {
    // 1013.25 hPa at sea level → 0 MSL → 0 AGL
    expect(hPaToAltitudeFt(1013.25, 0)).toBeCloseTo(0, -2);
  });

  it("returns positive AGL feet for pressures below sea level", () => {
    const alt = hPaToAltitudeFt(850, 0);
    // 850 hPa is approximately 5,000 ft MSL
    expect(alt).toBeGreaterThan(4000);
    expect(alt).toBeLessThan(6000);
  });

  it("accounts for site elevation — same pressure gives less AGL at higher sites", () => {
    const seaLevel = hPaToAltitudeFt(850, 0);
    const highSite = hPaToAltitudeFt(850, 1000); // 1000m elevation site
    expect(highSite).toBeLessThan(seaLevel);
  });

  it("750 hPa is approximately 8,000–10,000 ft AGL at sea level", () => {
    const alt = hPaToAltitudeFt(750, 0);
    expect(alt).toBeGreaterThan(7000);
    expect(alt).toBeLessThan(11000);
  });
});

describe("pressureLevelAltitudesAgl", () => {
  it("returns a mapping for each pressure level", () => {
    const levels = [975, 950, 925];
    const result = pressureLevelAltitudesAgl(levels, 0);
    expect(Object.keys(result)).toHaveLength(3);
    expect(result[975]).toBeDefined();
  });

  it("altitudes increase as pressure decreases", () => {
    const result = pressureLevelAltitudesAgl([975, 950, 925, 900, 850], 0);
    expect(result[975]).toBeLessThan(result[950]);
    expect(result[950]).toBeLessThan(result[925]);
    expect(result[925]).toBeLessThan(result[900]);
    expect(result[900]).toBeLessThan(result[850]);
  });
});
