# STOP&GO Pizza & Doner

PHP, MySQL, HTML, CSS, and JavaScript site for Bluehost or Hostinger shared hosting. Upload this folder’s contents to `public_html`. It does not need Node.js, npm, React, Vite, Express, or Supabase.

## 1. Create the database

In the hosting panel, create a MySQL database and user, and add the user to the database.

Open **phpMyAdmin**, select that database, choose **Import**, and import `database.sql` for a new site. If the tables already exist, import `menu-upgrade.sql` instead. That file keeps accounts and past orders, and replaces the menu with the Dutch prices.

The file creates the tables and the menu. Demo sign-in:

- Admin: `admin@stopandgo.com` / `StopGo2026!`
- Guest: `guest@stopandgo.com` / `Guest2026!`
- Discount code: `STOP10`

## 2. Configure MySQL

Copy `config.example.php` to `config.php` and set the database host, name, user, and password. Do not commit `config.php`. Pages use PDO prepared statements.

```php
'db_host' => 'localhost',
'db_name' => 'u123456789_stopandgo',
'db_user' => 'u123456789_stopgo',
'db_pass' => 'the-password-from-hpanel',
```

Set the site PHP version to 8.1 or newer. Make the `uploads/` folder writable so admin product photos can be stored on the server.

## 3. Upload

Upload everything in this project to `public_html`, including `index.php`. The homepage is `https://your-domain.com/`.

Do not upload `client/`, `server/`, or `node_modules` if any old copies are still on your computer. Those are not part of the live site.
