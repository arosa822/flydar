# Flydar

Winds aloft forecast app for PPG (powered paragliding) and ultralight pilots.

See wind speed and direction at every altitude — from surface to 10,000 ft — across a 6-day hourly forecast. Search any location, save your flying sites, and check flyability at a glance.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

---

## Features

- **Wind grid** — hourly columns × altitude rows, color-coded by flyability (good / marginal / bad)
- **Directional arrows** — SVG arrows show wind direction at each altitude level
- **Daylight shading** — sunrise/sunset tinting across the full forecast timeline
- **5-day condition bars** — per-saved-location flyability outlook; click a day to jump to that date at sunrise
- **Saved locations** — favorites stored locally, shown on the home screen
- **Responsive** — works at 375px mobile and full desktop widths

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query (30-min stale time) |
| Wind visualization | Custom SVG arrows |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel |

## Data Source

[Open-Meteo](https://open-meteo.com/) — free, no API key required, HRRR model.

- Surface levels: 10 m, 80 m, 120 m, 180 m AGL
- Pressure levels: 975, 950, 925, 900, 850, 800, 750 hPa → converted to AGL feet using standard atmosphere + site elevation

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run test     # Vitest unit tests
npm run build    # Production build
npm run lint     # ESLint
```

## Deploying to a Server with Nginx

These steps assume a Linux server with Docker and Nginx installed, serving another app at port 3000 on `/`.

**1. Install Docker**
```bash
curl -fsSL https://get.docker.com | sh
```

**2. Clone and build**
```bash
git clone git@github.com:arosa822/flydar.git
cd flydar
docker build --build-arg NEXT_PUBLIC_BASE_PATH=/flydar -t flydar .
docker run -d --restart unless-stopped -p 3001:3001 flydar
```

**3. Add the Nginx location block**

Inside your existing `server {}` block, add:

```nginx
location /flydar {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

**4. Reload Nginx**
```bash
sudo nginx -t && sudo systemctl reload nginx
```

The app will be available at `yourdomain.com/flydar`.

**Updating**
```bash
cd flydar && git pull
docker build --build-arg NEXT_PUBLIC_BASE_PATH=/flydar -t flydar .
docker rm -f $(docker ps -q --filter ancestor=flydar)
docker run -d --restart unless-stopped -p 3001:3001 flydar
```

---

## Project Structure

```
src/
  app/                        # Next.js App Router pages
  components/
    WindGrid/                 # Multi-hour × altitude grid
    WindArrow/                # SVG directional arrow
    ConditionBar/             # 5-day flyability bars
    HourScrubber/             # Timeline slider with daylight gradient
    LocationSearch/           # City / zip geocoding search
    TabularView/              # Single-hour detail table
  lib/
    api/
      openmeteo.ts            # Open-Meteo fetch + types
      geocoding.ts            # City/zip → lat/lon
    weather/
      altitudeConversion.ts   # hPa → AGL feet
      conditionRating.ts      # Flyability rating logic
      windUtils.ts            # Unit conversions, cardinal directions
    storage/
      favorites.ts            # localStorage saved locations
  types/
    weather.ts                # Shared TypeScript interfaces
```

## License

MIT
