<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/../includes/layout.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $role = $_POST['role'] === 'admin' ? 'admin' : 'customer';
    $stmt = db()->prepare('UPDATE users SET name = ?, phone = ?, role = ? WHERE id = ?');
    $stmt->execute([trim($_POST['name'] ?? ''), trim($_POST['phone'] ?? ''), $role, (int) $_POST['id']]);
    flash('Customer updated.');
    redirect('/admin/customers.php');
}

$users = db()->query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC')->fetchAll();
render_header('Customers');
?>
<div class="admin">
  <aside>
    <a href="/admin/index.php">Dashboard</a>
    <a href="/admin/products.php">Products</a>
    <a href="/admin/orders.php">Orders</a>
    <a href="/admin/customers.php">Customers</a>
  </aside>
  <div class="admin-main">
    <h1>Customers</h1>
    <div class="table-wrap"><table>
      <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th></th></tr>
      <?php foreach ($users as $person): ?>
        <tr>
          <form method="post"><?= csrf_field() ?><input type="hidden" name="id" value="<?= (int) $person['id'] ?>">
            <td><input name="name" value="<?= e($person['name']) ?>"></td>
            <td><?= e($person['email']) ?></td>
            <td><input name="phone" value="<?= e($person['phone']) ?>"></td>
            <td><select name="role"><option value="customer" <?= $person['role'] === 'customer' ? 'selected' : '' ?>>customer</option><option value="admin" <?= $person['role'] === 'admin' ? 'selected' : '' ?>>admin</option></select></td>
            <td><button type="submit">Save</button></td>
          </form>
        </tr>
      <?php endforeach; ?>
    </table></div>
  </div>
</div>
<?php render_footer(true);