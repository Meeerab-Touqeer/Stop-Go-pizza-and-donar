export function AboutPage() {
  return (
    <section className="page about">
      <p className="eyebrow">The house</p>
      <h1>Fast. Fresh. Premium. Delicious.</h1>
      <p className="lede">STOP&amp;GO is a pizza and doner kitchen for people who want the meal to feel considered and the handoff to feel quick. The spit turns. The oven stays hot. You decide the rest.</p>
      <div className="about-grid">
        <img src="/food/06-kitchen.jpg" alt="Chef slicing doner beside the ingredient line" />
        <img src="/food/08-service.jpg" alt="The STOP&GO service counter" />
        <img src="/food/01-poster.jpg" alt="STOP&GO doner campaign still" />
        <img src="/food/11-hero.jpg" alt="Wrapped doner with the STOP&GO mark" />
      </div>
      <div className="about-points">
        <article><h2>Pizza</h2><p>Classic, thin, cheese burst, or stuffed. Size it, then stack the extras. The price moves with you.</p></article>
        <article><h2>Doner</h2><p>Chicken, beef, or mixed. Pita, Turkish bread, or wrap. One sauce is included. Meat and heat are optional.</p></article>
        <article><h2>The stop</h2><p>Order, track, and pick it up in the same calm interface. The kitchen sees every customization.</p></article>
      </div>
    </section>
  );
}
