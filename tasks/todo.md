# Shelf — Project Setup

## Phase 1: Foundation (COMPLETE)
- [x] Create CLAUDE.md with project spec
- [x] Init Next.js 14 (TypeScript strict, App Router, Tailwind, pnpm)
- [x] Install all dependencies (drizzle-orm, @libsql/client, stripe, next-auth@beta, @auth/drizzle-adapter, bcryptjs, nanoid, drizzle-kit)
- [x] Create src/db/schema.ts (7 tables: user, account, session, verificationToken, product, order, download)
- [x] Create src/db/index.ts (lazy Turso client) and src/db/migrate.ts
- [x] Set up auth.ts + auth.config.ts (Edge-compatible split, JWT strategy, Credentials provider)
- [x] Create middleware.ts (protects /admin/* routes)
- [x] Create .env.example template
- [x] Ensure .gitignore covers .env files
- [x] Create drizzle.config.ts
- [x] Run drizzle-kit generate (migration: 0000_wealthy_cloak.sql)
- [x] Verify: TypeScript compiles with zero errors
- [x] Verify: Next.js build succeeds

## Phase 2: Next up
- [ ] Build src/lib/ functions (products, orders, downloads, stripe)
- [ ] Build API routes
- [ ] Build admin UI
- [ ] Build public storefront
