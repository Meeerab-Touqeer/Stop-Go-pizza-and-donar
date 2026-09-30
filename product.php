<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';
require __DIR__ . '/includes/pricing.php';

$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT p.*, c.name AS category_name, c.slug FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ? AND p.is_available = 1');
$stmt->execute([$id]);
$product = $stmt->fetch();
if (!$product) {
    flash('That item is not on the menu.');
    redirect('/menu.php');
}
$extras = db()->query("SELECT * FROM ingredients WHERE price > 0 AND category IN ('pizza','doner','both') ORDER BY name")->fetchAll();
$catalog = option_catalog();
$user = current_user();
$reviews = db()->prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC');
$reviews->execute([$id]);
$reviewRows = $reviews->fetchAll();

render_header($product['name']);
?>
<section class="page">
  <p class="eyebrow"><a href="/menu.php?category=<?= e($product['slug']) ?>"><?= e($product['category_name']) ?></a></p>
  <div class="modal" style="position:relative;max-height:none">
    <div class="modal-visual"><img src="/<?= e(ltrim($product['image'], '/')) ?>" alt="<?= e($product['name']) ?>"></div>
    <form class="modal-panel" method="post" action="/menu.php">
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
      <?php if (true): ?>
        <fieldset class="choice-block"><legend>Extras</legend><div class="choice-row">
          <?php foreach ($extras as $extra): ?>
            <label class="choice"><input type="checkbox" name="extras[]" value="<?= (int) $extra['id'] ?>"> <span><?= e($extra['name']) ?></span><span>+<?= money((float) $extra['price']) ?></span></label>
          <?php endforeach; ?>
        </div></fieldset>
      <?php endif; ?>
      <div class="modal-buy">
        <label class="qty">Qty <input type="number" name="quantity" min="1" max="20" value="1" style="width:72px;background:transparent;border:0;color:inherit"></label>
        <strong class="modal-total"><span>From</span><?= money((float) $product['base_price']) ?></strong>
        <button class="btn btn-primary" type="submit">Add to cart</button>
      </div>
      <?php if ($product['allergens']): ?><p class="allergens">Allergens: <?= e($product['allergens']) ?></p><?php endif; ?>
    </form>
  </div>
  <div class="review-grid" style="margin-top:28px">
    <?php foreach ($reviewRows as $review): ?>
      <blockquote><p>“<?= e($review['comment']) ?>”</p><footer><?= e($review['author_name']) ?> · <?= (int) $review['rating'] ?>/5</footer></blockquote>
    <?php endforeach; ?>
  </div>
  <?php if ($user): ?>
    <form class="form-grid" method="post" action="/orders.php" style="margin-top:28px">
      <?= csrf_field() ?>
      <input type="hidden" name="review_product" value="<?= (int) $product['id'] ?>">
      <label>Rating<select name="rating"><?php for ($i = 5; $i >= 1; $i--): ?><option value="<?= $i ?>"><?= $i ?></option><?php endfor; ?></select></label>
      <label class="span-2">Review<textarea name="comment" minlength="4" required></textarea></label>
      <button class="btn btn-ghost" type="submit">Post review</button>
    </form>
  <?php else: ?>
    <p class="lede"><a href="/login.php">Sign in</a> to leave a review.</p>
  <?php endif; ?>
</section>
<?php render_footer();