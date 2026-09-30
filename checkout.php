<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

if (!cart()) redirect('/cart.php');
$user = current_user();
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $postal = trim($_POST['postal_code'] ?? '');
    $notes = trim($_POST['instructions'] ?? '');
    $payment = $_POST['payment_method'] ?? 'cod';
    if (strlen($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($phone) < 7 || strlen($address) < 5 || strlen($city) < 2 || strlen($postal) < 3) {
        $error = 'Check the form and try again.';
    } elseif (!in_array($payment, ['cod', 'card'], true)) {
        $error = 'Choose a payment method.';
    } else {
        $totals = cart_totals();
        $pdo = db();
        $pdo->beginTransaction();
        $order = $pdo->prepare('INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, subtotal, delivery_fee, discount, discount_code, tax, total, status, payment_method, delivery_address, delivery_instructions) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $order->execute([
            $user['id'] ?? null, $name, $email, $phone, $totals['subtotal'], $totals['delivery'], $totals['discount'], $totals['code'] === 'STOP10' ? 'STOP10' : '', $totals['tax'], $totals['total'], 'pending', $payment,
            $address . ', ' . $city . ', ' . $postal, $notes,
        ]);
        $orderId = (int) $pdo->lastInsertId();
        $item = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, image, quantity, unit_price, total_price, options_json) VALUES (?,?,?,?,?,?,?,?)');
        foreach (cart() as $line) {
            $item->execute([$orderId, $line['product_id'], $line['name'], $line['image'], $line['quantity'], $line['unit_price'], round_money($line['unit_price'] * $line['quantity']), json_encode($line['options'])]);
        }
        $pdo->commit();
        $_SESSION['cart'] = [];
        unset($_SESSION['discount_code']);
        flash('Order #' . $orderId . ' is in the kitchen.');
        redirect('/orders.php?id=' . $orderId);
    }
}

$totals = cart_totals();
render_header('Checkout');
?>
<section class="page checkout">
  <form method="post" class="form-grid">
    <?= csrf_field() ?>
    <div class="span-2"><p class="eyebrow">Checkout</p><h1>Where should it go?</h1></div>
    <label>Name<input name="name" required value="<?= e($user['name'] ?? '') ?>"></label>
    <label>Email<input type="email" name="email" required value="<?= e($user['email'] ?? '') ?>"></label>
    <label>Phone<input name="phone" required value="<?= e($user['phone'] ?? '') ?>"></label>
    <label>City<input name="city" required></label>
    <label class="span-2">Address<input name="address" required></label>
    <label>Postal code<input name="postal_code" required></label>
    <label>Payment
      <select name="payment_method"><option value="cod">Cash on delivery</option><option value="card">Card on delivery</option></select>
    </label>
    <label class="span-2">Instructions<textarea name="instructions"></textarea></label>
    <?php if ($error): ?><p class="form-error span-2"><?= e($error) ?></p><?php endif; ?>
    <button class="btn btn-primary" type="submit">Place order</button>
  </form>
  <aside class="summary">
    <h2>Review</h2>
    <?php foreach (cart() as $line): ?><p><span><?= (int) $line['quantity'] ?> × <?= e($line['name']) ?></span><span><?= money($line['unit_price'] * $line['quantity']) ?></span></p><?php endforeach; ?>
    <p class="summary-strong"><span>Total</span><span><?= money($totals['total']) ?></span></p>
    <p class="fine">Delivery <?= money($totals['delivery']) ?> · tax <?= money($totals['tax']) ?><?php if ($totals['discount']): ?> · STOP10 -<?= money($totals['discount']) ?><?php endif; ?></p>
  </aside>
</section>
<?php render_footer();