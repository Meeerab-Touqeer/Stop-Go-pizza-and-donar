<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/../includes/layout.php';
require_admin();

function save_upload(string $current): string
{
    if (empty($_FILES['image']['tmp_name']) || !is_uploaded_file($_FILES['image']['tmp_name'])) {
        return $current;
    }
    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)) {
        return $current;
    }
    $relative = 'uploads/' . bin2hex(random_bytes(8)) . '.' . $ext;
    $dir = dirname(__DIR__) . '/uploads';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    move_uploaded_file($_FILES['image']['tmp_name'], dirname(__DIR__) . '/' . $relative);
    return $relative;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $action = $_POST['action'] ?? 'save';
    if ($action === 'delete') {
        $stmt = db()->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([(int) $_POST['id']]);
        flash('Product removed.');
        redirect('/admin/products.php');
    }
    $id = (int) ($_POST['id'] ?? 0);
    $current = '';
    if ($id) {
        $existing = db()->prepare('SELECT image FROM products WHERE id = ?');
        $existing->execute([$id]);
        $current = (string) $existing->fetchColumn();
    }
    $image = save_upload($current);
    $fields = [
        (int) $_POST['category_id'], trim($_POST['name'] ?? ''), trim($_POST['description'] ?? ''),
        (float) $_POST['base_price'], $image, isset($_POST['is_available']) ? 1 : 0,
        $_POST['customizer'] ?? 'simple', isset($_POST['featured']) ? 1 : 0,
    ];
    if ($id) {
        $stmt = db()->prepare('UPDATE products SET category_id=?, name=?, description=?, base_price=?, image=?, is_available=?, customizer=?, featured=? WHERE id=?');
        $stmt->execute([...$fields, $id]);
    } else {
        $stmt = db()->prepare('INSERT INTO products (category_id, name, description, base_price, image, is_available, customizer, featured) VALUES (?,?,?,?,?,?,?,?)');
        $stmt->execute($fields);
    }
    flash('Product saved.');
    redirect('/admin/products.php');
}

$categories = db()->query('SELECT * FROM categories ORDER BY name')->fetchAll();
$products = db()->query('SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.id DESC')->fetchAll();
render_header('Products');
?>
<div class="admin">
  <aside>
    <a href="/admin/index.php">Dashboard</a>
    <a href="/admin/products.php">Products</a>
    <a href="/admin/orders.php">Orders</a>
    <a href="/admin/customers.php">Customers</a>
  </aside>
  <div class="admin-main">
    <h1>Menu</h1>
    <form class="admin-form" method="post" enctype="multipart/form-data">
      <?= csrf_field() ?>
      <h2>Add a product</h2>
      <label>Category<select name="category_id"><?php foreach ($categories as $category): ?><option value="<?= (int) $category['id'] ?>"><?= e($category['name']) ?></option><?php endforeach; ?></select></label>
      <label>Name<input name="name" required></label>
      <label class="span-2">Description<textarea name="description" required></textarea></label>
      <label>Price<input type="number" step="0.01" name="base_price" required></label>
      <label>Photo<input type="file" name="image" accept="image/*"></label>
      <label>Customizer<select name="customizer"><option value="simple">Simple</option><option value="pizza">Pizza</option><option value="doner">Doner</option></select></label>
      <label class="check"><input type="checkbox" name="is_available" checked> Available</label>
      <label class="check"><input type="checkbox" name="featured"> Featured</label>
      <button class="btn btn-primary" type="submit">Save</button>
    </form>
    <div class="table-wrap"><table>
      <tr><th>Item</th><th>Category</th><th>Price</th><th></th></tr>
      <?php foreach ($products as $product): ?>
        <tr>
          <td><?= e($product['name']) ?><?php if (!$product['is_available']): ?><small>Hidden</small><?php endif; ?></td>
          <td><?= e($product['category_name']) ?></td>
          <td><?= money((float) $product['base_price']) ?></td>
          <td><form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= (int) $product['id'] ?>"><button type="submit">Delete</button></form></td>
        </tr>
      <?php endforeach; ?>
    </table></div>
  </div>
</div>
<?php render_footer(true);