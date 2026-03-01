# Shelf

A minimal digital product storefront. Admin lists products, visitors pay via Stripe Checkout, and receive time-limited download links. No buyer accounts — email-based delivery.

## Features

- Admin dashboard — create and manage digital products
- Stripe Checkout integration with webhook-driven order completion
- Time-limited download links (48h expiry, 3 downloads max)
- Light/dark mode toggle
- Fully responsive design

## Tech Stack

- **Next.js 14** — App Router, TypeScript strict
- **Drizzle ORM + Turso** — SQLite at the edge
- **Auth.js v5** — admin-only credentials auth
- **Stripe** — Checkout Sessions + webhooks
- **Tailwind CSS** — utility-first styling
- **pnpm** — package manager

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Turso database URL (`libsql://...`) |
| `DATABASE_AUTH_TOKEN` | Turso auth token |
| `AUTH_SECRET` | Random string for Auth.js JWT signing |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `NEXT_PUBLIC_BASE_URL` | Your app URL (e.g. `http://localhost:3000`) |

### 3. Database

Generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

Seed the admin user:

```bash
pnpm db:seed
```

Default admin credentials: `admin@shelf.dev` / `admin123`

### 4. Stripe webhook

For local development, use the Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret it prints to `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### 5. Run

```bash
pnpm dev
```

## Architecture

```
src/
├── app/           → Pages and API routes (App Router)
├── db/            → Schema, migrations, seed script
└── lib/           → Business logic (products, orders, downloads, stripe, checkout)
```

All database queries live in `src/lib/`, never in components or routes. Lib functions return `{ data, error }` — never throw.

## Live URL

<!-- Replace with your deployed URL -->
`https://your-app.vercel.app`
