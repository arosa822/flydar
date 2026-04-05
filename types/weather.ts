export type ConditionRating = "good" | "marginal" | "bad";

export interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
  /** Elevation of the location in meters above sea level */
  elevationM: number;
  region?: string;
  country?: string;
}

export interface WindLevel {
  /** Altitude in feet AGL */
  altitudeFt: number;
  /** Wind speed in mph */
  speedMph: number;
  /** Wind direction in degrees (0–360, meteorological: direction wind comes FROM) */
  directionDeg: number;
  /** Temperature in °F */
  tempF: number;
}

export interface SurfaceConditions {
  /** Surface wind gust in mph */
  gustMph: number;
  /** Total cloud cover 0–100% */
  cloudCoverPct: number;
  /** Precipitation in mm */
  precipMm: number;
  /** Convective Available Potential Energy */
  cape: number;
  /** Convective Inhibition */
  cin: number;
  /** Estimated cloud base in feet AGL (from dewpoint depression) */
  cloudBaseFt: number | null;
}

export interface HourlyForecast {
  /** UTC timestamp (ISO string) */
  time: string;
  levels: WindLevel[];
  surface: SurfaceConditions;
}

export interface DailySunTimes {
  /** YYYY-MM-DD */
  date: string;
  /** ISO datetime string */
  sunrise: string;
  /** ISO datetime string */
  sunset: string;
}

export interface LocationForecast {
  location: GeoLocation;
  /** Hourly forecasts sorted by time ascending */
  hours: HourlyForecast[];
  sunTimes: DailySunTimes[];
  /** When this data was fetched */
  fetchedAt: string;
}

export interface FavoriteLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface DayCondition {
  /** Date string YYYY-MM-DD */
  date: string;
  /** Day label e.g. "Wed" */
  dayLabel: string;
  rating: ConditionRating;
}
