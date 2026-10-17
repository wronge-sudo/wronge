# WRONGE — web store

One washed-black denim jacket, endless zip-in back panels. Cash-on-delivery store for Bangladesh, with an admin panel for orders, stock and stats.

**Stack:** Next.js 16 (App Router, Cache Components) · Supabase (Postgres, Auth, RLS) · Cloudinary (images) · Vercel (hosting) · Tailwind CSS v4

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the keys (see comments in the file)
npm run dev                  # http://localhost:3000
```

## Database setup (once)

1. In Supabase → SQL Editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
2. Authentication → Users → **Add user** (auto-confirm), then run:
   `select public.make_admin('you@example.com');`
3. Authentication → turn **off** "Allow new users to sign up".
4. `npm run images:upload` to move the starter images to Cloudinary.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run images:upload` | Upload `public/seed` + `public/brand` to Cloudinary and update panel image URLs |

## Where things live

- `src/app/(store)` — storefront pages · `src/app/admin` — admin panel (`/admin`)
- `src/actions` — server actions (checkout, public forms, admin)
- `src/lib/pricing.ts` — the only place prices are calculated (server re-checks every order)
- `src/lib/data.ts` — cached public reads · `src/lib/admin-data.ts` — admin reads and stats
- `src/proxy.ts` + `src/lib/admin-auth.ts` — admin session and access checks
- `supabase/` — schema (tables, RLS, `place_order` / `set_order_status` functions) and seed data

## Environment variables

See `.env.example`. `SUPABASE_SECRET_KEY` and `CLOUDINARY_API_SECRET` are server-only: never expose or commit them.
