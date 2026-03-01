# Shelf — Digital Product Store

## Overview
A storefront where an admin lists digital products, visitors pay via Stripe, and receive time-limited download links. No buyer accounts — email-based delivery.

## Tech Stack
Next.js 14 (App Router), TypeScript strict, Drizzle ORM + Turso, Auth.js v5 (admin only), Stripe, Tailwind CSS, pnpm

## Database Schema
Auth tables: user, account, session, verificationToken (standard Auth.js)

App tables:
- product: id (text PK nanoid), name, description, priceInCents (integer), fileUrl, previewImageUrl, stripeProductId, stripePriceId, isActive (integer default 1), createdAt, updatedAt
- order: id (text PK nanoid), productId (FK), customerEmail, stripeSessionId (unique), stripePaymentIntent, status (pending/completed/failed), createdAt
- download: id (text PK nanoid), orderId (FK), token (unique), expiresAt, downloadCount (integer default 0), maxDownloads (integer default 3), createdAt

## API Routes
- POST /api/products (admin: create product + sync to Stripe)
- GET /api/products (public: list active products)
- POST /api/checkout (create Stripe Checkout Session)
- POST /api/webhooks/stripe (receive Stripe events)
- GET /api/download/[token] (serve file if valid)

## Architecture
src/db/ → schema.ts, index.ts, migrate.ts
src/lib/ → products.ts, orders.ts, downloads.ts, stripe.ts
src/app/api/ → REST endpoints calling lib functions
src/components/ → React UI

## Coding Standards
- All DB queries in src/lib/, never in components or routes
- {data, error} return pattern, never throw from lib
- Prices always in cents (integer), never floats
- Server Actions for admin mutations, API routes for public/webhook

## Workflow
- Complete and verify each feature before moving to the next
- Do not skip testing between features
