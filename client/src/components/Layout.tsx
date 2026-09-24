import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from './Logo';
import { IconCart, IconClose, IconHome, IconMenu, IconSearch, IconUser } from './Icons';
import { CustomizeModal } from './CustomizeModal';
import { SearchModal } from './SearchModal';
import { scenePointer } from './PizzaScene';
import { cartCount, useCart } from '../store/useCart';
import { useCatalog } from '../store/useCatalog';
import { useUi } from '../store/useUi';

const links = [
  ['/', 'Home'],
  ['/menu', 'Menu'],
  ['/menu/pizza', 'Pizza'],
  ['/menu/doner', 'Doner'],
  ['/menu/deals', 'Deals'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
];

export function Layout() {
  const location = useLocation();
  const load = useCatalog((state) => state.load);
  const count = useCart((state) => cartCount(state.lines));
  const searchOpen = useUi((state) => state.searchOpen);
  const menuOpen = useUi((state) => state.menuOpen);
  const openSearch = useUi((state) => state.openSearch);
  const openMenu = useUi((state) => state.openMenu);
  const message = useUi((state) => state.message);
  const [scrolled, setScrolled] = useState(false);
  const [booting, setBooting] = useState(() => !sessionStorage.getItem('sg-booted'));
  const admin = location.pathname.startsWith('/admin');

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onMove = (event: PointerEvent) => {
      scenePointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      scenePointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);
  useEffect(() => {
    if (!booting) return;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem('sg-booted', '1');
      setBooting(false);
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [booting]);
  useEffect(() => { openMenu(false); }, [location.pathname, openMenu]);

  return (
    <div className="app-shell">
      <a className="skip" href="#main">Skip to content</a>
      <header className={scrolled ? 'site-header scrolled' : 'site-header'}>
        <div className="nav-inner">
          <NavLink to="/" className="brand-link" aria-label="STOP&GO home"><Logo /></NavLink>
          <nav className="nav-links" aria-label="Primary">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/' || to === '/menu'}>{label}</NavLink>
            ))}
          </nav>
          <div className="nav-tools">
            <button className="icon-btn" type="button" aria-label="Search" onClick={() => openSearch(true)}><IconSearch /></button>
            <NavLink className="icon-btn" to="/account" aria-label="Account"><IconUser /></NavLink>
            <NavLink className="icon-btn cart-btn" to="/cart" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`} data-cart-target>
              <IconCart />
              {count > 0 && <span className="cart-count">{count}</span>}
            </NavLink>
            <NavLink className="btn btn-primary nav-order" to="/menu">Order Now</NavLink>
            <button className="icon-btn nav-burger" type="button" aria-label="Open menu" onClick={() => openMenu(true)}><IconMenu /></button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="drawer" role="dialog" aria-label="Menu">
          <button className="icon-btn" type="button" aria-label="Close menu" onClick={() => openMenu(false)}><IconClose /></button>
          <Logo tone="dark" />
          {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => openMenu(false)}>{label}</NavLink>)}
          <NavLink className="btn btn-primary" to="/menu">Order Now</NavLink>
        </div>
      )}

      {searchOpen && <SearchModal />}
      <CustomizeModal />
      <AnimatePresence>
        {message && (
          <motion.div className="toast" role="status" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            ✓ {message}
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main" key={location.pathname} className="page-fade">
        <Outlet />
      </main>

      {!admin && <Footer />}
      {!admin && (
        <nav className="mobile-nav" aria-label="Mobile">
          <NavLink to="/" end><IconHome /><span>Home</span></NavLink>
          <NavLink to="/menu"><IconMenu /><span>Menu</span></NavLink>
          <button type="button" onClick={() => openSearch(true)}><IconSearch /><span>Search</span></button>
          <NavLink to="/cart"><IconCart /><span>Cart{count ? ` ${count}` : ''}</span></NavLink>
          <NavLink to="/account"><IconUser /><span>Account</span></NavLink>
        </nav>
      )}

      {booting && (
        <div className="boot">
          <Logo />
          <p>Fresh. Hot. Made to order.</p>
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Logo />
        <p>Bold pizza. Legendary doner. Made fresh for your next stop.</p>
      </div>
      <div>
        <h3>Visit</h3>
        <p>120 Market Street<br />Your City<br />Open 11:00 – 23:00</p>
      </div>
      <div>
        <h3>Order</h3>
        <NavLink to="/menu">Full menu</NavLink>
        <NavLink to="/build">Build your pizza</NavLink>
        <NavLink to="/menu/deals">Deals</NavLink>
      </div>
      <div>
        <h3>Kitchen</h3>
        <p>hello@stopandgo.restaurant<br />(555) 014-2026</p>
      </div>
    </footer>
  );
}
