<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

$products = db()->query('SELECT p.*, c.name AS category_name, c.slug FROM products p JOIN categories c ON c.id = p.category_id WHERE p.is_available = 1 ORDER BY p.id')->fetchAll();
$reviews = db()->query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 3')->fetchAll();
$featured = array_values(array_filter($products, fn($product) => (int) $product['featured'] === 1 && $product['slug'] !== 'deals'));
$deals = array_values(array_filter($products, fn($product) => $product['slug'] === 'deals'));
$tonight = array_slice(array_values(array_filter($products, fn($product) => !(int) $product['builder'])), 0, 4);

render_header('Stop. Taste. Go.');
?>
<section class="hero">
  <div class="hero-copy">
    <p class="badge-live"><i></i> Fresh • Hot • Made to Order</p>
    <p class="eyebrow">Pizza &amp; Doner</p>
    <h1>Stop. <em>Taste.</em> Go.</h1>
    <p class="hero-support">Bold Pizza. Legendary Doner. Made Fresh for Your Next Stop.</p>
    <p class="hero-sub">Freshly baked pizza and perfectly seasoned doner, crafted your way.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="/menu.php">Order Now</a>
      <a class="btn btn-ghost" href="/menu.php">Explore Menu</a>
    </div>
    <dl class="hero-metrics">
      <div><dt>12 min</dt><dd>Average handoff</dd></div>
      <div><dt>4.9</dt><dd>Guest rating</dd></div>
      <div><dt>Made here</dt><dd>Pizza &amp; doner</dd></div>
    </dl>
  </div>
  <figure class="hero-plate">
    <img src="/images/pepperoni-pizza.png" alt="Signature pepperoni pizza">
  </figure>
</section>
<div class="marquee" aria-hidden="true"><div><p>Pepperoni · Chicken Doner · Cheese Burst · Beef Doner · Chili · Basil · Garlic Sauce · Loaded Fries · Pepperoni · Chicken Doner · Cheese Burst · Beef Doner · Chili · Basil · Garlic Sauce · Loaded Fries · </p></div></div>

<section class="section signatures">
  <div class="section-head"><p class="eyebrow">The ones people come back for</p><h2>STOP&amp;GO Signatures</h2></div>
  <div class="signature-grid">
    <?php foreach (array_slice($featured, 0, 3) as $product): ?>
      <a class="signature-card" href="/product.php?id=<?= (int) $product['id'] ?>">
        <img src="/<?= e($product['image']) ?>" alt="<?= e($product['name']) ?>">
        <div><span><?= e($product['category_name']) ?></span><h3><?= e($product['name']) ?></h3><strong><?= money((float) $product['base_price']) ?></strong></div>
      </a>
    <?php endforeach; ?>
  </div>
</section>

<section class="section paper story">
  <div class="story-intro">
    <p class="eyebrow">The kitchen</p>
    <h2>Good food. Good mood. Keep going.</h2>
    <p>Dough hits the oven. Meat turns on the spit. Sauce is finished at the pass. STOP&amp;GO is built for people who want both a proper meal and a fast handoff.</p>
  </div>
  <div class="story-grid">
    <?php
    $story = [
      ['images/6.png', 'Fresh ingredients', 'Prepped in sight of the pass.', 'Lettuce, tomato, onion, pickles, and sauces stay cold until the wrap is called.'],
      ['images/7.png', 'Doner, sliced', 'Shaved from the spit, never scooped.', 'The meat meets the bread in the same minute it leaves the knife.'],
      ['images/3.png', 'The fire', 'Heat you can taste.', 'Char on the edges, juice in the center. That is the STOP&GO bite.'],
      ['images/10.jpg', 'Keep going', 'Made for the next stop.', 'Eat it here, or take it with you. The kitchen does not slow the handoff.'],
    ];
    foreach ($story as [$src, $kicker, $title, $copy]): ?>
      <article class="story-frame">
        <img src="/<?= e($src) ?>" alt="<?= e($title) ?>">
        <div><span><?= e($kicker) ?></span><h3><?= e($title) ?></h3><p><?= e($copy) ?></p></div>
      </article>
    <?php endforeach; ?>
  </div>
</section>

<section class="section">
  <div class="section-head"><p class="eyebrow">Worth stopping for</p><h2>Deals</h2></div>
  <div class="deal-grid">
    <?php foreach ($deals as $deal): ?>
      <article class="deal-card">
        <span class="pill pill-hot"><?= (int) $deal['discount_percent'] ?>% off</span>
        <h3><?= e($deal['name']) ?></h3>
        <p><?= e($deal['description']) ?></p>
        <div class="price"><?php if ($deal['compare_at']): ?><s><?= money((float) $deal['compare_at']) ?></s><?php endif; ?><strong><?= money((float) $deal['base_price']) ?></strong></div>
        <a class="btn btn-primary" href="/product.php?id=<?= (int) $deal['id'] ?>">Order this deal</a>
      </article>
    <?php endforeach; ?>
  </div>
</section>

<section class="build-band">
  <div>
    <p class="eyebrow">Built your way</p>
    <h2>Build your pizza</h2>
    <p>Choose the size, crust, cheese, and extras. The price updates before it ever reaches the oven.</p>
    <a class="btn btn-primary" href="/menu.php?category=pizza">Open the menu</a>
  </div>
  <img src="/images/2.png" alt="Pizza in the kitchen">
</section>

<section class="section paper">
  <div class="section-head"><p class="eyebrow">From the counter</p><h2>A few words</h2></div>
  <div class="review-grid">
    <?php foreach ($reviews as $review): ?>
      <blockquote><p>“<?= e($review['comment']) ?>”</p><footer><?= e($review['author_name']) ?></footer></blockquote>
    <?php endforeach; ?>
  </div>
</section>

<section class="section">
  <div class="section-head"><p class="eyebrow">Start anywhere</p><h2>On the menu tonight</h2></div>
  <div class="product-grid">
    <?php foreach ($tonight as $product): ?>
      <article class="food-card">
        <a href="/product.php?id=<?= (int) $product['id'] ?>"><div class="card-visual"><img src="/<?= e($product['image']) ?>" alt="<?= e($product['name']) ?>"></div></a>
        <div class="card-body">
          <div class="card-top"><h3><?= e($product['name']) ?></h3><span class="rating"><?= e($product['rating']) ?></span></div>
          <p><?= e($product['description']) ?></p>
          <div class="card-foot"><strong><?= money((float) $product['base_price']) ?></strong><a class="btn btn-primary btn-small" href="/product.php?id=<?= (int) $product['id'] ?>">Add</a></div>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
</section>
<?php render_footer();