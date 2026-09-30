# Moodify

Moodify is a modern music discovery and listening platform that understands how you feel. Built with React and TypeScript, Moodify features a cinematic dark mode UI, smooth glassmorphic elements, and an intelligent mood-based continuous playback engine.

## Features

- **Discover & Search**: Explore trending tracks, new releases, artists, albums, and genres.
- **MoodSense**: Describe your feeling in natural language, and let the app match the vibe.
- **VibeMatch & VibeMix**: Generates mood-aligned playlists based on your context (e.g. "rainy night driving").
- **VibeFlow**: An endless, dynamically updating queue that evolves with your current mood.
- **Library & Playlists**: Authenticate with Supabase to save albums, follow artists, sync liked songs, and build custom playlists.
- **Real Music Playback**: 30-second previews provided directly by the Deezer public API.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Framer Motion
- **State Management**: React Context / Zustand-like hooks
- **Backend / Auth**: Supabase
- **Music Data**: Deezer API

## Installation

1. Clone the repository and navigate to the project root.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase project credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Production Build

To build the project for production, run:

```bash
npm run build
```

This will run the TypeScript compiler and Vite's build process. The optimized output will be in the `dist` directory.

## Deployment Requirements

Moodify is a standard Single Page Application (SPA). It can be deployed to any static host (Vercel, Netlify, Cloudflare Pages, etc.).

**Requirements for Deployment**:
1. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your deployment dashboard.
2. Ensure your host is configured to fallback to `index.html` for client-side routing (React Router).
3. Set your build command to `npm run build` and publish directory to `dist`.

## Important Provider Limitations

Moodify uses the Deezer API to fetch music metadata and audio. For legal compliance and API restrictions, **audio playback is strictly limited to 30-second previews**. The application does not attempt to bypass these restrictions or host copyrighted audio.
