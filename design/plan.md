# Flydar — Implementation Plan

Build **Flydar**, a web application that displays winds aloft forecasts for PPG (powered paragliding) and ultralight pilots. The app is inspired by ppg.report (tabular hourly data) and Gaggle (visual wind grid + saved locations overview).

---

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Data fetching**: TanStack Query (React Query)
- **Charts/Visualization**: custom SVG or Canvas wind arrows (no heavy charting lib needed)
- **Testing**: Vitest + React Testing Library
- **Deployment target**: Vercel

---

## Data Source

Use the **Open-Meteo API** (`open-meteo.com`) — free, no API key, supports the **HRRR model** (High-Resolution Rapid Refresh). Key parameters needed:

- `windspeed_10m`, `windspeed_80m`, `windspeed_120m`, `windspeed_180m` (surface + altitude)
- `winddirection_10m`, `winddirection_80m`, etc.
- `pressure_msl`, `cloudcover`, `precipitation`, `cape`, `windgusts_10m`
- Model: `&models=hrrr_conus`
- Use **pressure level** endpoints for winds above 1,000 ft (up to ~10,000 ft AGL): levels 975, 950, 925, 900, 850, 800, 750 hPa → convert to approximate AGL using standard atmosphere * also make sure to take elevation at location into consideration

For **geocoding** (zip → lat/lon): use the Open-Meteo Geocoding API or the US Census Geocoder (free, no key).

---

## Core Features

**1. Location Search**
- Search by zip code or lat/lon coordinates
- Resolve to a place name for display
- Show search results and allow selection

**2. Wind Visualization View** (primary view, inspired by Gaggle)
- A 2D grid: **X-axis = hours** (next 12–18 hours), **Y-axis = altitude levels** (surface, 500ft, 1000ft, 2000ft, 3000ft, 5000ft, 8000ft, 10000ft AGL)
- Each cell contains an **animated or static wind arrow** (barb or teardrop) showing direction, with color encoding speed (green → yellow → red)
- Tapping/hovering a cell shows exact speed, direction, temp at that level/hour
- A timeline scrubber at the bottom to select hour; selected column highlights
- Summary row at top: wind speed, temp, direction at selected hour/altitude

**3. Tabular View** (secondary, ppg.report style)
- Toggle between visualization and columns view
- Show altitude, temp, direction, speed for the selected hour

**4. Additional Conditions Bar**
- Cloud base (estimated from dewpoint depression or lifted condensation level)
- Precipitation probability / rain indicator
- Wind gust strength at surface
- CIN/CAPE if available

**5. Saved Locations**
- Persist favorites to `localStorage`
- Locations overview list showing the next 4 days as colored condition bars (green = good, yellow = marginal, red = bad) based on surface wind speed thresholds (e.g., <10mph = good, 10–18mph = marginal, >18mph = bad for PPG)
- Tap a location to open its detailed view

---

## Architecture

```
src/
  app/                    # Next.js App Router pages
    page.tsx              # Home / saved locations list
    location/[id]/        # Detail view for a location
  components/
    WindGrid/             # 2D visualization grid (wind arrows + color)
    WindArrow/            # SVG arrow component (direction + speed)
    ConditionBar/         # Colored multi-day condition summary bar
    LocationSearch/       # Search input + results dropdown
    HourScrubber/         # Timeline/hour selector
    TabularView/          # ppg.report-style table
  lib/
    api/
      openmeteo.ts        # Fetch & type HRRR data from Open-Meteo
      geocoding.ts        # Zip → lat/lon resolution
    weather/
      altitudeConversion.ts  # hPa → AGL feet using standard atmosphere
      conditionRating.ts     # Rate conditions (good/marginal/bad)
      windUtils.ts           # Direction formatting, speed conversions
    storage/
      favorites.ts        # localStorage read/write for saved locations
  types/
    weather.ts            # Shared TypeScript interfaces
```

---

## Constraints & Quality Requirements

- All API calls must go through typed service functions in `lib/api/` — no raw fetch calls in components
- Weather data transformation (unit conversion, altitude mapping) lives in `lib/weather/` and must be unit-tested with Vitest
- Components receive pre-transformed data as props; they do not call APIs directly
- The wind grid must be responsive — work on mobile (375px) and desktop
- Favor CSS variables / Tailwind theme tokens for the color scale so it can be adjusted without touching component code
- The app must work offline for the last fetched location (cache responses in React Query with a 30-minute stale time)
- No auth required for MVP

---

## Reference UIs

- **ppg.report** (`ppg.report/35.595,-82.551`): tabular hourly columns with altitude rows, color-coded temps and speeds — good reference for the data density and color scheme
- **Gaggle app**: wind grid with arrow/teardrop icons at each altitude × hour cell, muted blue background, colored wind speed indicators; saved locations list shows a row of colored "pill" bars per day indicating flyability

---

## Build Order

1. Scaffold the Next.js + TypeScript + Tailwind project
2. Implement `openmeteo.ts` with full TypeScript types and tests
3. Build `WindArrow` and `WindGrid` as pure/presentational components with storybook-style test fixtures
4. Wire up location search → data fetch → grid display
5. Add saved locations + condition bars
6. Polish: loading skeletons, error states, mobile layout
