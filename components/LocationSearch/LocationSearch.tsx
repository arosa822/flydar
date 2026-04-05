"use client";

import { useState, useEffect, useRef } from "react";
import { searchLocations, geoResultToLocation, type GeoSearchResult } from "@/lib/api/geocoding";
import type { GeoLocation } from "@/types/weather";

interface LocationSearchProps {
  onSelect: (location: GeoLocation) => void;
  placeholder?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function LocationSearch({ onSelect, placeholder = "Search city or zip code…" }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    searchLocations(debouncedQuery)
      .then((res) => {
        setResults(res);
        setIsOpen(res.length > 0);
      })
      .catch(() => setResults([]))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(result: GeoSearchResult) {
    onSelect(geoResultToLocation(result));
    setQuery("");
    setIsOpen(false);
    setResults([]);
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: 480 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderRadius: 14,
        padding: "10px 16px",
        backgroundColor: "#3c3836",
        border: "1px solid #504945",
      }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#a89984" strokeWidth={2} style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            fontSize: 14,
            color: "#ebdbb2",
            background: "transparent",
            border: "none",
            outline: "none",
          }}
        />
        {isLoading && (
          <div style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "2px solid #83a598",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }} />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul style={{
          position: "absolute",
          zIndex: 50,
          width: "100%",
          marginTop: 4,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          backgroundColor: "#3c3836",
          border: "1px solid #504945",
          listStyle: "none",
          padding: 0,
          margin: 0,
          marginBlockStart: 4,
        }}>
          {results.map((result) => (
            <li key={result.id}>
              <button
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 16px",
                  fontSize: 14,
                  color: "#ebdbb2",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "block",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#504945")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => handleSelect(result)}
              >
                <span style={{ fontWeight: 600 }}>{result.name}</span>
                {result.region && (
                  <span style={{ color: "#a89984", marginLeft: 4 }}>{result.region}, {result.country}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
