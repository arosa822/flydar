"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LocationSearch } from "@/components/LocationSearch/LocationSearch";
import { ConditionBar } from "@/components/ConditionBar/ConditionBar";
import { fetchLocationForecast } from "@/lib/api/openmeteo";
import { rateDayConditions } from "@/lib/weather/conditionRating";
import { makeFavoriteId, getFavorites, removeFavorite } from "@/lib/storage/favorites";
import type { FavoriteLocation, GeoLocation } from "@/types/weather";

function FavoriteCard({ favorite, onRemove }: { favorite: FavoriteLocation; onRemove: () => void }) {
  const router = useRouter();
  const location: GeoLocation = { name: favorite.name, lat: favorite.lat, lon: favorite.lon, elevationM: 0 };

  const { data } = useQuery({
    queryKey: ["forecast", favorite.lat, favorite.lon],
    queryFn: () => fetchLocationForecast(location),
    staleTime: 30 * 60 * 1000,
  });

  const days = data ? rateDayConditions(data.hours) : [];

  function handleClick(date?: string) {
    const id = encodeURIComponent(makeFavoriteId(favorite.lat, favorite.lon));
    const dateParam = date ? `&date=${date}` : "";
    router.push(`/location/${id}?lat=${favorite.lat}&lon=${favorite.lon}&name=${encodeURIComponent(favorite.name)}${dateParam}`);
  }

  return (
    <div
      onClick={() => handleClick()}
      style={{
        borderRadius: 16,
        padding: 16,
        backgroundColor: "#3c3836",
        border: "1px solid #504945",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontWeight: 600, fontSize: 16, color: "#ebdbb2", margin: 0 }}>{favorite.name}</h2>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Remove from favorites"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#7c6f64",
            padding: 4,
            marginTop: -4,
            marginRight: -4,
            lineHeight: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fb4934")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#7c6f64")}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {days.length > 0 ? (
        <ConditionBar days={days} onDayClick={(date) => handleClick(date)} />
      ) : (
        <div style={{ display: "flex", gap: 12 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 52, height: 10, borderRadius: 99, backgroundColor: "#504945" }} />
              <div style={{ width: 24, height: 8, borderRadius: 4, backgroundColor: "#504945" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  function handleLocationSelect(location: GeoLocation) {
    const id = encodeURIComponent(makeFavoriteId(location.lat, location.lon));
    router.push(`/location/${id}?lat=${location.lat}&lon=${location.lon}&name=${encodeURIComponent(location.name)}`);
  }

  function handleRemove(id: string) {
    removeFavorite(id);
    setFavorites(getFavorites());
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#282828" }}>
      <header style={{ padding: "32px 16px 16px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#ebdbb2", margin: "0 0 4px" }}>Flydar</h1>
        <p style={{ fontSize: 14, color: "#a89984", margin: "0 0 8px" }}>Winds aloft for PPG &amp; ultralight pilots</p>
        <p style={{ fontSize: 13, color: "#665c54", margin: "0 0 24px", lineHeight: 1.6, maxWidth: 480 }}>
          See wind speed and direction at every altitude — from surface to 10,000 ft — across a 6-day hourly forecast. Search any location, save your flying sites, and check flyability at a glance.
        </p>
        <LocationSearch onSelect={handleLocationSelect} />
      </header>

      <main style={{ padding: "0 16px 32px" }}>
        {favorites.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 64 }}>
            <svg style={{ display: "block", margin: "0 auto 8px", color: "#504945" }} width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
            <p style={{ fontSize: 14, color: "#a89984", margin: "0 0 4px" }}>Search for a location to get started</p>
            <p style={{ fontSize: 12, color: "#665c54", margin: 0 }}>Save favorites to see the 5-day outlook here</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a89984", margin: "8px 0 12px" }}>
              Saved Locations
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {favorites.map((fav) => (
                <FavoriteCard key={fav.id} favorite={fav} onRemove={() => handleRemove(fav.id)} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
