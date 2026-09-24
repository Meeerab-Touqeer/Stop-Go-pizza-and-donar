import { useMemo } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useCatalog } from '../store/useCatalog';

export function MenuPage() {
  const { category: slug } = useParams();
  const products = useCatalog((state) => state.products);
  const categories = useCatalog((state) => state.categories);
  const status = useCatalog((state) => state.status);
  const active = categories.find((category) => category.slug === slug);
  const list = useMemo(() => products.filter((product) => !active || product.categoryId === active.id), [products, active]);

  return (
    <section className="page">
      <div className="page-intro">
        <p className="eyebrow">The menu</p>
        <h1>{active ? active.name : 'Everything worth stopping for'}</h1>
        <p>{active?.description || 'Pizza, doner, and the plates that belong next to them. Customize anything with a crust, a spit, or a sauce.'}</p>
      </div>
      <div className="filter-row">
        <NavLink to="/menu" end>All</NavLink>
        {categories.map((category) => (
          <NavLink key={category.id} to={`/menu/${category.slug}`}>{category.name}</NavLink>
        ))}
      </div>
      {status === 'loading' && <div className="skeleton-grid">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="skeleton" />)}</div>}
      {status === 'error' && <p className="empty-state">The kitchen list did not load. Check that the API is running and refresh.</p>}
      {status === 'ready' && list.length === 0 && <p className="empty-state">Nothing in this category yet.</p>}
      <div className="product-grid">
        {list.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
