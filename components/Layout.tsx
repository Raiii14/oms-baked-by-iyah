import React, { useState, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Menu, X, ShoppingCart, User as UserIcon, LogOut, Bell, Settings } from 'lucide-react';
import { UserRole } from '../types';
import { NotificationToast, AppToast, getNotifConfig } from './NotificationToast';

// Preload a page chunk on nav-link hover to eliminate skeleton flash on navigation.
// Each entry maps a route path -> dynamic import for its page module.
const preloadMap: Record<string, () => Promise<unknown>> = {
  '/':            () => import('../pages/Home'),
  '/menu':        () => import('../pages/Menu'),
  '/custom-cake': () => import('../pages/Cake'),
  '/cart':        () => import('../pages/Cart'),
  '/checkout':    () => import('../pages/Checkout'),
  '/profile':     () => import('../pages/Profile'),
  '/admin':       () => import('../pages/AdminDashboard'),
  '/contact':     () => import('../pages/Contact'),
  '/login':       () => import('../pages/Auth'),
  '/register':    () => import('../pages/Auth'),
};

// Scrolls to top whenever the route pathname changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const timeAgo = (dateStr: string): string => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Notification dropdown panel — reused on both desktop and mobile
const NotificationPanelContent: React.FC<{ onClose: () => void }> = () => {
  const { userNotifications, markNotificationRead, markAllNotificationsRead } = useStore();
  const hasUnread = userNotifications.some(n => !n.isRead);

  return (
    <div className="bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
        <h3 className="font-bold text-stone-800 text-sm">Notifications</h3>
        {hasUnread && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto divide-y divide-stone-50">
        {userNotifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-8 h-8 text-stone-200 mx-auto mb-2" />
            <p className="text-sm text-stone-400">No notifications yet</p>
          </div>
        ) : (
          userNotifications.map(notif => {
            const cfg = getNotifConfig(notif.orderStatus);
            const Icon = cfg.Icon;
            return (
              <button
                key={notif.id}
                onClick={() => { markNotificationRead(notif.id); }}
                className={`w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors flex gap-3 items-start ${
                  !notif.isRead ? 'bg-rose-50/50' : ''
                }`}
              >
                <div className={`flex-shrink-0 mt-0.5 ${cfg.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed ${
                    !notif.isRead ? 'font-semibold text-stone-800' : 'text-stone-500'
                  }`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{timeAgo(notif.createdAt)}</p>
                </div>
                {!notif.isRead && (
                  <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-rose-400" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, cart, userNotifications, toastQueue, dismissToast, notifications } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const preload = useCallback((path: string) => {
    preloadMap[path]?.();
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Cakes', path: '/custom-cake' },
    { name: 'Contact', path: '/contact' },
  ];

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <ScrollToTop />
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-16">
            {/* Left Column: Logo */}
            <div className="flex items-center justify-start space-x-4">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="font-bold text-2xl text-rose-500 font-['Poppins']">Baked by Iyah</span>
              </Link>
            </div>
            
            {/* Center Column: Nav Links */}
            <div className="hidden lg:flex items-center justify-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onMouseEnter={() => preload(link.path)}
                  className={`${location.pathname === link.path ? 'text-rose-500 font-medium' : 'text-stone-600 hover:text-rose-400'} transition-colors whitespace-nowrap`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Column: Icons & User Actions */}
            <div className="hidden lg:flex items-center justify-end space-x-4">
              {/* Notification Bell — customers only */}
              {user && user.role !== UserRole.ADMIN && (
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(p => !p)}
                    className="p-2 text-stone-600 hover:text-rose-500 relative"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-80 z-50">
                        <NotificationPanelContent onClose={() => setIsNotifOpen(false)} />
                      </div>
                    </>
                  )}
                </div>
              )}



              {user ? (
                <div className="flex items-center space-x-2">
                  {user.role === UserRole.ADMIN && (
                    <Link to="/admin" onMouseEnter={() => preload('/admin')} className="text-amber-600 font-medium hover:text-amber-700 whitespace-nowrap text-sm border border-amber-200 bg-amber-50 px-3 py-1 rounded-full transition-colors">
                      Dashboard
                    </Link>
                  )}
                  <Link to="/profile" onMouseEnter={() => preload('/profile')} className="p-2 text-stone-600 hover:text-rose-500" title="Profile Settings">
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
                <Link to="/login" onMouseEnter={() => preload('/login')} className="flex items-center space-x-1 text-stone-600 hover:text-rose-500 whitespace-nowrap">
                  <UserIcon className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile: Bell + Hamburger */}
            <div className="flex items-center lg:hidden justify-end col-start-3 gap-1">
              {user && user.role !== UserRole.ADMIN && (
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(p => !p)}
                    className="p-2 text-stone-600 hover:text-rose-500 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-72 z-50">
                        <NotificationPanelContent onClose={() => setIsNotifOpen(false)} />
                      </div>
                    </>
                  )}
                </div>
              )}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-md text-stone-400 hover:text-stone-500 hover:bg-stone-100 focus:outline-none"
              >
                <Menu className="block h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Menu (Right-Aligned Slide-Out) */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="relative w-64 bg-white h-full shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-stone-100">
                    <span className="font-bold text-lg text-rose-500">Menu</span>
                    <button 
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-stone-100 text-stone-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                    {user && (
                        <div className="px-4 py-2 mb-4">
                            <p className="text-sm text-stone-500">Signed in as</p>
                            <p className="font-bold text-stone-800 truncate">{user.name}</p>
                        </div>
                    )}

                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onMouseEnter={() => preload(link.path)}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                location.pathname === link.path 
                                    ? 'bg-rose-50 text-rose-600' 
                                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {user?.role === UserRole.ADMIN && (
                        <Link 
                            to="/admin"
                            onMouseEnter={() => preload('/admin')}
                            onClick={() => setIsMenuOpen(false)} 
                            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                            Admin Dashboard
                        </Link>
                    )}



                    <div className="border-t border-stone-100 my-2 pt-2">
                        {user ? (
                            <>
                                <Link 
                                    to="/profile"
                                    onMouseEnter={() => preload('/profile')}
                                    onClick={() => setIsMenuOpen(false)} 
                                    className="block px-4 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                                >
                                    Profile Settings
                                </Link>
                                <button 
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link 
                                to="/login"
                                onMouseEnter={() => preload('/login')}
                                onClick={() => setIsMenuOpen(false)} 
                                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
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
          <div className="flex justify-center gap-4 mt-3 mb-1">
            <a href="https://www.facebook.com/bakedbyiyah" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white text-sm transition-colors">Facebook</a>
            <Link to="/contact" className="text-stone-400 hover:text-white text-sm transition-colors">Contact Us</Link>
          </div>
          <p className="text-stone-500 text-xs mt-3">© {new Date().getFullYear()} Baked by Iyah. All rights reserved.</p>
        </div>
      </footer>

      {/* Floating Cart Button */}
      {user?.role !== UserRole.ADMIN && (
        <Link
          to="/cart"
          onMouseEnter={() => preload('/cart')}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label={`Cart${totalCartItems > 0 ? `, ${totalCartItems} items` : ''}`}
        >
          <ShoppingCart className="h-6 w-6" />
          {totalCartItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-rose-700 rounded-full border-2 border-white">
              {totalCartItems > 99 ? '99+' : totalCartItems}
            </span>
          )}
        </Link>
      )}

      {/* App-level toasts: add to cart, errors, etc. */}
      <div className={`fixed ${user?.role === UserRole.ADMIN ? 'bottom-6' : 'bottom-24'} right-4 z-50 flex flex-col-reverse items-end pointer-events-none`}>
        {notifications.map(n => <AppToast key={n.id} n={n} />)}
      </div>

      {/* Order-status slide-in toasts (top-right) */}
      <NotificationToast toasts={toastQueue} onDismiss={dismissToast} />
    </div>
  );
};