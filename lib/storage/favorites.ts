import type { FavoriteLocation } from "@/types/weather";

const STORAGE_KEY = "flydar_favorites";

export function getFavorites(): FavoriteLocation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function notifyChanged() {
  window.dispatchEvent(new CustomEvent("flydar:favorites-changed"));
}

export function addFavorite(location: FavoriteLocation): void {
  const current = getFavorites();
  if (current.some((f) => f.id === location.id)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, location]));
  notifyChanged();
}

export function removeFavorite(id: string): void {
  const current = getFavorites();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter((f) => f.id !== id)));
  notifyChanged();
}

export function renameFavorite(id: string, newName: string): void {
  const current = getFavorites();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current.map((f) => f.id === id ? { ...f, name: newName } : f)));
  notifyChanged();
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

export function makeFavoriteId(lat: number, lon: number): string {
  return `${lat.toFixed(4)}_${lon.toFixed(4)}`;
}
