<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';
render_header('About');
?>
<section class="page about">
  <p class="eyebrow">The house</p>
  <h1>Fast. Fresh. Premium. Delicious.</h1>
  <p class="lede">STOP&amp;GO is a pizza and doner kitchen for people who want the meal to feel considered and the handoff to feel quick. The spit turns. The oven stays hot. You decide the rest.</p>
  <div class="about-grid">
    <img src="/images/1.png" alt="STOP and GO kitchen">
    <img src="/images/8.png" alt="Food on the pass">
    <img src="/images/5.png" alt="Doner">
    <img src="/images/11.png" alt="Pizza and doner">
  </div>
  <div class="about-points">
    <article><h2>Pizza</h2><p>Classic, thin, cheese burst, or stuffed. Size it, then stack the extras. The price moves with you.</p></article>
    <article><h2>Doner</h2><p>Chicken, beef, or mixed. Pita, Turkish bread, or wrap. One sauce is included. Meat and heat are optional.</p></article>
    <article><h2>The stop</h2><p>Order, track, and pick it up in the same calm interface. The kitchen sees every customization.</p></article>
  </div>
</section>
<?php render_footer();