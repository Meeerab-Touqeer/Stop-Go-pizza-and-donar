# STOP&GO PHP API

This folder is a PHP port of the Express API in `server/`. The Node files are left in place.

## Local test

Requires PHP 8.1 or newer.

```bash
php -S localhost:8080 -t php-api php-api/index.php
```

Then open `http://localhost:8080/health`.

To point the Vite app at this API while developing, change the proxy in `client/vite.config.ts` from `http://localhost:4000` to `http://localhost:8080`. The frontend still calls `/api/...`, so no path in `client/src/services/api.ts` changes.

## Hostinger

1. In hPanel, set the site PHP version to 8.1 or newer.
2. Upload the contents of `php-api/` into `public_html/api/` so `index.php` lives at `public_html/api/index.php`.
3. Copy `config.example.php` to `config.php` and set a long `jwt_secret`. Leave `stripe_secret_key` empty unless you want Stripe card payments.
4. Make `public_html/api/data/` writable (orders, reviews, and messages are stored in `data/db.json`).
5. Build the React app (`npm run build` inside `client`) and upload `client/dist` to `public_html`, keeping the `api` folder beside it.

The built site requests `/api/catalog`, `/api/orders`, and the other routes. With the API folder at `public_html/api`, those URLs stay the same. Do not change `client/src/services/api.ts` for this layout.

If the API is hosted on a different domain, set `client_origin` in `config.php` to the site origin and change the fetch prefix in `client/src/services/api.ts` from `` `/api${path}` `` to `` `https://your-domain.com/api${path}` ``.

Google sign-in still needs Supabase. This PHP API uses the local JSON menu, the same demo accounts, and the `STOP10` discount.
