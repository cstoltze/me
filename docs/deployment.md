# Deployment

The site runs on Cloudflare Workers: static pages served from the CDN, with
`/api/chat` as the only Worker invocation.

## First-time setup

These steps run once. Everything after is `git push`.

### 1. Authenticate

```sh
npx wrangler login
```

### 2. Create the Worker and set the secret

```sh
npm run build
npx wrangler deploy
npx wrangler secret put GOOGLE_GENERATIVE_AI_API_KEY
```

The secret is set **on the Worker**, not in `wrangler.jsonc` and not in GitHub
Actions. Deploys do not touch it; it survives them. Never add it to
`wrangler.jsonc` as a `var` — that file is committed.

### 3. Point the domain at the Worker

`coleman.stoltze.family` currently resolves to GitHub Pages. In the Cloudflare
dashboard, under **Workers & Pages → coleman-stoltze-site → Settings → Domains &
Routes**, add `coleman.stoltze.family` as a custom domain. Cloudflare manages the
DNS record itself if the zone is on Cloudflare.

The old site stays up until this record is changed, so the cutover can be done
after verifying the Worker on its `*.workers.dev` URL.

### 4. Add the GitHub Actions secrets

In **Settings → Secrets and variables → Actions**:

| Secret                  | Where to get it                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare dashboard → My Profile → API Tokens → _Edit Cloudflare Workers_ template |
| `CLOUDFLARE_ACCOUNT_ID` | Workers & Pages overview, right sidebar                                             |

`.github/workflows/deploy.yml` uses a `production` environment, so a required
reviewer can be added there if you ever want deploys gated.

### 5. Set a spend cap on the API key

Rate limiting in the Worker bounds abuse through the site. It does nothing if the
key itself leaks. Set a quota on the key in Google AI Studio as the real backstop.

## Ongoing

Push to `main`. `ci.yml` runs format, typecheck, unit tests, build and e2e;
`deploy.yml` builds and deploys. Deploys are serialised and never cancelled
mid-run.

To deploy by hand:

```sh
npm run deploy
```

## Verifying a deploy

```sh
curl -sI https://coleman.stoltze.family/ | head -1
curl -s -X POST https://coleman.stoltze.family/api/chat \
  -H 'content-type: application/json' -d '{"messages":[]}'
# expect: {"error":"No messages supplied."}
```

A `503 {"error":"Chat is not configured."}` means the Worker has no
`GOOGLE_GENERATIVE_AI_API_KEY` — step 2 was skipped or the secret was set on a
different Worker.

Logs: `npx wrangler tail`. Observability is enabled in `wrangler.jsonc`, so
`console.error` from the chat route is retained and queryable in the dashboard.

## Rolling back

```sh
npx wrangler deployments list
npx wrangler rollback [deployment-id]
```

## Local preview of the real Worker

`npm run dev` runs the Vite dev server. To exercise the actual built Worker,
including bindings:

```sh
npm run build && npm run preview
```

## The old Hugo site

`main` was a Hugo site deployed to the `gh-pages` branch by a workflow that no
longer exists. That branch is still there and still serves the old resume until
DNS moves. Once the Worker is live and verified, `gh-pages` can be deleted.
