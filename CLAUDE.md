# NextPick — Development Guidelines

> **Purpose:** Standard development rules and best practices
> **Stack:** Next.js 15, TypeScript strict, Tailwind CSS, Redux Toolkit, Supabase, TMDb API, OMDb API, NextAuth.js

---

## Critical Rules

### 1. No AI Attribution — Absolute
- Never mention AI, Claude, or any AI assistant in commit messages, code comments, or documentation
- No `Co-Authored-By` lines of any kind in commits
- Git history must read as human-authored at every line — no exceptions

### 2. Always Read First
- Read the relevant file before editing it
- Check `src/types/index.ts` before defining any new interface
- Check `src/services/tmdb.ts` and `src/services/omdb.ts` before writing any API call
- Check `src/lib/database.ts` and the Supabase schema before writing any DB query

### 3. Zero Hallucination
- Never use a component, prop, type, function, or import without confirming it exists in the file
- Never call a TMDb/OMDb endpoint without verifying the exact path and parameter names
- Never reference a Supabase table column without confirming its exact name in the schema
- Never reference a Tailwind class that is not in `globals.css` or the standard Tailwind palette
- When in doubt: read the file first, then write the code

### 4. Plan Before Executing
- State the full implementation plan before writing any code or modifying any file
- Get explicit approval before proceeding
- If scope changes mid-implementation, stop and re-plan

### 5. Production-Grade Clean Code
- No hacks, no shortcuts, no commented-out code, no dead code
- No bloating — do not add dependencies, abstractions, or utilities unless directly required
- No over-engineering — solve only what is asked, nothing more
- No `any` types — use exact interfaces from `src/types/index.ts` or define a precise local one
- No `console.log` left in production code — only `console.error` in API routes
- Every function does one thing

### 6. AI Temperature — Precision First
- **Development approach:** Claude must be precision-first and deterministic — follow existing patterns exactly, no creative liberties, no unsolicited refactoring or improvements beyond what is asked
- **LLM calls in this codebase:** None currently. If ever added: structured output → `temperature: 0`, creative → `temperature: 0.7` max
- Never exceed `temperature: 0.7` in any LLM call

---

## Project Structure

```
nextpick-app/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── movies/         # Movie browsing and detail pages
│   │   ├── anime/          # Anime section
│   │   ├── kdrama/         # K-Drama section
│   │   ├── games/          # Games section
│   │   ├── search/         # Search page
│   │   ├── watchlist/      # User watchlist
│   │   ├── auth/           # Auth pages
│   │   ├── portal/         # Admin/user portal
│   │   ├── api/            # API routes
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Tailwind base + CSS variables
│   ├── components/         # Reusable React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── store.ts        # Redux store
│   │   ├── hooks.ts        # Typed Redux hooks (useAppDispatch, useAppSelector)
│   │   ├── slices/         # Redux slices (feature state)
│   │   ├── supabase.ts     # Supabase client
│   │   └── database.ts     # DB query utilities
│   ├── services/
│   │   ├── tmdb.ts         # TMDb API service
│   │   └── omdb.ts         # OMDb API service
│   ├── types/
│   │   └── index.ts        # ALL TypeScript interfaces live here
│   └── middleware.ts       # Next.js middleware (auth protection)
└── CLAUDE.md
```

---

## Naming Conventions

| Context | Convention | Example |
|---------|------------|---------|
| TypeScript/JS variables | camelCase | `movieId`, `watchlistItem` |
| React components | PascalCase | `MovieCard`, `WatchlistModal` |
| CSS classes | Tailwind utilities | `bg-[#141414]`, `text-[#E50914]` |
| API routes | kebab-case | `/api/watchlist/add-item` |
| File names (components) | PascalCase | `MovieCard.tsx` |
| File names (utilities/services) | camelCase | `tmdb.ts`, `database.ts` |
| Redux slices | camelCase | `watchlistSlice`, `userSlice` |
| Supabase table columns | snake_case | `user_id`, `created_at`, `movie_id` |

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit (`src/lib/store.ts`, `src/lib/slices/`)
- **Database:** Supabase (PostgreSQL)
- **External APIs:** TMDb (primary), OMDb (metadata fallback)
- **Authentication:** NextAuth.js
- **Deployment:** Vercel

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Netflix red | `#E50914` | Primary actions, highlights |
| Dark background | `#141414` | Main background |
| Card background | `#1f1f1f` | Cards, modals |
| Text primary | `#ffffff` | Headlines |
| Text secondary | `#b3b3b3` | Subtitles, metadata |

Use `bg-[#141414]` etc. via Tailwind arbitrary values — never hardcode inline styles.

---

## Component Patterns

### Server vs Client
- All components are **Server Components by default**
- Add `'use client'` only when the component uses `useState`, `useEffect`, Redux hooks, event handlers, or browser APIs
- Never add `'use client'` to a component that does not need it

### Props
- Always define a local `interface Props` at the top of the file — never inline, never `any`

### Redux usage
- Always use typed hooks: `useAppDispatch` and `useAppSelector` from `src/lib/hooks.ts`
- Never import raw `useDispatch`/`useSelector` from react-redux directly

---

## Project-Specific Rules

### Conditional Rendering — MANDATORY
Always use safe conditional rendering patterns to prevent `0` being rendered as content.

```tsx
// WRONG — renders "0" when rating is 0
{movie.rating && movie.rating > 0 && <div>Rating: {movie.rating}/5</div>}

// CORRECT — always use ternary or explicit null
{movie.rating && movie.rating > 0 ? <div>Rating: {movie.rating}/5</div> : null}
```

### Property Name Verification — MANDATORY
Before writing integration code, always cross-check:
1. TypeScript interface in `src/types/index.ts`
2. API service parameter names in `src/services/`
3. Supabase column names in the actual schema
4. Form field names in the component

```tsx
// WRONG — service expects 'year', form sends 'releaseDate'
await tmdbService.search({ releaseDate: formData.year })

// CORRECT — read the interface first, then map
await tmdbService.search({ year: parseInt(formData.year) })
```

---

## API Routes

- Every API route lives at `src/app/api/[route-name]/route.ts`
- Protect routes via `middleware.ts` — do not duplicate auth checks per route where middleware already covers it
- Always return typed responses — no untyped `Response.json({})`
- Use `console.error('[route-name] error:', error)` in catch blocks — never expose raw errors to the client

---

## Database Rules

- All DB queries go through `src/lib/database.ts` or Supabase client from `src/lib/supabase.ts`
- Never write raw SQL strings unless using Supabase's `.rpc()` for stored procedures
- Always use column names exactly as defined in the Supabase schema (snake_case)
- Never expose the Supabase service key to the client — server-side only

---

## Git Workflow

```
feat(movies): add genre filter to search page
fix(watchlist): correct rating update on re-watch
refactor(auth): simplify session handling in middleware
```

- No mention of AI, Claude, or any AI tool in any commit message
- No `Co-Authored-By` lines of any kind

---

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint check
npm run type-check # TypeScript check (tsc --noEmit)
```
