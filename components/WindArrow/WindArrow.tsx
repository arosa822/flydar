import type { ConditionRating } from "@/types/weather";

interface WindArrowProps {
  /** Wind direction in degrees (meteorological: direction wind comes FROM) */
  directionDeg: number;
  speedMph: number;
  rating: ConditionRating;
  /** Override the arrow color */
  color?: string;
  /** Size in pixels */
  size?: number;
}

const RATING_COLORS: Record<ConditionRating, string> = {
  good: "#4db6ac",
  marginal: "#ffb74d",
  bad: "#ef9a9a",
};

/**
 * Teardrop-style wind arrow. Points in the direction the wind is moving TO
 * (opposite of meteorological convention, for visual clarity).
 */
export function WindArrow({ directionDeg, speedMph, rating, color: colorProp, size = 24 }: WindArrowProps) {
  const color = colorProp ?? RATING_COLORS[rating];
  // Wind goes FROM directionDeg, so arrow points TO (directionDeg + 180)
  const rotateDeg = (directionDeg + 180) % 360;

  // Calm wind (< 1 mph) — show a dot
  if (speedMph < 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Calm wind">
        <circle cx="12" cy="12" r="4" fill={color} opacity={0.6} />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${rotateDeg}deg)` }}
      aria-label={`Wind from ${Math.round(directionDeg)}° at ${Math.round(speedMph)} mph`}
    >
      {/* Teardrop / arrow shape: wide at tail, pointed at tip (up = direction wind moves toward) */}
      <path
        d="M12 2 L17 18 Q12 15 7 18 Z"
        fill={color}
        opacity={0.9}
      />
      {/* Small tail notch */}
      <line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
