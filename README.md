# coleman.stoltze.family

Personal site and resume, with a "Digital Advocate" — an AI agent that answers
questions about my work using only the content in this repo.

- **`/`** — landing page and chat interface
- **`/resume`** — resume, styled for screen and for print/PDF
- **`/api/chat`** — the only server-rendered route; everything else is static

## Stack

| Piece          | Choice                                                                              |
| -------------- | ----------------------------------------------------------------------------------- |
| Framework      | [Astro 7](https://astro.build) (static output, one server route)                    |
| Interactive UI | [Svelte 5](https://svelte.dev) (runes)                                              |
| Styling        | [Tailwind 4](https://tailwindcss.com) (CSS-first config in `src/styles/global.css`) |
| Agent          | [Vercel AI SDK 7](https://sdk.vercel.ai) + Google Gemini                            |
| Hosting        | [Cloudflare Workers](https://workers.cloudflare.com)                                |
| Tests          | Vitest (unit) + Playwright (end-to-end)                                             |

## Getting started

```sh
npm install
cp .env.example .env     # then paste in a Google AI Studio key
npm run dev              # http://localhost:4321
```

The chat needs `GOOGLE_GENERATIVE_AI_API_KEY`. Without it the site still builds
and runs; `/api/chat` returns 503 and the UI shows an error.

On NixOS, `direnv allow` loads the dev shell from `flake.nix`, which also wires
up Playwright's browsers.

## Commands

| Command            | What it does                                                 |
| ------------------ | ------------------------------------------------------------ |
| `npm run dev`      | Dev server at :4321                                          |
| `npm run build`    | Production build to `dist/`                                  |
| `npm run preview`  | Serve the built Worker locally via wrangler                  |
| `npm run check`    | Generate Worker types, then typecheck Astro and Svelte       |
| `npm test`         | Unit tests                                                   |
| `npm run test:e2e` | End-to-end tests                                             |
| `npm run format`   | Format with Prettier                                         |
| `npm run verify`   | Everything CI runs, in order                                 |
| `npm run deploy`   | Build and deploy to Cloudflare                               |
| `npm run types`    | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc` |

## Adding to the agent's knowledge

The agent only knows what is in `src/content/` and `src/data/profile.json`.
Adding a markdown file is all it takes — there is no code to change and no index
to rebuild. See **[docs/content-authoring.md](docs/content-authoring.md)**.

## Further reading

- **[docs/architecture.md](docs/architecture.md)** — how the pieces fit, and why
- **[docs/deployment.md](docs/deployment.md)** — first-time Cloudflare setup and ongoing deploys
- **[docs/content-authoring.md](docs/content-authoring.md)** — how to write content the agent uses
