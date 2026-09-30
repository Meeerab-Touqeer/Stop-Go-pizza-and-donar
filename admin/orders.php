<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/../includes/layout.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $status = $_POST['status'] ?? '';
    $allowed = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled', 'received', 'cooking', 'out_for_delivery', 'delivered'];
    if (in_array($status, $allowed, true)) {
        $stmt = db()->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->execute([$status, (int) $_POST['id']]);
        flash('Order updated.');
    }
    redirect('/admin/orders.php');
}

$orders = db()->query('SELECT * FROM orders ORDER BY created_at DESC')->fetchAll();
render_header('Orders');
?>
<div class="admin">
  <aside>
    <a href="/admin/index.php">Dashboard</a>
    <a href="/admin/products.php">Products</a>
    <a href="/admin/orders.php">Orders</a>
    <a href="/admin/customers.php">Customers</a>
  </aside>
  <div class="admin-main">
    <h1>Orders</h1>
    <div class="table-wrap"><table>
      <tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr>
      <?php foreach ($orders as $order): ?>
        <tr>
          <td>#<?= (int) $order['id'] ?><small><?= e($order['created_at']) ?></small></td>
          <td><?= e($order['customer_name']) ?><small><?= e($order['delivery_address']) ?></small></td>
          <td><?= money((float) $order['total']) ?></td>
          <td><?= e($order['payment_method']) ?></td>
          <td>
            <form method="post"><?= csrf_field() ?><input type="hidden" name="id" value="<?= (int) $order['id'] ?>">
              <select name="status">
                <?php foreach (['pending','confirmed','preparing','ready','completed','cancelled'] as $status): ?>
                  <option value="<?= $status ?>" <?= $order['status'] === $status ? 'selected' : '' ?>><?= $status ?></option>
                <?php endforeach; ?>
              </select>
              <button type="submit">Save</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
    </table></div>
  </div>
</div>
<?php render_footer(true);