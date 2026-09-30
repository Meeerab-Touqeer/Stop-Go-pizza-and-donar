<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $action = $_POST['action'] ?? '';
    if ($action === 'clear') {
        $_SESSION['cart'] = [];
    } elseif ($action === 'code') {
        $code = strtoupper(trim($_POST['discount_code'] ?? ''));
        if ($code !== '' && $code !== 'STOP10') {
            flash('That discount code is not active.');
        } else {
            $_SESSION['discount_code'] = $code;
            flash($code === 'STOP10' ? 'STOP10 applied.' : 'Discount removed.');
        }
    } else {
        $id = $_POST['line'] ?? '';
        $cart = cart();
        foreach ($cart as $index => $line) {
            if ($line['id'] !== $id) continue;
            if ($action === 'remove') unset($cart[$index]);
            if ($action === 'qty') $cart[$index]['quantity'] = max(1, min(20, (int) ($_POST['quantity'] ?? 1)));
        }
        $_SESSION['cart'] = array_values($cart);
    }
    redirect('/cart.php');
}

$totals = cart_totals();
render_header('Cart');
?>
<section class="page cart-page">
  <div>
    <p class="eyebrow">Your stop</p>
    <h1>Cart</h1>
    <?php if (!cart()): ?><p class="empty-state">The cart is empty. <a href="/menu.php">Explore the menu.</a></p><?php endif; ?>
    <ul class="cart-list">
      <?php foreach (cart() as $line): ?>
        <li>
          <img src="/<?= e($line['image']) ?>" alt="">
          <div>
            <h2><?= e($line['name']) ?></h2>
            <p class="fine"><?php foreach ($line['options'] as $option) echo e($option['name']) . ' · '; ?></p>
            <div class="cart-line-actions">
              <form method="post"><?= csrf_field() ?><input type="hidden" name="line" value="<?= e($line['id']) ?>"><input type="hidden" name="action" value="qty"><input type="number" name="quantity" min="1" max="20" value="<?= (int) $line['quantity'] ?>" style="width:70px"><button type="submit">Update</button></form>
              <form method="post"><?= csrf_field() ?><input type="hidden" name="line" value="<?= e($line['id']) ?>"><input type="hidden" name="action" value="remove"><button type="submit">Remove</button></form>
            </div>
          </div>
          <strong><?= money($line['unit_price'] * $line['quantity']) ?></strong>
        </li>
      <?php endforeach; ?>
    </ul>
    <?php if (cart()): ?><form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="clear"><button class="text-btn" type="submit">Clear cart</button></form><?php endif; ?>
  </div>
  <aside class="summary">
    <h2>Summary</h2>
    <p><span>Subtotal</span><span><?= money($totals['subtotal']) ?></span></p>
    <p><span>Delivery</span><span><?= money($totals['delivery']) ?></span></p>
    <p><span>Discount</span><span>-<?= money($totals['discount']) ?></span></p>
    <p><span>Tax</span><span><?= money($totals['tax']) ?></span></p>
    <p class="summary-strong"><span>Total</span><span><?= money($totals['total']) ?></span></p>
    <form method="post" class="form-grid">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="code">
      <label class="span-2">Discount code<input name="discount_code" value="<?= e($totals['code']) ?>" placeholder="STOP10"></label>
      <button class="btn btn-ghost" type="submit">Apply</button>
    </form>
    <a class="btn btn-primary" href="/checkout.php">Proceed to checkout</a>
  </aside>
</section>
<?php render_footer();