import type { GeoLocation, HourlyForecast, LocationForecast, SurfaceConditions, WindLevel, DailySunTimes } from "@/types/weather";
import { hPaToAltitudeFt } from "@/lib/weather/altitudeConversion";
import { msToMph } from "@/lib/weather/windUtils";
import { celsiusToFahrenheit } from "@/lib/weather/windUtils";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

// Pressure levels to fetch (hPa) — maps to ~1,000–10,000 ft AGL
const PRESSURE_LEVELS = [975, 950, 925, 900, 850, 800, 750] as const;

function buildUrl(lat: number, lon: number): string {
  const hourly = [
    // Surface / low-altitude
    "windspeed_10m",
    "windspeed_80m",
    "windspeed_120m",
    "windspeed_180m",
    "winddirection_10m",
    "winddirection_80m",
    "winddirection_120m",
    "winddirection_180m",
    "temperature_2m",
    "dewpoint_2m",
    "windgusts_10m",
    "cloudcover",
    "precipitation",
    "cape",
    "convective_inhibition",
    "pressure_msl",
    // Pressure level wind + temp
    ...PRESSURE_LEVELS.map((p) => `windspeed_${p}hPa`),
    ...PRESSURE_LEVELS.map((p) => `winddirection_${p}hPa`),
    ...PRESSURE_LEVELS.map((p) => `temperature_${p}hPa`),
  ].join(",");

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly,
    daily: "sunrise,sunset",
    models: "best_match",
    forecast_days: "6",
    wind_speed_unit: "ms",
    temperature_unit: "celsius",
    timezone: "auto",
  });

  return `${BASE_URL}?${params.toString()}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseHours(data: any, location: GeoLocation): HourlyForecast[] {
  const h = data.hourly;
  const times: string[] = h.time;
  const elevM = location.elevationM;

  return times.map((time, i) => {
    // Surface levels (fixed AGL heights in meters → ft)
    const surfaceLevels: { altM: number; speedKey: string; dirKey: string; tempKey: string }[] = [
      { altM: 10, speedKey: "windspeed_10m", dirKey: "winddirection_10m", tempKey: "temperature_2m" },
      { altM: 80, speedKey: "windspeed_80m", dirKey: "winddirection_80m", tempKey: "temperature_2m" },
      { altM: 120, speedKey: "windspeed_120m", dirKey: "winddirection_120m", tempKey: "temperature_2m" },
      { altM: 180, speedKey: "windspeed_180m", dirKey: "winddirection_180m", tempKey: "temperature_2m" },
    ];

    const levels: WindLevel[] = surfaceLevels.map(({ altM, speedKey, dirKey, tempKey }) => ({
      altitudeFt: Math.round(altM * 3.28084),
      speedMph: msToMph(h[speedKey][i] ?? 0),
      directionDeg: h[dirKey][i] ?? 0,
      tempF: celsiusToFahrenheit(h[tempKey][i] ?? 0),
    }));

    // Pressure levels → AGL feet
    for (const hPa of PRESSURE_LEVELS) {
      const speed = h[`windspeed_${hPa}hPa`]?.[i];
      const dir = h[`winddirection_${hPa}hPa`]?.[i];
      const temp = h[`temperature_${hPa}hPa`]?.[i];
      if (speed == null || dir == null) continue;

      const altitudeFt = hPaToAltitudeFt(hPa, elevM);
      levels.push({
        altitudeFt,
        speedMph: msToMph(speed),
        directionDeg: dir,
        tempF: temp != null ? celsiusToFahrenheit(temp) : celsiusToFahrenheit(h.temperature_2m[i] ?? 0),
      });
    }

    // Sort by altitude ascending
    levels.sort((a, b) => a.altitudeFt - b.altitudeFt);

    // Estimate cloud base from dewpoint depression (LCL approximation)
    const tempC = h.temperature_2m[i] ?? 0;
    const dewC = h.dewpoint_2m[i] ?? 0;
    const depression = tempC - dewC;
    // ~400 ft per °C of dewpoint depression (approximate LCL)
    const cloudBaseFt = depression > 0 ? Math.round(depression * 400) : null;

    const surface: SurfaceConditions = {
      gustMph: msToMph(h.windgusts_10m[i] ?? 0),
      cloudCoverPct: h.cloudcover[i] ?? 0,
      precipMm: h.precipitation[i] ?? 0,
      cape: h.cape[i] ?? 0,
      cin: h.convective_inhibition[i] ?? 0,
      cloudBaseFt,
    };

    return { time, levels, surface };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSunTimes(data: any): DailySunTimes[] {
  const dates: string[] = data.daily?.time ?? [];
  const sunrises: string[] = data.daily?.sunrise ?? [];
  const sunsets: string[] = data.daily?.sunset ?? [];
  return dates.map((date, i) => ({ date, sunrise: sunrises[i], sunset: sunsets[i] }));
}

export async function fetchLocationForecast(location: GeoLocation): Promise<LocationForecast> {
  const url = buildUrl(location.lat, location.lon);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const hours = parseHours(data, location);
  const sunTimes = parseSunTimes(data);

  return {
    location,
    hours,
    sunTimes,
    fetchedAt: new Date().toISOString(),
  };
}
