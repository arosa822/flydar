"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HourScrubber } from "@/components/HourScrubber/HourScrubber";
import { WindGrid } from "@/components/WindGrid/WindGrid";
import { useForecast } from "@/lib/hooks/useForecast";
import { addFavorite, removeFavorite, isFavorite, makeFavoriteId } from "@/lib/storage/favorites";
import type { GeoLocation, HourlyForecast } from "@/types/weather";

function ConditionPills({ hour }: { hour: HourlyForecast }) {
  const pills = [
    { label: "Gusts",       value: `${Math.round(hour.surface.gustMph)} mph` },
    { label: "Cloud cover", value: `${Math.round(hour.surface.cloudCoverPct)}%` },
    ...(hour.surface.cloudBaseFt
      ? [{ label: "Cloud base", value: `~${hour.surface.cloudBaseFt.toLocaleString()} ft` }]
      : []),
    { label: "CAPE", value: String(Math.round(hour.surface.cape)) },
    { label: "CIN",  value: String(Math.round(hour.surface.cin))  },
  ];
  return (
    <div style={{ display: "flex", gap: 8, padding: "10px 12px", flexWrap: "wrap", borderBottom: "1px solid #3c3836" }}>
      {pills.map(({ label, value }) => (
        <div key={label} style={{
          display: "flex", alignItems: "center", gap: 6,
          borderRadius: 99, padding: "4px 12px",
          backgroundColor: "#3c3836", fontSize: 12,
        }}>
          <span style={{ color: "#a89984" }}>{label}</span>
          <span style={{ color: "#ebdbb2", fontWeight: 600 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function formatHeaderDateTime(isoTime: string): string {
  const date = new Date(isoTime);
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const timeStr = h === 0 ? "12:00 am" : h === 12 ? "12:00 pm" : h < 12 ? `${h}:00 am` : `${h - 12}:00 pm`;
  return `${day} ${m}/${d} · ${timeStr}`;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LocationPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lon = parseFloat(searchParams.get("lon") ?? "0");
  const name = searchParams.get("name") ?? decodeURIComponent(id);
  const selectedDate = searchParams.get("date") ?? null;

  const location: GeoLocation = { name, lat, lon, elevationM: 0 };

  const { data, isLoading, isError } = useForecast(location);
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);
  const [favorited, setFavorited] = useState(false);

  const favoriteId = makeFavoriteId(lat, lon);

  useEffect(() => {
    setFavorited(isFavorite(favoriteId));
  }, [favoriteId]);

  useEffect(() => {
    if (!data) return;
    if (selectedDate) {
      const sunDay = data.sunTimes.find((s) => s.date === selectedDate);
      const startMs = sunDay ? new Date(sunDay.sunrise).getTime() : new Date(selectedDate + "T06:00:00").getTime();
      const idx = data.hours.findIndex((h) => new Date(h.time).getTime() >= startMs);
      setSelectedHourIndex(idx >= 0 ? idx : 0);
    } else {
      const now = Date.now();
      const idx = data.hours.findIndex((h) => new Date(h.time).getTime() >= now);
      setSelectedHourIndex(idx >= 0 ? idx : 0);
    }
  }, [data, selectedDate]);

  function toggleFavorite() {
    if (favorited) {
      removeFavorite(favoriteId);
      setFavorited(false);
    } else {
      addFavorite({ id: favoriteId, name, lat, lon });
      setFavorited(true);
    }
  }

  const selectedHour = data?.hours[selectedHourIndex];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#282828" }}>
      {/* Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        backgroundColor: "#3c3836",
        borderBottom: "1px solid #504945",
      }}>
        <button
          onClick={() => router.back()}
          aria-label="Back"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#83a598", padding: 4, lineHeight: 0 }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontWeight: 600, fontSize: 16, color: "#ebdbb2", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </h1>
          {selectedHour && (
            <p style={{ margin: 0, fontSize: 12, color: "#a89984" }}>
              {formatHeaderDateTime(selectedHour.time)}
            </p>
          )}
        </div>

        <button
          onClick={toggleFavorite}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: favorited ? "#fb4934" : "#7c6f64", padding: 4, lineHeight: 0 }}
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {isLoading && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "2px solid #83a598", borderTopColor: "transparent",
                animation: "spin 0.7s linear infinite",
                margin: "0 auto 12px",
              }} />
              <p style={{ fontSize: 14, color: "#a89984", margin: 0 }}>Loading forecast…</p>
            </div>
          </div>
        )}

        {isError && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px", textAlign: "center" }}>
            <div>
              <p style={{ color: "#fb4934", marginBottom: 8 }}>Failed to load forecast</p>
              <p style={{ fontSize: 14, color: "#a89984", margin: 0 }}>Check your connection and try again</p>
            </div>
          </div>
        )}

        {data && selectedHour && (
          <>
            <ConditionPills hour={selectedHour} />
            <div style={{ flex: 1, overflowY: "auto" }}>
              <WindGrid
                hours={data.hours}
                selectedHourIndex={selectedHourIndex}
                onSelectHour={setSelectedHourIndex}
                sunTimes={data.sunTimes}
              />
            </div>
            <HourScrubber
              hours={data.hours}
              selectedIndex={selectedHourIndex}
              onSelect={setSelectedHourIndex}
              sunTimes={data.sunTimes}
            />
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
