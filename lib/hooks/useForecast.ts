import { useQuery } from "@tanstack/react-query";
import { fetchLocationForecast } from "@/lib/api/openmeteo";
import type { GeoLocation } from "@/types/weather";

export function useForecast(location: GeoLocation | null) {
  return useQuery({
    queryKey: ["forecast", location?.lat, location?.lon],
    queryFn: () => fetchLocationForecast(location!),
    enabled: location !== null,
    staleTime: 30 * 60 * 1000,
  });
}
