# Shelf

Minimal digital product storefront. Admin uploads products, customers pay via Stripe Checkout, and receive time-limited download links by email. No buyer accounts required.

**Stack:** `Next.js 14 · TypeScript · Auth.js v5 · Drizzle ORM · Turso (SQLite) · Stripe · Tailwind CSS`

**Live:** https://shelf-bitcoineo.vercel.app

---

## Why I built this

I wanted to understand how a real payment flow works end to end: Stripe Checkout Sessions, webhook signature verification, and order completion driven by events rather than redirects. The download token system adds a second layer of interest — each purchase generates a nanoid token with a 48-hour expiry and a 3-download cap, enforced at the database level.

## Features

- **Admin dashboard** Create and manage digital products with file URLs and pricing
- **Stripe Checkout** Full payment flow with Checkout Sessions
- **Webhook-driven completion** Orders complete via verified Stripe, not redirect
- **Time-limited downloads** 48h expiry, 3 downloads max per purchase, token-based
- **No buyer accounts** Customers receive a download link directly, no registration
- **Admin auth** Credentials-only login via Auth.js v5, no public signup
- **Dark / Light theme** System preference with toggle

## Setup

    pnpm install
    cp .env.example .env.local

Fill in your .env.local:

    DATABASE_URL=              # Turso database URL (libsql://...)
    DATABASE_AUTH_TOKEN=       # Turso auth token
    AUTH_SECRET=               # openssl rand -base64 32
    STRIPE_SECRET_KEY=         # sk_test_...
    STRIPE_PUBLISHABLE_KEY=    # pk_test_...
    STRIPE_WEBHOOK_SECRET=     # whsec_... (from Stripe CLI or dashboard)
    NEXT_PUBLIC_BASE_URL=      # http://localhost:3000 for dev

Run migrations and seed the admin user:

    pnpm db:generate
    pnpm db:migrate
    pnpm db:seed

Default admin credentials: admin@shelf.dev / admin123

Forward Stripe webhooks locally:

    stripe listen --forward-to localhost:3000/api/webhooks/stripe

Start dev server:

    pnpm dev

Open http://localhost:3000

## Architecture

All database queries live in src/lib/, never in components or routes. Lib functions return { data, error } and never throw. The webhook handler at /api/webhooks/stripe verifies the Stripe signature before processing any event.

    src/
      app/           Pages and API routes (App Router)
      db/            Schema, migrations, seed script
      lib/           Business logic (products, orders, downloads, stripe, checkout)

## Deploy to Vercel

1. Push to GitHub
2. Import the repo on Vercel
3. Add all environment variables
4. Set up a Stripe webhook endpoint pointing to your-domain.vercel.app/api/webhooks/stripe
5. Deploy

## GitHub Topics

`nextjs` `typescript` `stripe` `payments` `drizzle-orm` `turso` `sqlite` `authjs` `tailwind` `ecommerce` `digital-products`
