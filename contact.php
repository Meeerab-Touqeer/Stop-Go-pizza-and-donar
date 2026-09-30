<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';
$status = '';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');
    if (strlen($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($message) < 8) {
        $error = 'Check the form and try again.';
    } else {
        $stmt = db()->prepare('INSERT INTO messages (name, email, message) VALUES (?,?,?)');
        $stmt->execute([$name, $email, $message]);
        $status = 'Message received. The kitchen will reply by email.';
    }
}
render_header('Contact');
?>
<section class="page contact">
  <div>
    <p class="eyebrow">Contact</p>
    <h1>Talk to the pass.</h1>
    <p>120 Market Street, Your City<br>Open daily, 11:00 – 23:00<br>(555) 014-2026<br>hello@stopandgo.restaurant</p>
    <img src="/images/meat-lover.png" alt="Meat lover pizza">
  </div>
  <form method="post" class="form-grid">
    <?= csrf_field() ?>
    <label>Name<input name="name" required></label>
    <label>Email<input type="email" name="email" required></label>
    <label class="span-2">Message<textarea name="message" required minlength="8"></textarea></label>
    <?php if ($error): ?><p class="form-error span-2"><?= e($error) ?></p><?php endif; ?>
    <?php if ($status): ?><p class="fine span-2"><?= e($status) ?></p><?php endif; ?>
    <button class="btn btn-primary" type="submit">Send</button>
  </form>
</section>
<?php render_footer();