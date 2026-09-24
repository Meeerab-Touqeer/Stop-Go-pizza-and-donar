import { useEffect, useMemo, useState } from 'react';
import { FoodVisual } from './FoodVisual';
import { IconClose, IconStar } from './Icons';
import {
  DONER_BREADS,
  DONER_SAUCES,
  DONER_SIZES,
  DONER_TYPES,
  PIZZA_CHEESE,
  PIZZA_CRUSTS,
  PIZZA_SIZES,
  money,
} from '../data/options';
import { emptySelection, extrasFor, quote } from '../lib/pricing';
import { useCart } from '../store/useCart';
import { useCatalog } from '../store/useCatalog';
import { useUi } from '../store/useUi';
import type { Selection } from '../types';

export function CustomizeModal() {
  const productId = useUi((state) => state.productId);
  const editingLineId = useUi((state) => state.editingLineId);
  const close = useUi((state) => state.closeProduct);
  const product = useCatalog((state) => state.products.find((item) => item.id === productId));
  const ingredients = useCatalog((state) => state.ingredients);
  const line = useCart((state) => state.lines.find((item) => item.lineId === editingLineId));
  const add = useCart((state) => state.add);
  const [selection, setSelection] = useState<Selection>(emptySelection());
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setSelection(line?.selection || emptySelection(product));
    setQuantity(line?.quantity || 1);
  }, [product, line]);

  useEffect(() => {
    if (!productId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [productId, close]);

  const extras = useMemo(() => (product ? extrasFor(product, ingredients) : []), [product, ingredients]);
  if (!product) return null;
  const quoted = quote(product, selection, ingredients);

  function patch(partial: Partial<Selection>) {
    setSelection((current) => ({ ...current, ...partial }));
  }

  function toggleExtra(id: string) {
    patch({
      extraIds: selection.extraIds.includes(id)
        ? selection.extraIds.filter((item) => item !== id)
        : [...selection.extraIds, id],
    });
  }

  function toggleRemoved(name: string) {
    patch({
      removed: selection.removed.includes(name)
        ? selection.removed.filter((item) => item !== name)
        : [...selection.removed, name],
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={close}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="customize-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-btn modal-close" type="button" onClick={close} aria-label="Close"><IconClose /></button>
        <div className="modal-visual">
          <FoodVisual image={product.image} name={product.name} />
        </div>
        <div className="modal-panel">
          <p className="eyebrow">{product.category}</p>
          <h2 id="customize-title">{product.name}</h2>
          <p className="lede">{product.description}</p>
          <div className="spec-row">
            <span className="rating"><IconStar /> {product.rating.toFixed(1)}</span>
            <span>{product.calories} kcal</span>
            <span>{product.preparationTime} min</span>
            <span>Base {money(product.basePrice)}</span>
          </div>
          {product.allergens.length > 0 && <p className="allergens">Allergens: {product.allergens.join(', ')}</p>}

          {product.customizer === 'pizza' && (
            <>
              <Choices label="Size" options={PIZZA_SIZES} value={selection.size} onChange={(size) => patch({ size })} />
              <Choices label="Crust" options={PIZZA_CRUSTS} value={selection.crust} onChange={(crust) => patch({ crust })} />
              <Choices label="Cheese" options={PIZZA_CHEESE} value={selection.cheese} onChange={(cheese) => patch({ cheese })} />
            </>
          )}
          {product.customizer === 'doner' && (
            <>
              <Choices
                label="Doner Type"
                options={DONER_TYPES.map((type) => ({
                  ...type,
                  price: type.price - (DONER_TYPES.find((item) => item.id === (product.defaults.type || 'chicken'))?.price || 0),
                }))}
                value={selection.type}
                onChange={(type) => patch({ type })}
              />
              <Choices label="Bread" options={DONER_BREADS} value={selection.bread} onChange={(bread) => patch({ bread })} />
              <Choices label="Size" options={DONER_SIZES} value={selection.size} onChange={(size) => patch({ size })} />
              <Choices label="Sauce" options={DONER_SAUCES} value={selection.sauce} onChange={(sauce) => patch({ sauce })} />
            </>
          )}

          {product.ingredients.length > 0 && (
            <fieldset className="choice-block">
              <legend>Ingredients</legend>
              <div className="choice-row">
                {product.ingredients.map((item) => {
                  const off = selection.removed.includes(item.name);
                  return (
                    <button type="button" key={item.id} className={off ? 'choice' : 'choice on'} onClick={() => toggleRemoved(item.name)}>
                      <span>{off ? `Add ${item.name}` : item.name}</span>
                      <span>{off ? 'Removed' : 'Included'}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {extras.length > 0 && product.customizer !== 'simple' && (
            <fieldset className="choice-block">
              <legend>Extra Ingredients</legend>
              <div className="choice-row">
                {extras.map((item) => {
                  const on = selection.extraIds.includes(item.id);
                  return (
                    <button type="button" key={item.id} className={on ? 'choice on' : 'choice'} onClick={() => toggleExtra(item.id)}>
                      <span>{item.name}</span>
                      <span>+{money(item.price)}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="modal-buy">
            <div className="qty">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))} aria-label="Increase quantity">+</button>
            </div>
            <div className="modal-total">
              <span>Total</span>
              <strong>{money(quoted.unitPrice * quantity)}</strong>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={(event) => {
                const visual = document.querySelector('.modal-visual') as HTMLElement | null;
                add(product, selection, ingredients, quantity, visual || event.currentTarget, editingLineId || undefined);
                close();
              }}
            >
              {editingLineId ? 'Update order' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Choices({ label, options, value, onChange }: { label: string; options: { id: string; name: string; price: number }[]; value: string; onChange: (id: string) => void }) {
  return (
    <fieldset className="choice-block">
      <legend>{label}</legend>
      <div className="choice-row">
        {options.map((option) => (
          <button type="button" key={option.id} className={value === option.id ? 'choice on' : 'choice'} onClick={() => onChange(option.id)}>
            <span>{option.name}</span>
            <span>{option.price > 0 ? `+${money(option.price)}` : option.price < 0 ? money(option.price) : 'Included'}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
