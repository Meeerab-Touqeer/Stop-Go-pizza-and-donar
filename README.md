# STOP&GO · Pizza & Doner

A premium ordering site for STOP&GO: cinematic homepage, a Three.js pizza, live customization, cart, checkout, order tracking, and a kitchen dashboard.

## Stack

- React, Vite, React Three Fiber, Framer Motion, GSAP
- Express REST API
- Supabase Postgres when keys are present, otherwise a local menu file so the restaurant can run immediately

Business rules (price, tax, discounts, auth) live in the API and in `client/src/lib`, not inside the visual components.

## Run it

```bash
npm install
npm run dev
```

- Site: http://localhost:5173
- API: http://localhost:4000

Demo accounts (local mode):

- Admin: `admin@stopandgo.com` / `StopGo2026!`
- Guest: `guest@stopandgo.com` / `Guest2026!`

Discount code: `STOP10` (10% off).

The food photography in `client/public/food` comes from the supplied STOP&GO picture set, resized for the web. Pizza plates that were not in that set are drawn in the interface and in the 3D builder.

## Supabase

1. Create a project and run `supabase/schema.sql` in the SQL editor.
2. Copy `.env.example` to `.env` and set:

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
JWT_SECRET=
```

3. For Google sign-in, also add the anon values to `client/.env`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Enable the Google provider in Supabase Auth, and set the redirect URL to `http://localhost:5173/account`.

Restart the API. On the first boot with an empty `categories` table, the server creates the admin and guest users, then loads the menu, reviews, and sample orders. The service role key stays on the server. Row Level Security in `schema.sql` protects direct browser access.

## Stripe

Set `STRIPE_SECRET_KEY` and install Stripe in the server workspace (`npm install stripe -w server`). Checkout then creates a PaymentIntent for the Stripe option. Cash on delivery works without it. Card details are validated in the browser and are not stored.

## Scripts

- `npm run dev` — site and API together
- `npm run build` — production client build
- `npm start` — API, and the built site when `NODE_ENV=production`
