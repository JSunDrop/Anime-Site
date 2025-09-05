# OtakuHub — Next.js + Supabase (Enhanced)
Features included (scaffold):
- Supabase schema with age-based RLS (E/T/M/X), comments, forum, live chat, favorites, progress.
- Basic pages: Home, Explore, Work, Advanced (DOB), Forum, Live Chat.
- Realtime subscription for live chat.
- Stripe Connect placeholders with 1% platform fee.

## Quick Start
1) `npm i`
2) Copy `.env.example` → `.env.local` and fill your Supabase URL + Anon Key.
3) Apply SQL in `supabase/schema.sql` to your Supabase project.
4) Enable Realtime for the `live_messages` table in Supabase.
5) `npm run dev`

> Auth: use Supabase Auth (email magic link or OAuth) so `auth.uid()` works for RLS. Update the `SignIn` page to your preferred method.
