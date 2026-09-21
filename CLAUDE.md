# CLAUDE.md

Personal site for Coleman Stoltze: an Astro 7 static site plus one Cloudflare
Worker route (`/api/chat`) backing an AI agent that answers questions about his
work. Read [docs/architecture.md](docs/architecture.md) before changing anything
structural.

## Commands

```sh
npm run dev      # dev server, :4321
npm run check    # regenerates Worker types, then typechecks
npm test         # unit tests (vitest)
npm run test:e2e # end-to-end (playwright)
npm run verify   # everything CI runs
```

## Traps

These are all things that fail _silently_ or with a misleading error. Each cost
real time to diagnose.

- **Never read secrets from `import.meta.env`.** Vite inlines it at transform
  time, baking the key into the built bundle. Use
  `import { env } from 'cloudflare:workers'`. `locals.runtime.env` was removed by
  the Cloudflare adapter and does not work either. Verify with:
  `npm run build && grep -r "<the key>" dist/client`
- **Do not add `.astro` or `worker-configuration.d.ts` to `tsconfig.json`'s
  `exclude`.** `exclude` filters `include`, so doing so quietly degrades
  `getCollection()` and `env` to `any` with no error. This was the pre-existing
  state of the repo.
- **`worker-configuration.d.ts` is generated and gitignored.** Run
  `npm run types` after editing `wrangler.jsonc`. `npm run check` does it for you.
- **Keep one copy of Vite.** `overrides: { vite: "$vite" }` in `package.json`
  exists because two copies make the Cloudflare dev server die with
  `Missing field 'moduleType'`. Check with `npm ls vite` after touching deps.
- **Import lucide icons individually** (`lucide-svelte/icons/send`), never from
  the barrel. The package ships raw `.svelte` files; the barrel breaks esbuild's
  dep optimizer, which is also why `lucide-svelte` is in `optimizeDeps.exclude`.
- **Shiki must stay on the fine-grained bundle** (`shiki/core` + explicit lang
  imports in `src/lib/highlighter.ts`). Importing `createHighlighter` from the
  `shiki` root pulls every grammar — about 10 MB of chunks, too big for a Worker.
- **`astro dev` backgrounds itself when run by an AI agent.** Logs go to
  `.astro/dev.log`, not the terminal — read that file when the server "exits
  before becoming ready". `astro dev stop` stops it. Playwright passes
  `--ignore-lock` to keep it in the foreground.
- **Model output is rendered with `{@html}`.** `src/components/Markdown.svelte`
  escapes raw HTML deliberately. Do not remove that renderer override.
- **Resume `dates` must be `<Month> <YYYY>`.** `src/lib/dates.ts` throws on
  anything else, on purpose — a `NaN` comparator would silently scramble the
  resume order instead of failing.

## Content

The agent knows only what is in `src/content/` and `src/data/profile.json`.
Adding knowledge is adding a markdown file — no code changes. Schemas are in
`src/content.config.ts` and fail the build when violated. See
[docs/content-authoring.md](docs/content-authoring.md).

`anecdotes` and `philosophy` are agent-only and never rendered.

## Conventions

- Svelte 5 runes (`$state`, `$derived`, `$props`), not the legacy store syntax.
- Tailwind 4, configured in CSS in `src/styles/global.css` — there is no
  `tailwind.config.js`.
- Comments explain _why_, particularly where something looks odd. Most of the
  odd-looking code here is working around one of the traps above.
- Run `npm run format` before committing; CI checks formatting.
