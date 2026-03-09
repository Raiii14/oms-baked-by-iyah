import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { useStore } from './context/StoreContext';
import { UserRole } from './types';

// Skeleton fallbacks
import HomeSkeleton from './components/skeletons/HomeSkeleton';
import MenuSkeleton from './components/skeletons/MenuSkeleton';
import CakeSkeleton from './components/skeletons/CakeSkeleton';
import CartSkeleton from './components/skeletons/CartSkeleton';
import CheckoutSkeleton from './components/skeletons/CheckoutSkeleton';
import ProfileSkeleton from './components/skeletons/ProfileSkeleton';
import AdminSkeleton from './components/skeletons/AdminSkeleton';
import AuthSkeleton from './components/skeletons/AuthSkeleton';
import ContactSkeleton from './components/skeletons/ContactSkeleton';

// Lazy-loaded pages — each page becomes a separate JS chunk
const Home = lazy(() => import('./pages/Home'));
const Menu = lazy(() => import('./pages/Menu'));
const Cake = lazy(() => import('./pages/Cake'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const Contact = lazy(() => import('./pages/Contact'));

// Role-based Route Protection
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useStore();
  if (isLoading) return <AdminSkeleton />;
  if (!user || user.role !== UserRole.ADMIN) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Auth routes — outside Layout so nav/footer are hidden and full-bleed works */}
    <Route
      path="/login"
      element={
        <Suspense fallback={<AuthSkeleton />}>
          <Auth mode="login" />
        </Suspense>
      }
    />
    <Route
      path="/register"
      element={
        <Suspense fallback={<AuthSkeleton />}>
          <Auth mode="register" />
        </Suspense>
      }
    />

    {/* All other routes use the standard Layout (nav + footer) */}
    <Route
      path="*"
      element={
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<HomeSkeleton />}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="/menu"
              element={
                <Suspense fallback={<MenuSkeleton />}>
                  <Menu />
                </Suspense>
              }
            />
            <Route
              path="/custom-cake"
              element={
                <Suspense fallback={<CakeSkeleton />}>
                  <Cake />
                </Suspense>
              }
            />
            <Route
              path="/cart"
              element={
                <Suspense fallback={<CartSkeleton />}>
                  <Cart />
                </Suspense>
              }
            />
            <Route
              path="/checkout"
              element={
                <Suspense fallback={<CheckoutSkeleton />}>
                  <Checkout />
                </Suspense>
              }
            />
            <Route
              path="/profile"
              element={
                <Suspense fallback={<ProfileSkeleton />}>
                  <Profile />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Suspense fallback={<AdminSkeleton />}>
                    <AdminDashboard />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <Suspense fallback={<ContactSkeleton />}>
                  <Contact />
                </Suspense>
              }
            />
          </Routes>
        </Layout>
      }
    />
  </Routes>
);

const App: React.FC = () => {
  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <StoreProvider>
        <AppRoutes />
      </StoreProvider>
    </Router>
  );
};

export default App;