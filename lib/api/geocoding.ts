import type { GeoLocation } from "@/types/weather";

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const ELEVATION_URL = "https://api.open-meteo.com/v1/elevation";

export interface GeoSearchResult {
  id: number;
  name: string;
  lat: number;
  lon: number;
  elevationM: number;
  region: string;
  country: string;
  displayName: string;
}

export async function searchLocations(query: string): Promise<GeoSearchResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    name: query.trim(),
    count: "8",
    language: "en",
    format: "json",
  });

  const res = await fetch(`${GEO_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);

  const data = await res.json();
  if (!data.results) return [];

  return data.results.map(
    (r: {
      id: number;
      name: string;
      latitude: number;
      longitude: number;
      elevation: number;
      admin1?: string;
      country?: string;
    }): GeoSearchResult => ({
      id: r.id,
      name: r.name,
      lat: r.latitude,
      lon: r.longitude,
      elevationM: r.elevation ?? 0,
      region: r.admin1 ?? "",
      country: r.country ?? "",
      displayName: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    })
  );
}

export function geoResultToLocation(result: GeoSearchResult): GeoLocation {
  return {
    name: result.displayName,
    lat: result.lat,
    lon: result.lon,
    elevationM: result.elevationM,
    region: result.region,
    country: result.country,
  };
}

/** Resolve lat/lon from a coordinate string like "35.595,-82.551" */
export async function resolveCoordinates(
  lat: number,
  lon: number
): Promise<GeoLocation> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
  });
  const res = await fetch(`${ELEVATION_URL}?${params.toString()}`);
  const data = await res.json();
  const elevationM = data.elevation?.[0] ?? 0;

  return {
    name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    lat,
    lon,
    elevationM,
  };
}
