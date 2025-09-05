# OtakuHub — Next.js + Supabase Starter

This is a minimal scaffold to move the prototype toward production:

- **Next.js (App Router)** + **TypeScript**
- **Supabase** for Auth/Postgres/Storage
- **Stripe Connect (1% platform fee)** placeholders
- Example pages: Home, Explore, Work, Studio, Office, Profile
- API stubs for checkout, webhooks (Stripe), and signed uploads

> You'll need Node 18+, a Supabase project, and a Stripe account (Connect).

## Quick Start
1. `npm i`
2. Copy `.env.example` to `.env.local` and fill values.
3. `npm run dev`
4. Apply the SQL in `supabase/schema.sql` to your Supabase DB.

## Deploy
- Vercel works great; set environment variables in your project settings.
