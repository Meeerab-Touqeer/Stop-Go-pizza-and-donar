import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FoodVisual } from './FoodVisual';
import { IconClose } from './Icons';
import { money } from '../data/options';
import { useCatalog } from '../store/useCatalog';
import { useUi } from '../store/useUi';

export function SearchModal() {
  const [query, setQuery] = useState('');
  const products = useCatalog((state) => state.products);
  const close = useUi((state) => state.openSearch);
  const openProduct = useUi((state) => state.openProduct);
  const navigate = useNavigate();
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products.slice(0, 6);
    return products.filter((product) => `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(needle)).slice(0, 8);
  }, [products, query]);

  return (
    <div className="modal-backdrop" onMouseDown={() => close(false)}>
      <div className="search-modal" role="dialog" aria-label="Search the menu" onMouseDown={(event) => event.stopPropagation()}>
        <input autoFocus placeholder="Search pizza, doner, deals..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <button className="icon-btn" type="button" aria-label="Close search" onClick={() => close(false)}><IconClose /></button>
        <ul>
          {results.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => {
                  close(false);
                  if (product.builder) navigate('/build');
                  else openProduct(product.id);
                }}
              >
                <FoodVisual image={product.image} name="" />
                <span>
                  <strong>{product.name}</strong>
                  <em>{product.category}</em>
                </span>
                <b>{money(product.basePrice)}</b>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="empty-inline">Nothing matches that search.</li>}
        </ul>
      </div>
    </div>
  );
}
