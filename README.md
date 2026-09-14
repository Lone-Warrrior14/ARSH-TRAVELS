# ARSH ENTERPRISES Billing

A full-stack billing, POS, invoice, customer, payment, inventory, GST, reporting, and business-management application for ARSH ENTERPRISES.

The app is built with Next.js App Router, TypeScript, PostgreSQL, Prisma, NextAuth, Tailwind CSS, Decimal.js, Zod, and Recharts. Prisma is pinned to the stable Prisma 7 line because Prisma 8 is still a release-candidate CLI line as of September 2026.

## Key Decisions

- GST is recalculated on the server from invoice item inputs. The browser never owns final totals.
- MRP is stored only as a reference value. GST is calculated from the actual selling amount.
- GST-inclusive prices are reverse-calculated with `price * 100 / (100 + gstRate)` so GST is separated, not added again.
- Finalized invoice item rows store historical snapshots for name, SKU, MRP, tax mode, GST rate, taxable value, and tax amounts.
- Invoice numbers use a database counter so numbers are sequential and unique.
- The logo is a fixed code asset at `public/arsh-enterprises-logo.png`. There is no logo upload, delete, or replace UI.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `NEXTAUTH_SECRET`, and the initial admin credentials.

3. Create the PostgreSQL database, then run:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

4. Open `http://localhost:3000`.

## Production

Set production environment variables, run database migrations, build the app, and start Next.js:

```bash
npm run prisma:migrate
npm run build
npm run start
```

Prisma 7 reads `DATABASE_URL` from `prisma.config.ts` for migrations and uses `@prisma/adapter-pg` at runtime for PostgreSQL.

## Verification

Run the GST and invoice calculation tests:

```bash
npm test
```

## Default GSTIN

`29AIGPR1899C1ZU`
