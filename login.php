<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

if (current_user()) redirect('/orders.php');
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        $error = 'Email or password is incorrect.';
    } else {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        redirect($user['role'] === 'admin' ? '/admin/index.php' : '/orders.php');
    }
}
render_header('Sign in');
?>
<section class="page account">
  <p class="eyebrow">Account</p>
  <h1>Sign in</h1>
  <form method="post" class="form-grid">
    <?= csrf_field() ?>
    <label class="span-2">Email<input type="email" name="email" required></label>
    <label class="span-2">Password<input type="password" name="password" required></label>
    <?php if ($error): ?><p class="form-error span-2"><?= e($error) ?></p><?php endif; ?>
    <button class="btn btn-primary" type="submit">Sign in</button>
  </form>
  <p class="lede">New here? <a href="/register.php">Create an account</a></p>
  <aside class="demo-card"><p>Demo admin: admin@stopandgo.com / StopGo2026!</p><p>Demo guest: guest@stopandgo.com / Guest2026!</p></aside>
</section>
<?php render_footer();