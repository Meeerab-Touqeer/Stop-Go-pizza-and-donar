import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { FoodVisual } from './FoodVisual';
import { IconStar } from './Icons';
import { money } from '../data/options';
import { emptySelection } from '../lib/pricing';
import { useCart } from '../store/useCart';
import { useCatalog } from '../store/useCatalog';
import { useUi } from '../store/useUi';
import type { Product } from '../types';

export function ProductCard({ product }: { product: Product }) {
  const ingredients = useCatalog((state) => state.ingredients);
  const add = useCart((state) => state.add);
  const openProduct = useUi((state) => state.openProduct);

  function quickAdd(event: MouseEvent<HTMLButtonElement>) {
    const visual = event.currentTarget.closest('.food-card')?.querySelector('.card-visual') as HTMLElement | null;
    add(product, emptySelection(product), ingredients, 1, visual);
  }

  const compare = product.compareAt && product.compareAt > product.basePrice ? product.compareAt : null;

  return (
    <article className="food-card">
      <div className="card-visual">
        <FoodVisual image={product.image} name={product.name} />
        <div className="card-badges">
          {product.discountPercent > 0 && <span className="pill pill-hot">{product.discountPercent}% off</span>}
          {product.isVegetarian && <span className="pill">Veg</span>}
          {product.isSpicy && <span className="pill pill-spice">Spicy</span>}
        </div>
        {product.ingredients.length > 0 && (
          <ul className="card-ingredients">
            {product.ingredients.slice(0, 4).map((item) => <li key={item.id}>{item.name}</li>)}
          </ul>
        )}
      </div>
      <div className="card-body">
        <div className="card-top">
          <h3>{product.name}</h3>
          <span className="rating"><IconStar /> {product.rating.toFixed(1)}</span>
        </div>
        <p>{product.description}</p>
        <div className="card-meta">
          <span>{product.preparationTime} min</span>
          <span>{product.calories} kcal</span>
        </div>
        <div className="card-foot">
          <div className="price">
            {compare && <s>{money(compare)}</s>}
            <strong>{money(product.basePrice)}</strong>
          </div>
          <div className="card-actions">
            {product.builder ? (
              <Link className="btn btn-primary btn-small" to="/build">Build in 3D</Link>
            ) : (
              <>
                <button type="button" className="btn btn-ghost btn-small" onClick={() => openProduct(product.id)}>Customize</button>
                <button type="button" className="btn btn-primary btn-small" onClick={quickAdd}>Add to Cart</button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
