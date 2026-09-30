<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['review_product'])) {
    $user = require_login();
    check_csrf();
    $productId = (int) $_POST['review_product'];
    $rating = (int) ($_POST['rating'] ?? 0);
    $comment = trim($_POST['comment'] ?? '');
    if ($rating < 1 || $rating > 5 || strlen($comment) < 4) {
        flash('Write a short review.');
        redirect('/product.php?id=' . $productId);
    }
    $stmt = db()->prepare('INSERT INTO reviews (user_id, product_id, author_name, rating, comment) VALUES (?,?,?,?,?)');
    $stmt->execute([$user['id'], $productId, $user['name'], $rating, $comment]);
    flash('Review posted.');
    redirect('/product.php?id=' . $productId);
}

$user = require_login();
$orderId = (int) ($_GET['id'] ?? 0);
if ($orderId) {
    $stmt = db()->prepare('SELECT * FROM orders WHERE id = ? AND (user_id = ? OR ? = "admin")');
    $stmt->execute([$orderId, $user['id'], $user['role']]);
    $order = $stmt->fetch();
    if (!$order) {
        flash('Order not found.');
        redirect('/orders.php');
    }
    $items = db()->prepare('SELECT * FROM order_items WHERE order_id = ?');
    $items->execute([$orderId]);
    $lines = $items->fetchAll();
    $steps = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    $legacy = ['received' => 'pending', 'cooking' => 'preparing', 'out_for_delivery' => 'ready', 'delivered' => 'completed'];
    $shown = $legacy[$order['status']] ?? $order['status'];
    $current = array_search($shown, $steps, true);
    render_header('Order ' . $orderId);
    ?>
    <section class="page">
      <p class="eyebrow">Order #<?= (int) $order['id'] ?></p>
      <h1><?= $shown === 'pending' ? 'Order confirmed' : e(ucwords(str_replace('_', ' ', $shown))) ?></h1>
      <p class="lede">ETA about 35 minutes from <?= e($order['created_at']) ?>.</p>
      <ol class="timeline">
        <?php foreach ($steps as $index => $step): ?>
          <li class="<?= $current !== false && $index <= $current ? 'done' : '' ?> <?= $step === $shown ? 'current' : '' ?>"><i></i><span><?= e(ucwords(str_replace('_', ' ', $step))) ?></span></li>
        <?php endforeach; ?>
      </ol>
      <div class="track-columns">
        <ul class="cart-list">
          <?php foreach ($lines as $line): ?>
            <li><img src="/<?= e($line['image']) ?>" alt=""><div><h2><?= e($line['product_name']) ?></h2><p class="fine"><?php foreach (json_decode($line['options_json'], true) ?: [] as $option) echo e($option['name']) . ' · '; ?></p></div><strong><?= money((float) $line['total_price']) ?></strong></li>
          <?php endforeach; ?>
        </ul>
        <aside class="summary">
          <p><span>Address</span></p><p><?= e($order['delivery_address']) ?></p>
          <p><span>Payment</span><span><?= e($order['payment_method']) ?></span></p>
          <p class="summary-strong"><span>Total</span><span><?= money((float) $order['total']) ?></span></p>
        </aside>
      </div>
    </section>
    <?php
    render_footer();
    exit;
}

$stmt = db()->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
$stmt->execute([$user['id']]);
$orders = $stmt->fetchAll();
render_header('Orders');
?>
<section class="page">
  <p class="eyebrow"><?= e($user['name']) ?></p>
  <h1>Your orders</h1>
  <p><a href="/logout.php">Sign out</a></p>
  <?php if (!$orders): ?><p class="empty-state">No orders yet. <a href="/menu.php">Order something.</a></p><?php endif; ?>
  <div class="table-wrap"><table>
    <tr><th>Order</th><th>Status</th><th>Total</th><th>When</th></tr>
    <?php foreach ($orders as $order): ?>
      <tr><td><a href="/orders.php?id=<?= (int) $order['id'] ?>">#<?= (int) $order['id'] ?></a></td><td><?= e($order['status']) ?></td><td><?= money((float) $order['total']) ?></td><td><?= e($order['created_at']) ?></td></tr>
    <?php endforeach; ?>
  </table></div>
</section>
<?php render_footer();