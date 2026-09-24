import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PizzaScene } from '../components/PizzaScene';
import { FoodVisual } from '../components/FoodVisual';
import { ProductCard } from '../components/ProductCard';
import { money } from '../data/options';
import { useCatalog } from '../store/useCatalog';

gsap.registerPlugin(ScrollTrigger);

const story = [
  { src: '/food/06-kitchen.jpg', kicker: 'Fresh ingredients', title: 'Prepped in sight of the pass.', copy: 'Lettuce, tomato, onion, pickles, and sauces stay cold until the wrap is called.' },
  { src: '/food/07-craft.jpg', kicker: 'Doner, sliced', title: 'Shaved from the spit, never scooped.', copy: 'The meat meets the bread in the same minute it leaves the knife.' },
  { src: '/food/02-wrap-steam.jpg', kicker: 'Sauce', title: 'Garlic, chili, and the house finish.', copy: 'Two sauces, poured to order, so the wrap stays crisp on the way out.' },
  { src: '/food/03-wrap-fire.jpg', kicker: 'The fire', title: 'Heat you can taste.', copy: 'Char on the edges, juice in the center. That is the STOP&GO bite.' },
  { src: '/food/05-wrap-stand.jpg', kicker: 'Packaging', title: 'Wrapped hot. Held easily.', copy: 'The cone is the restaurant in your hand. Pizza leaves in the same rush, boxed and blistered.' },
  { src: '/food/10-hand.jpg', kicker: 'Keep going', title: 'Made for the next stop.', copy: 'Eat it here, or take it with you. The kitchen does not slow the handoff.' },
];

export function HomePage() {
  const products = useCatalog((state) => state.products);
  const reviews = useCatalog((state) => state.reviews);
  const status = useCatalog((state) => state.status);
  const featured = products.filter((product) => product.featured);
  const deals = products.filter((product) => product.category === 'Deals');
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-line', { y: 28, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out', delay: 0.05 });
      gsap.utils.toArray<HTMLElement>('.story-frame').forEach((frame) => {
        gsap.from(frame, {
          scrollTrigger: { trigger: frame, start: 'top 82%' },
          y: 48,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
        });
      });
    }, root);
    const failsafe = window.setTimeout(() => {
      gsap.set('.hero-line, .story-frame', { opacity: 1, y: 0, clearProps: 'opacity,transform' });
    }, 1400);
    return () => {
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={root}>
      <section className="hero">
        <div className="hero-copy">
          <p className="badge-live hero-line"><i /> Fresh • Hot • Made to Order</p>
          <p className="eyebrow hero-line">Pizza &amp; Doner</p>
          <h1 className="hero-line">Stop. <em>Taste.</em> Go.</h1>
          <p className="hero-support hero-line">Bold Pizza. Legendary Doner. Made Fresh for Your Next Stop.</p>
          <p className="hero-sub hero-line">Freshly baked pizza and perfectly seasoned doner, crafted your way.</p>
          <div className="hero-actions hero-line">
            <Link className="btn btn-primary" to="/menu">Order Now</Link>
            <Link className="btn btn-ghost" to="/menu">Explore Menu</Link>
          </div>
          <dl className="hero-metrics hero-line">
            <div><dt>12 min</dt><dd>Average handoff</dd></div>
            <div><dt>4.9</dt><dd>Guest rating</dd></div>
            <div><dt>Made here</dt><dd>Pizza &amp; doner</dd></div>
          </dl>
        </div>
        <div className="hero-stage" aria-hidden="true">
          <PizzaScene />
        </div>
        <figure className="hero-photo">
          <img src="/food/10-hand.jpg" alt="Chicken doner wrap held over butcher paper" />
          <figcaption>Legendary doner, sliced to order</figcaption>
        </figure>
      </section>

      <div className="marquee" aria-hidden="true">
        <div>
          {Array.from({ length: 2 }).map((_, index) => (
            <p key={index}>Pepperoni · Chicken Doner · Cheese Burst · Beef Doner · Chili · Basil · Garlic Sauce · Loaded Fries · </p>
          ))}
        </div>
      </div>

      <section className="section signatures">
        <div className="section-head">
          <p className="eyebrow">The ones people come back for</p>
          <h2>STOP&amp;GO Signatures</h2>
        </div>
        {status === 'error' && <p className="empty-inline">The menu could not load. Refresh in a moment.</p>}
        <div className="signature-grid">
          {featured.map((product) => (
            <Link key={product.id} to={product.builder ? '/build' : `/menu/${product.category.toLowerCase()}`} className="signature-card">
              <FoodVisual image={product.image} name={product.name} />
              <div>
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <strong>{money(product.basePrice)}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section paper story">
        <div className="story-intro">
          <p className="eyebrow">The kitchen</p>
          <h2>Good food. Good mood. Keep going.</h2>
          <p>Dough hits the oven. Meat turns on the spit. Sauce is finished at the pass. STOP&amp;GO is built for people who want both a proper meal and a fast handoff.</p>
        </div>
        <div className="story-grid">
          {story.map((frame) => (
            <article key={frame.src} className="story-frame">
              <img src={frame.src} alt={frame.title} />
              <div>
                <span>{frame.kicker}</span>
                <h3>{frame.title}</h3>
                <p>{frame.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Worth stopping for</p>
          <h2>Deals</h2>
        </div>
        <div className="deal-grid">
          {deals.map((deal) => (
            <article key={deal.id} className="deal-card">
              <span className="pill pill-hot">{deal.discountPercent}% off</span>
              <h3>{deal.name}</h3>
              <p>{deal.description}</p>
              <div className="price">
                {deal.compareAt && <s>{money(deal.compareAt)}</s>}
                <strong>{money(deal.basePrice)}</strong>
              </div>
              <Link className="btn btn-primary" to="/menu/deals">Order this deal</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="build-band">
        <div>
          <p className="eyebrow">Optional, and a little obsessive</p>
          <h2>Build your pizza</h2>
          <p>Watch pepperoni, mushrooms, cheese, and jalapeños land on a pie before it ever reaches the oven.</p>
          <Link className="btn btn-primary" to="/build">Open the builder</Link>
        </div>
        <img src="/food/08-service.jpg" alt="Doner being sliced in the STOP&GO kitchen" />
      </section>

      <section className="section paper">
        <div className="section-head">
          <p className="eyebrow">From the counter</p>
          <h2>A few words</h2>
        </div>
        <div className="review-grid">
          {reviews.map((review) => (
            <blockquote key={review.id}>
              <p>“{review.comment}”</p>
              <footer>{review.authorName}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Start anywhere</p>
          <h2>On the menu tonight</h2>
        </div>
        <div className="product-grid">
          {products.filter((product) => !product.builder).slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
}
