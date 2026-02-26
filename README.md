# Night Queue

A movie discovery web app built with Next.js. Browse popular and top-rated films, search by title, and filter by genre, year, rating, and runtime — powered by the TMDb and OMDb APIs.

## Features

- **Popular & Top-Rated** — paginated movie listings from TMDb
- **Search** — title search with live results
- **Filters** — genre, release year, minimum rating, maximum runtime, sort order
- **Movie Details** — extended info (plot, director, cast, IMDb rating) via OMDb
- **Responsive UI** — dark theme, mobile-friendly layout

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Redux Toolkit |
| Movie data | TMDb API, OMDb API |

## Getting Started

```bash
npm install
cp .env.example .env.local  # add API keys
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_TMDB_API_KEY=
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
NEXT_PUBLIC_OMDB_API_KEY=
NEXT_PUBLIC_OMDB_BASE_URL=http://www.omdbapi.com
```

API keys are free:
- TMDb: https://www.themoviedb.org/settings/api
- OMDb: https://www.omdbapi.com/apikey.aspx
