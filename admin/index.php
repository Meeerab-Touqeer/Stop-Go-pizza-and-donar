<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/../includes/layout.php';
$admin = require_admin();

$todayOrders = (int) db()->query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE() AND status <> 'cancelled'")->fetchColumn();
$todayRevenue = (float) db()->query("SELECT COALESCE(SUM(total),0) FROM orders WHERE DATE(created_at) = CURDATE() AND status <> 'cancelled'")->fetchColumn();
$customers = (int) db()->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn();
$messages = db()->query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 20')->fetchAll();
$reviews = db()->query('SELECT r.*, p.name AS product_name FROM reviews r JOIN products p ON p.id = r.product_id ORDER BY r.created_at DESC LIMIT 20')->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete_review') {
    check_csrf();
    $stmt = db()->prepare('DELETE FROM reviews WHERE id = ?');
    $stmt->execute([(int) $_POST['id']]);
    flash('Review removed.');
    redirect('/admin/index.php');
}

render_header('Admin');
?>
<div class="admin">
  <aside>
    <a href="/admin/index.php">Dashboard</a>
    <a href="/admin/products.php">Products</a>
    <a href="/admin/orders.php">Orders</a>
    <a href="/admin/customers.php">Customers</a>
    <a href="/">View site</a>
    <a href="/logout.php">Sign out</a>
  </aside>
  <div class="admin-main">
    <h1>Dashboard</h1>
    <div class="stat-grid">
      <article><span>Today's orders</span><strong><?= $todayOrders ?></strong></article>
      <article><span>Today's revenue</span><strong><?= money($todayRevenue) ?></strong></article>
      <article><span>Customers</span><strong><?= $customers ?></strong></article>
      <article><span>Signed in</span><strong><?= e($admin['name']) ?></strong></article>
    </div>
    <h2>Messages</h2>
    <ul class="admin-list"><?php foreach ($messages as $message): ?><li><strong><?= e($message['name']) ?></strong> <?= e($message['email']) ?><p><?= e($message['message']) ?></p></li><?php endforeach; ?></ul>
    <h2>Reviews</h2>
    <ul class="admin-list">
      <?php foreach ($reviews as $review): ?>
        <li><strong><?= e($review['author_name']) ?></strong> on <?= e($review['product_name']) ?> · <?= (int) $review['rating'] ?>/5<p><?= e($review['comment']) ?></p>
          <form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="delete_review"><input type="hidden" name="id" value="<?= (int) $review['id'] ?>"><button type="submit">Delete</button></form>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</div>
<?php render_footer(true);