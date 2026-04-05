/**
 * Convert pressure (hPa) to altitude in feet using the International Standard Atmosphere.
 * Accounts for site elevation so the result is AGL (Above Ground Level).
 */
export function hPaToAltitudeFt(hPa: number, siteElevationM: number = 0): number {
  // ISA: altitude in meters from sea level
  // Using hypsometric formula: h = (T0/L) * (1 - (P/P0)^(R*L/g))
  const T0 = 288.15; // K, sea-level standard temperature
  const L = 0.0065; // K/m, temperature lapse rate
  const P0 = 1013.25; // hPa, sea-level standard pressure
  const R = 287.058; // J/(kg·K), specific gas constant for dry air
  const g = 9.80665; // m/s², gravitational acceleration

  const altMsl = (T0 / L) * (1 - Math.pow(hPa / P0, (R * L) / g));
  const altAgl = altMsl - siteElevationM;

  // Round to nearest 100 ft for display
  return Math.round((altAgl * 3.28084) / 100) * 100;
}

/**
 * Map a set of standard pressure levels to their approximate AGL altitudes
 * given a site elevation in meters.
 */
export function pressureLevelAltitudesAgl(
  levels: number[],
  siteElevationM: number
): Record<number, number> {
  return Object.fromEntries(
    levels.map((hPa) => [hPa, hPaToAltitudeFt(hPa, siteElevationM)])
  );
}
