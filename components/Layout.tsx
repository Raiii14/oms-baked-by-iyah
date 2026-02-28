import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Menu, X, ShoppingCart, User as UserIcon, LogOut, Bell, Settings } from 'lucide-react';
import { UserRole } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, cart } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Cakes', path: '/custom-cake' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-16">
            {/* Left Column: Logo */}
            <div className="flex items-center justify-start space-x-4">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="font-bold text-2xl text-rose-500 font-['Poppins']">Baked by Iyah</span>
              </Link>
              {user?.role === UserRole.ADMIN && (
                <Link to="/admin" className="hidden lg:block text-amber-600 font-medium hover:text-amber-700 whitespace-nowrap text-sm border border-amber-200 bg-amber-50 px-3 py-1 rounded-full transition-colors">
                  Dashboard
                </Link>
              )}
            </div>
            
            {/* Center Column: Nav Links */}
            <div className="hidden lg:flex items-center justify-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${location.pathname === link.path ? 'text-rose-500 font-medium' : 'text-stone-600 hover:text-rose-400'} transition-colors whitespace-nowrap`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Column: Icons & User Actions */}
            <div className="hidden lg:flex items-center justify-end space-x-4">
              {/* Notification Icon */}
              <button className="p-2 text-stone-600 hover:text-rose-500 relative">
                <Bell className="h-5 w-5" />
                {/* Example Badge */}
                {/* <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full"></span> */}
              </button>

              <Link to="/cart" className="relative p-2 text-stone-600 hover:text-rose-500">
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-rose-500 rounded-full">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center space-x-2">
                  <Link to="/profile" className="p-2 text-stone-600 hover:text-rose-500" title="Profile Settings">
                    <Settings className="h-5 w-5" />
                  </Link>
                  <div className="text-sm text-stone-600 font-medium whitespace-nowrap truncate max-w-[100px] xl:max-w-[150px]">
                    Hi, {user.name}
                  </div>
                  <button onClick={handleLogout} className="p-2 text-stone-500 hover:text-rose-500" title="Logout">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center space-x-1 text-stone-600 hover:text-rose-500 whitespace-nowrap">
                  <UserIcon className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button (Absolute positioned or handled via flex in mobile view if needed, but grid works well) */}
            <div className="flex items-center lg:hidden justify-end col-start-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-stone-400 hover:text-stone-500 hover:bg-stone-100 focus:outline-none"
              >
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-stone-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user && (
                <div className="px-3 py-2 text-base font-medium text-rose-500 border-b border-stone-100 mb-2">
                  Hi, {user.name}
                </div>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-rose-500 hover:bg-stone-50"
                >
                  {link.name}
                </Link>
              ))}
               {user?.role === UserRole.ADMIN && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-amber-600 hover:bg-stone-50">
                  Dashboard
                </Link>
              )}
              <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-rose-500 hover:bg-stone-50">
                Cart ({cart.length})
              </Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-rose-500 hover:bg-stone-50">
                    Profile Settings
                  </Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-rose-500 hover:bg-stone-50">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-rose-500 hover:bg-stone-50">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-stone-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-bold text-lg mb-2">Baked by Iyah</p>
          <p className="text-stone-400 text-sm">Made with love in Obando, Bulacan</p>
          <p className="text-stone-500 text-xs mt-4">© {new Date().getFullYear()} Baked by Iyah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};