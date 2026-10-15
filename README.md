# novac.dev

Andrew Novac's homepage: a prerendered SvelteKit site deployed to Netlify.

![GitHub deployments](https://img.shields.io/github/deployments/novatorem/website/Production?label=deployment)

## Developing

```bash
npm install
cp .env.example .env   # optional: add a Hardcover token for the Bookshelf
npm run dev        # local dev server
npm run lint       # prettier check + eslint
npm run check      # svelte-check (types)
npm run build      # static site in build/; fetches song previews (iTunes) and the shelf (Hardcover)
npm run preview    # serve the production build
```

Run `npm run format` before pushing; CI checks formatting rather than fixing it.

## Structure

```
src/
  app.css, app.html        design tokens (light-dark colours) and the pre-paint theme script
  env.ts                   declared environment variables (HARDCOVER_TOKEN, private and optional)
  routes/
    +layout.svelte         fonts, global CSS, analytics
    +page.svelte           the homepage: composes the sections below
    +page.server.ts        build-time data: song previews and the bookshelf, fetched in parallel
    +error.svelte          404 page
    covers/                Hardcover covers, resized to WebP at build (prerendered, never proxied live)
  lib/
    site.ts                profile and service URLs
    theme.ts               day/night light: follows the OS until the visitor picks one
    storm/storm.ts         the canvas particle "storm" that condenses words
    server/                build-time loaders: itunes.ts (song previews), hardcover.ts (bookshelf), covers.ts (cover sizes)
    components/            shared UI: Nav, LightToggle, Icon (+ icons.ts), MailDialog, SectionTitle
    sections/              homepage sections: Hero, Work, Repos, Record, SayHi (contact, portrait and credits)
      on-repeat/           music player: OnRepeat (section), Deck, Tracklist, player.svelte.ts (state)
      bookshelf/           Bookshelf (section), ReadingNow, BookList, format.ts
    data/                  content: projects, work, education, tracks (JSON)
    types/                 shared TypeScript types
static/images/             screenshots and logos; each raster carries an embedded origin note
scripts/tab-icons.mjs      redraws the static/favicon* tab icons from src/lib/logo.ts and the app.css colours
```

## Adding content

- **Project:** add an entry to `src/lib/data/projects.json` with its screenshot in `static/images/projects/`, plus the image's `width`, `height` and, for wide shots, a `focus` crop anchor.
- **Role or school:** add an entry to `work.json` or `education.json`, newest first; its logo is `static/images/experience/<short>.png`. For a one-colour brand mark, add `"tint": { "day": "#…", "night": "#…" }` and the PNG's shape is painted in those colours (Questrade uses this).
- **Song:** add `title`, `artist`, `spotifyId` and (if Apple has it) `itunesId` to `tracks.json`.
- **Bookshelf:** comes from Hardcover at build time. Create a token at https://hardcover.app/account/api, put it in `.env` as `HARDCOVER_TOKEN` (see `.env.example`), and set the same variable on your host. Without a token the section links to the Hardcover profile; with a token, a failed lookup fails the build so the last good deploy stays live.

## Daily rebuild

The shelf and song previews are fetched at build time, so `.github/workflows/rebuild.yml` rebuilds the site every day. Its header explains the setup for each host: a build hook URL as the `DEPLOY_HOOK_URL` secret (Netlify, Vercel, Cloudflare Pages, Render), or `DEPLOY_TO_PAGES=true` to build and publish on GitHub Pages. GitHub pauses scheduled workflows after 60 days without repository activity; re-enable it from the Actions tab if that happens.
