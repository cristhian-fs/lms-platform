# lms-platform

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Elysia, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Elysia** - Type-safe, high-performance framework
- **REST API** - Layered routes → services → repositories
- **HLS Video Streaming** - Serve locally stored `.m3u8` playlists
- **Node.js** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Biome** - Linting and formatting
- **Turborepo** - Optimized monorepo build system

## API Reference

Base URL: `http://localhost:3000`

Auth legend: `—` public · `session` optional session · `protected` requires login

### Auth & Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `*` | `/api/auth/*` | — | Better Auth handler (sign-in, sign-up, session, OAuth…) |
| `GET` | `/api/health` | — | Returns `"OK"` |
| `GET` | `/api/me` | protected | Current user info |

### Courses

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/courses` | — | List all published courses |
| `GET` | `/api/courses/:courseId` | — | Course detail with modules and lessons (accepts slug or id) |
| `POST` | `/api/courses` | protected | Create a course |
| `PATCH` | `/api/courses/:id` | protected | Update course fields |
| `DELETE` | `/api/courses/:id` | protected | Delete course |
| `POST` | `/api/courses/:id/publish` | protected | Toggle `isPublished` |

### Modules

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/courses/:courseId/modules` | protected | Create a module — body: `{ title, order }` |
| `PATCH` | `/api/modules/:id` | protected | Update title or order |
| `DELETE` | `/api/modules/:id` | protected | Delete module (cascades to lessons) |

### Lessons

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/lessons/:id` | protected | Get lesson. Returns `403` if not enrolled and not a preview |
| `POST` | `/api/modules/:moduleId/lessons` | protected | Create a lesson — set `videoUrl` to the filesystem path of `playlist.m3u8` |
| `PATCH` | `/api/lessons/:id` | protected | Update lesson fields |
| `DELETE` | `/api/lessons/:id` | protected | Delete lesson |

### Video Streaming (HLS)

Videos are pre-processed HLS files stored on the server filesystem. `lessons.videoUrl` holds the absolute path to the `playlist.m3u8` file. Segment `.ts` files must live in the same directory.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/stream/:lessonId/playlist.m3u8` | protected | Serves the HLS playlist with segment URLs rewritten to the API |
| `GET` | `/api/stream/:lessonId/:segment` | protected | Serves an individual `.ts` or `.m4s` segment |

Access rule: user must be enrolled (non-dropped), or `lessons.isPreview = true`.

### Enrollments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/enrollments` | protected | List current user's enrollments (includes course info) |
| `POST` | `/api/enrollments` | protected | Enroll — body: `{ courseId }` |
| `DELETE` | `/api/enrollments/:courseId` | protected | Drop enrollment (sets status to `"dropped"`) |

### Progress

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/progress/:lessonId` | protected | Upsert lesson progress — body: `{ watchedSeconds, completed? }`. Recalculates `enrollments.progressPct` |
| `GET` | `/api/progress/:courseId` | protected | Full course progress: per-lesson completion + overall `progressPct` |

### Ratings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/courses/:courseId/ratings` | — | List ratings for a course |
| `POST` | `/api/courses/:courseId/ratings` | protected | Rate a course — body: `{ rating: 1-5, comment? }`. Must be enrolled |
| `PATCH` | `/api/courses/:courseId/ratings` | protected | Update own rating |
| `DELETE` | `/api/courses/:courseId/ratings` | protected | Delete own rating |

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
pnpm run db:push
```

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@lms-platform/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Git Hooks and Formatting

- Format and lint fix: `pnpm run check`

## Project Structure

```
lms-platform/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Elysia, TRPC)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:server`: Start only the server
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run db:push`: Push schema changes to database
- `pnpm run db:generate`: Generate database client/types
- `pnpm run db:migrate`: Run database migrations
- `pnpm run db:studio`: Open database studio UI
- `pnpm run check`: Run Biome formatting and linting
