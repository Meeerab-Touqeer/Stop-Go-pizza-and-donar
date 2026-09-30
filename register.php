<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

if (current_user()) redirect('/orders.php');
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $name = trim($_POST['name'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    if (strlen($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
        $error = 'Check the form and try again.';
    } else {
        $exists = db()->prepare('SELECT id FROM users WHERE email = ?');
        $exists->execute([$email]);
        if ($exists->fetch()) {
            $error = 'An account with that email already exists.';
        } else {
            $insert = db()->prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?,?,?,?,?)');
            $insert->execute([$name, $email, $phone, password_hash($password, PASSWORD_BCRYPT), 'customer']);
            $_SESSION['user_id'] = (int) db()->lastInsertId();
            flash('Welcome to STOP&GO.');
            redirect('/orders.php');
        }
    }
}
render_header('Create account');
?>
<section class="page account">
  <p class="eyebrow">Account</p>
  <h1>Create an account</h1>
  <form method="post" class="form-grid">
    <?= csrf_field() ?>
    <label>Name<input name="name" required minlength="2"></label>
    <label>Phone<input name="phone"></label>
    <label class="span-2">Email<input type="email" name="email" required></label>
    <label class="span-2">Password<input type="password" name="password" required minlength="8"></label>
    <?php if ($error): ?><p class="form-error span-2"><?= e($error) ?></p><?php endif; ?>
    <button class="btn btn-primary" type="submit">Register</button>
  </form>
  <p class="lede">Already have an account? <a href="/login.php">Sign in</a></p>
</section>
<?php render_footer();