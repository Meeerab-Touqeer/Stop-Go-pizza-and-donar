<?php

function logo(string $variant = 'full', string $tone = 'light'): string
{
    $words = $variant === 'mark' ? '' : '<span class="brand-words"><span class="wordmark"><span>STOP</span><span class="amp">&amp;</span><span>GO</span></span>'
        . ($variant === 'full' ? '<span class="brand-sub">Pizza &amp; Doner</span>' : '') . '</span>';
    return '<span class="brand brand-' . $variant . ' brand-' . $tone . '"><svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="18" class="mark-plate"></rect><path d="M32 8.5c12.4 0 22.6 9.4 23.8 21.5H32V8.5z" class="mark-slice"></path><path d="M14 36.5h36" class="mark-road"></path><text x="32" y="46" text-anchor="middle" class="mark-letters">S&amp;G</text></svg>' . $words . '</span>';
}

function icon(string $name): string
{
    $paths = [
        'search' => '<circle cx="11" cy="11" r="7"></circle><path d="M16 16l5 5"></path>',
        'user' => '<circle cx="12" cy="8" r="4"></circle><path d="M4 20c1.5-3.5 4-5 8-5s6.5 1.5 8 5"></path>',
        'cart' => '<path d="M4 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H7"></path><circle cx="10" cy="20" r="1.4"></circle><circle cx="18" cy="20" r="1.4"></circle>',
        'menu' => '<path d="M4 7h16M4 12h16M4 17h16"></path>',
        'close' => '<path d="M6 6l12 12M18 6L6 18"></path>',
        'home' => '<path d="M4 11l8-7 8 7v8H4z"></path>',
    ];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">' . ($paths[$name] ?? '') . '</svg>';
}

function render_header(string $title): void
{
    $user = current_user();
    $count = cart_count();
    $flash = take_flash();
    $account = $user ? '/orders.php' : '/login.php';
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($title) ?> · STOP&amp;GO</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,560;1,9..144,560&family=Oswald:wght@500&family=Outfit:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <link rel="icon" href="/images/pepperoni-pizza.png">
</head>
<body>
<div class="app-shell">
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header" id="site-header">
    <div class="nav-inner">
      <a class="brand-link" href="/" aria-label="STOP&amp;GO home"><?= logo() ?></a>
      <nav class="nav-links" aria-label="Primary">
        <a class="<?= active('/index.php') || active('/') ? 'active' : '' ?>" href="/">Home</a>
        <a class="<?= active('/menu.php') ?>" href="/menu.php">Menu</a>
        <?php foreach (menu_categories() as $cat): ?>
          <a href="/menu.php?category=<?= e($cat['slug']) ?>"><?= e($cat['name']) ?></a>
        <?php endforeach; ?>
        <a class="<?= active('/about.php') ?>" href="/about.php">About</a>
        <a class="<?= active('/contact.php') ?>" href="/contact.php">Contact</a>
      </nav>
      <form class="nav-search" action="/menu.php" method="get">
        <input type="search" name="q" placeholder="Search menu" aria-label="Search the menu" value="<?= e($_GET['q'] ?? '') ?>">
        <button class="btn btn-primary btn-small" type="submit">Search</button>
      </form>
      <div class="nav-tools">
        <a class="icon-btn" href="<?= e($account) ?>" aria-label="Account"><?= icon('user') ?></a>
        <a class="icon-btn cart-btn" href="/cart.php" aria-label="Cart, <?= $count ?> items"><?= icon('cart') ?><?php if ($count): ?><span class="cart-count"><?= $count ?></span><?php endif; ?></a>
        <a class="btn btn-primary nav-order" href="/menu.php">Order Now</a>
        <button class="icon-btn nav-burger" type="button" id="open-drawer" aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><?= icon('menu') ?></button>
      </div>
    </div>
  </header>
  <div id="drawer-backdrop" hidden style="display:none"></div>
  <div class="drawer" id="drawer" hidden style="display:none" aria-hidden="true">
    <button class="icon-btn" type="button" id="close-drawer" aria-label="Close menu"><?= icon('close') ?></button>
    <?= logo('full', 'dark') ?>
    <a href="/">Home</a>
    <a href="/menu.php">Menu</a>
    <?php foreach (menu_categories() as $cat): ?>
      <a href="/menu.php?category=<?= e($cat['slug']) ?>"><?= e($cat['name']) ?></a>
    <?php endforeach; ?>
    <form action="/menu.php" method="get"><input type="search" name="q" placeholder="Search menu" aria-label="Search"></form>
    <a href="/about.php">About</a>
    <a href="/contact.php">Contact</a>
    <a class="btn btn-primary" href="/menu.php">Order Now</a>
  </div>
  <?php if ($flash): ?><div class="toast" role="status">✓ <?= e($flash) ?></div><?php endif; ?>
  <main id="main" class="page-fade">
    <?php
}

function render_footer(bool $admin = false): void
{
    if (!$admin) {
        ?>
  </main>
  <footer class="site-footer">
    <div><?= logo() ?><p>Freshly baked pizza and perfectly seasoned doner, crafted your way.</p></div>
    <div><h3>Visit</h3><p>120 Market Street<br>Your City<br>Daily 11:00 – 23:00</p></div>
    <div><h3>Order</h3><a href="/menu.php">Menu</a><a href="/cart.php">Cart</a><a href="/orders.php">Orders</a></div>
    <div><h3>House</h3><a href="/about.php">About</a><a href="/contact.php">Contact</a><a href="/login.php">Account</a></div>
  </footer>
  <nav class="mobile-nav" aria-label="Mobile">
    <a href="/"><span><?= icon('home') ?></span><span>Home</span></a>
    <a href="/menu.php"><span><?= icon('menu') ?></span><span>Menu</span></a>
    <a href="/menu.php"><span><?= icon('search') ?></span><span>Search</span></a>
    <a href="/cart.php"><span><?= icon('cart') ?></span><span>Cart</span></a>
    <a href="/login.php"><span><?= icon('user') ?></span><span>Account</span></a>
  </nav>
        <?php
    } else {
        echo '</main>';
    }
    ?>
</div>
<script src="/assets/js/site.js"></script>
</body>
</html>
    <?php
}
