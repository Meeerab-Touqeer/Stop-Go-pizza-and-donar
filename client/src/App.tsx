import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { BuilderPage } from './pages/BuilderPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TrackPage } from './pages/TrackPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { useAuth } from './store/useAuth';

function AdminRoute() {
  const user = useAuth((state) => state.user);
  if (!user) return <Navigate to="/account" replace state={{ from: '/admin' }} />;
  if (user.role !== 'admin') {
    return <section className="page empty-state"><h1>Admin access only.</h1><p>Sign in with a kitchen account to manage STOP&GO.</p></section>;
  }
  return <AdminPage />;
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="menu/:category" element={<MenuPage />} />
        <Route path="pizza" element={<Navigate to="/menu/pizza" replace />} />
        <Route path="doner" element={<Navigate to="/menu/doner" replace />} />
        <Route path="deals" element={<Navigate to="/menu/deals" replace />} />
        <Route path="build" element={<BuilderPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order/:id" element={<TrackPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="admin" element={<AdminRoute />} />
        <Route path="*" element={<section className="page empty-state"><h1>That page has left the pass.</h1></section>} />
      </Route>
    </Routes>
  );
}
