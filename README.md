# N8N Clone

A workflow automation builder inspired by [n8n](https://n8n.io). Create visual workflows with triggers and actions (HTTP requests, Slack, Discord, Gemini, Stripe, Google Forms, and more), run them via [Inngest](https://www.inngest.com/), and manage credentials, subscriptions, and executions from a Next.js app.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **API:** tRPC
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** Better Auth (email/password + optional GitHub OAuth)
- **Workflow engine:** Inngest
- **Billing:** Polar (sandbox)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [PostgreSQL](https://www.postgresql.org/) 14+
- [npm](https://www.npmjs.com/) (or pnpm / yarn / bun)

Optional, for full local development:

- [Inngest CLI](https://www.inngest.com/docs/local-development) — installed automatically as a dev dependency
- [ngrok](https://ngrok.com/) — expose webhooks (Stripe, Google Forms, etc.) to your local machine

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

#### Required

| Variable              | Description                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5432/n8n_clone`      |
| `BETTER_AUTH_URL`     | Public URL of the app. Local: `http://localhost:3000`                                             |
| `BETTER_AUTH_SECRET`  | Random secret for auth sessions (at least 32 characters). Generate with `openssl rand -base64 32` |
| `ENCRYPT_KEY`         | Secret used to encrypt stored credentials (API keys, tokens, etc.)                                |
| `NEXT_PUBLIC_APP_URL` | Public app URL shown in webhook URLs in the UI. Local: `http://localhost:3000`                    |
| `INNGEST_DEV`         | Set to `1` for local development so the SDK talks to the Inngest dev server instead of Inngest Cloud |

#### Optional — GitHub OAuth

Only needed if you want “Sign in with GitHub”. Email/password auth works without these.

| Variable               | Description                    |
| ---------------------- | ------------------------------ |
| `GITHUB_CLIENT_ID`     | GitHub OAuth app client ID     |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |

Create a GitHub OAuth app with callback URL: `{BETTER_AUTH_URL}/api/auth/callback/github`

#### Optional — Polar billing (sandbox)

Required for subscription checkout and customer sync on signup. The app uses Polar’s **sandbox** server.

| Variable               | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `POLAR_ACCESS_TOKEN`   | Polar organization access token                  |
| `POLAR_PRODUCT_ID`     | Product ID for the subscription plan             |
| `POLAR_WEBHOOK_SECRET` | Webhook signing secret for `/api/webhooks/polar` |

#### Optional — Demo workflow sandbox key

New users get a seeded "Quick Start: Daily Weather Briefing" workflow that runs **once** on a server-side Gemini key (no credential needed). After that run, they're prompted to add their own free Gemini API key.

| Variable          | Description                                                                     |
| ----------------- | ------------------------------------------------------------------------------- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key used for demo runs (locked to `gemini-2.5-flash-lite`). Optional — without it, the demo workflow requires a user credential like any other workflow. |

#### Production only — Inngest Cloud

Not needed locally when `INNGEST_DEV=1` and `npm run inngest:dev` is running. Required when deploying workflows to Inngest Cloud:

| Variable | Description |
| --- | --- |
| `INNGEST_EVENT_KEY` | Event key from your Inngest app dashboard |
| `INNGEST_SIGNING_KEY` | Signing key from your Inngest app dashboard |

### 3. Set up the database

Create the database (example with default local Postgres):

```bash
createdb n8n_clone
```

Apply the schema with Drizzle:

```bash
npx drizzle-kit push
```

Or run migrations from the `drizzle/` folder:

```bash
npx drizzle-kit migrate
```

### 4. Start the app

**Next.js only** (UI, auth, API — no workflow execution):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**With workflow execution** (required to run workflows and avoid realtime `401` errors), run in separate terminals:

```bash
# Terminal 1 — Next.js (must have INNGEST_DEV=1 in .env)
npm run dev

# Terminal 2 — Inngest dev server (connects to /api/inngest)
npm run inngest:dev
```

The Inngest dev UI is at [http://localhost:8288](http://localhost:8288). You do **not** need `INNGEST_EVENT_KEY` or `INNGEST_SIGNING_KEY` locally — only `INNGEST_DEV=1` plus the dev server running.

Verify the endpoint is wired up:

```bash
curl -s http://localhost:3000/api/inngest | jq
# expect: "message": "Inngest endpoint configured correctly."
```

**With webhooks** (Stripe / Google Form triggers hitting your machine), also run ngrok. Update `package.json` `ngrok:dev` with your own ngrok URL or domain:

```bash
# Terminal 3
npm run ngrok:dev
```

Set `NEXT_PUBLIC_APP_URL` to your ngrok HTTPS URL when testing webhooks locally.

#### All services at once

`npm run dev:all` starts Next.js, Inngest, and ngrok via [mprocs](https://github.com/pvolok/mprocs). It expects the `dotenv` CLI to load `.env` into child processes. If that command is missing, install it globally or run the three commands above manually:

```bash
npm install -g dotenv-cli
npm run dev:all
```

## Scripts

| Command               | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `npm run dev`         | Start Next.js dev server on port 3000                       |
| `npm run build`       | Production build                                            |
| `npm run start`       | Start production server (run `build` first)                 |
| `npm run lint`        | Run ESLint                                                  |
| `npm run inngest:dev` | Start Inngest dev server for workflow runs                  |
| `npm run ngrok:dev`   | Tunnel port 3000 through ngrok (edit URL in `package.json`) |
| `npm run dev:all`     | Run Next.js + Inngest + ngrok together via mprocs           |

## Project structure (high level)

```
src/
  app/              # Next.js routes and API (auth, inngest, webhooks, tRPC)
  components/       # Shared UI
  db/               # Drizzle schema and client
  features/         # Domain modules (workflows, nodes, credentials, auth, …)
  inngest/          # Workflow execution functions and realtime channels
  lib/              # Auth, Polar, encryption helpers
drizzle/            # SQL migrations
```

## Production

1. Set all required environment variables on your host (Vercel, Railway, etc.).
2. Point `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` at your production domain.
3. Use a managed PostgreSQL instance and set `DATABASE_URL`.
4. Switch Polar to production in `src/lib/polar.ts` when you go live.
5. Build and start:

```bash
npm run build
npm run start
```

Deploying on [Vercel](https://vercel.com) works for the Next.js app; you still need PostgreSQL, Inngest, and Polar configured for the full product.
