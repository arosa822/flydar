const CARDINALS = [
  "N", "NNE", "NE", "ENE",
  "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW",
  "W", "WNW", "NW", "NNW",
];

/** Convert degrees to cardinal direction string */
export function degreesToCardinal(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return CARDINALS[index];
}

/** Format direction as degrees + cardinal, e.g. "SE (132°)" */
export function formatDirection(deg: number): string {
  return `${degreesToCardinal(deg)} (${Math.round(deg)}°)`;
}

/** Convert m/s to mph */
export function msToMph(ms: number): number {
  return Math.round(ms * 2.23694 * 10) / 10;
}

/** Convert km/h to mph */
export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371 * 10) / 10;
}

/** Convert Celsius to Fahrenheit */
export function celsiusToFahrenheit(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

/** Format altitude in feet for display, e.g. "3,117 ft" */
export function formatAltitude(ft: number): string {
  return `${ft.toLocaleString()} ft`;
}

/** Format speed for display, e.g. "12 mph" */
export function formatSpeed(mph: number): string {
  return `${Math.round(mph)} mph`;
}
