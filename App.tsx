import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import CustomCake from './pages/CustomCake';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';
import { useStore } from './context/StoreContext';
import { UserRole } from './types';

// Role-based Route Protection
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStore();
  if (!user || user.role !== UserRole.ADMIN) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/custom-cake" element={<CustomCake />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
    </Routes>
  </Layout>
);

const App: React.FC = () => {
  return (
    <Router>
      <StoreProvider>
        <AppRoutes />
      </StoreProvider>
    </Router>
  );
};

export default App;