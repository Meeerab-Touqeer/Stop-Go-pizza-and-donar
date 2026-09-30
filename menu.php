<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';
require __DIR__ . '/includes/pricing.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $productId = (int) ($_POST['product_id'] ?? 0);
    $stmt = db()->prepare('SELECT * FROM products WHERE id = ? AND is_available = 1');
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    if (!$product) {
        flash('That item is not on the menu.');
        redirect('/menu.php');
    }
    $extraIds = array_map('intval', $_POST['extras'] ?? []);
    $extras = [];
    if ($extraIds) {
        $marks = implode(',', array_fill(0, count($extraIds), '?'));
        $extraStmt = db()->prepare("SELECT * FROM ingredients WHERE id IN ($marks) AND price > 0");
        $extraStmt->execute($extraIds);
        $extras = $extraStmt->fetchAll();
    }
    try {
        $quote = quote_product($product, $_POST, $extras);
    } catch (RuntimeException $error) {
        flash($error->getMessage());
        redirect('/product.php?id=' . $productId);
    }
    $quantity = max(1, min(20, (int) ($_POST['quantity'] ?? 1)));
    $_SESSION['cart'][] = [
        'id' => bin2hex(random_bytes(6)),
        'product_id' => $product['id'],
        'name' => $product['name'],
        'image' => $product['image'],
        'quantity' => $quantity,
        'unit_price' => $quote['unit_price'],
        'options' => $quote['options'],
    ];
    flash($product['name'] . ' added to the cart.');
    redirect('/cart.php');
}

$itemId = (int) ($_GET['item'] ?? 0);
if ($itemId) {
    redirect('/product.php?id=' . $itemId);
}
$category = preg_replace('/[^a-z0-9-]/', '', $_GET['category'] ?? '');
$search = trim($_GET['q'] ?? '');
$categories = db()->query('SELECT * FROM categories ORDER BY id')->fetchAll();

if (false && $itemId) {
    $stmt = db()->prepare('SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ? AND p.is_available = 1');
    $stmt->execute([$itemId]);
    $product = $stmt->fetch();
    if (!$product) {
        flash('That item is not on the menu.');
        redirect('/menu.php');
    }
    $extras = db()->query("SELECT * FROM ingredients WHERE price > 0 AND category IN ('pizza','doner','both') ORDER BY name")->fetchAll();
    $catalog = option_catalog();
    $user = current_user();
    render_header($product['name']);
    ?>
    <section class="page">
      <p class="eyebrow"><?= e($product['category_name']) ?></p>
      <div class="modal" style="position:relative;max-height:none">
        <div class="modal-visual"><img src="/<?= e($product['image']) ?>" alt="<?= e($product['name']) ?>"></div>
        <form class="modal-panel" method="post">
          <?= csrf_field() ?>
          <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
          <h1><?= e($product['name']) ?></h1>
          <p class="lede"><?= e($product['description']) ?></p>
          <?php if ($product['customizer'] === 'pizza'): ?>
            <?php foreach (['size' => $catalog['pizza_sizes'], 'crust' => $catalog['pizza_crusts'], 'cheese' => $catalog['pizza_cheese']] as $key => $list): ?>
              <fieldset class="choice-block"><legend><?= e(ucfirst($key)) ?></legend><div class="choice-row">
                <?php foreach ($list as $option): $checked = ($product['default_' . $key] ?: ($key === 'size' ? 'medium' : '')) === $option['id']; ?>
                  <label class="choice"><input type="radio" name="<?= e($key) ?>" value="<?= e($option['id']) ?>" <?= $checked ? 'checked' : '' ?>> <span><?= e($option['name']) ?></span><span><?= $option['price'] > 0 ? '+' . money((float) $option['price']) : ($option['price'] < 0 ? money((float) $option['price']) : 'Included') ?></span></label>
                <?php endforeach; ?>
              </div></fieldset>
            <?php endforeach; ?>
          <?php elseif ($product['customizer'] === 'doner'): ?>
            <?php
            $groups = ['type' => $catalog['doner_types'], 'bread' => $catalog['doner_breads'], 'size' => $catalog['doner_sizes'], 'sauce' => $catalog['doner_sauces']];
            $defaults = ['type' => $product['default_type'] ?: 'chicken', 'bread' => $product['default_bread'] ?: 'wrap', 'size' => $product['default_size'] ?: 'regular', 'sauce' => $product['default_sauce'] ?: 'garlic'];
            foreach ($groups as $key => $list): ?>
              <fieldset class="choice-block"><legend><?= e(ucfirst($key)) ?></legend><div class="choice-row">
                <?php foreach ($list as $option): ?>
                  <label class="choice"><input type="radio" name="<?= e($key) ?>" value="<?= e($option['id']) ?>" <?= $defaults[$key] === $option['id'] ? 'checked' : '' ?>> <span><?= e($option['name']) ?></span><span><?= $option['price'] > 0 ? '+' . money((float) $option['price']) : 'Included' ?></span></label>
                <?php endforeach; ?>
              </div></fieldset>
            <?php endforeach; ?>
          <?php endif; ?>
          <?php if ($product['customizer'] !== 'simple'): ?>
            <fieldset class="choice-block"><legend>Extras</legend><div class="choice-row">
              <?php foreach ($extras as $extra):
                if ($product['customizer'] === 'pizza' && !in_array($extra['category'], ['pizza', 'both'], true)) continue;
                if ($product['customizer'] === 'doner' && !in_array($extra['category'], ['doner', 'both'], true)) continue;
              ?>
                <label class="choice"><input type="checkbox" name="extras[]" value="<?= (int) $extra['id'] ?>"> <span><?= e($extra['name']) ?></span><span>+<?= money((float) $extra['price']) ?></span></label>
              <?php endforeach; ?>
            </div></fieldset>
          <?php endif; ?>
          <div class="modal-buy">
            <label class="qty">Qty <input type="number" name="quantity" min="1" max="20" value="1" style="width:64px;background:transparent;border:0"></label>
            <strong class="modal-total"><span>From</span><?= money((float) $product['base_price']) ?></strong>
            <button class="btn btn-primary" type="submit">Add to cart</button>
          </div>
          <?php if ($product['allergens']): ?><p class="allergens">Allergens: <?= e($product['allergens']) ?></p><?php endif; ?>
        </form>
      </div>
      <?php if ($user): ?>
        <form class="form-grid" method="post" action="/orders.php" style="margin-top:28px">
          <?= csrf_field() ?>
          <input type="hidden" name="review_product" value="<?= (int) $product['id'] ?>">
          <label>Rating<select name="rating"><?php for ($i = 5; $i >= 1; $i--): ?><option value="<?= $i ?>"><?= $i ?></option><?php endfor; ?></select></label>
          <label class="span-2">Review<textarea name="comment" minlength="4" required></textarea></label>
          <button class="btn btn-ghost" type="submit">Post review</button>
        </form>
      <?php endif; ?>
    </section>
    <?php
    render_footer();
    exit;
}

$sql = 'SELECT p.*, c.name AS category_name, c.slug FROM products p JOIN categories c ON c.id = p.category_id WHERE p.is_available = 1';
$params = [];
if ($category !== '') {
    $sql .= ' AND c.slug = ?';
    $params[] = $category;
}
if ($search !== '') {
    $sql .= ' AND (p.name LIKE ? OR p.description LIKE ?)';
    $params[] = '%' . $search . '%';
    $params[] = '%' . $search . '%';
}
$sql .= ' ORDER BY p.id';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

render_header('Menu');
?>
<section class="page">
  <div class="page-intro"><p class="eyebrow">The menu</p><h1>Pizza, doner, and the stops between.</h1><p>Freshly baked pizza and perfectly seasoned doner, crafted your way.</p></div>
  <div class="filter-row">
    <a class="<?= $category === '' ? 'active' : '' ?>" href="/menu.php">All</a>
    <?php foreach ($categories as $cat): ?>
      <a class="<?= $category === $cat['slug'] ? 'active' : '' ?>" href="/menu.php?category=<?= e($cat['slug']) ?>"><?= e($cat['name']) ?></a>
    <?php endforeach; ?>
  </div>
  <div class="product-grid">
    <?php foreach ($products as $product): ?>
      <article class="food-card">
        <a href="/product.php?id=<?= (int) $product['id'] ?>"><div class="card-visual"><img src="/<?= e($product['image']) ?>" alt="<?= e($product['name']) ?>"><?php if ($product['is_spicy'] || $product['is_vegetarian']): ?><div class="card-badges"><?php if ($product['is_spicy']): ?><span class="pill pill-spice">Spicy</span><?php endif; ?><?php if ($product['is_vegetarian']): ?><span class="pill">Veg</span><?php endif; ?></div><?php endif; ?></div></a>
        <div class="card-body">
          <div class="card-top"><h3><?= e($product['name']) ?></h3><span class="rating"><?= e($product['rating']) ?></span></div>
          <p><?= e($product['description']) ?></p>
          <div class="card-meta"><span><?= (int) $product['preparation_time'] ?> min</span><span><?= (int) $product['calories'] ?> kcal</span></div>
          <div class="card-foot"><div class="price"><?php if ($product['compare_at']): ?><s><?= money((float) $product['compare_at']) ?></s><?php endif; ?><strong><?= money((float) $product['base_price']) ?></strong></div><a class="btn btn-primary btn-small" href="/product.php?id=<?= (int) $product['id'] ?>">Customize</a></div>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
  <?php if (!$products): ?><p class="empty-state">Nothing matches that search.</p><?php endif; ?>
</section>
<?php render_footer();