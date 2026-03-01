import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Product, Order, CartItem, OrderStatus, PaymentMethod, DeliveryMethod, UserRole, UserNotification } from '../types';
import { db } from '../services/db';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CustomInquiryDetails {
  name?: string;
  email?: string;
  date: string;
  size: string;
  notes: string;
  image?: File | null;
}

interface StoreContextType {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  notifications: Notification[];
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, phone: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  placeOrder: (details: {
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    scheduledDate: string;
    scheduledTime: string;
    paymentProof?: File | null;
    deliveryAddress?: string;
  }) => Promise<void>;
  submitCustomInquiry: (details: CustomInquiryDetails) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateInquiryPrice: (orderId: string, price: number) => Promise<void>;
  updateInventory: (id: string, type: 'product' | 'ingredient', quantity: number) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
  userNotifications: UserNotification[];
  toastQueue: UserNotification[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Generates a short 6-character uppercase alphanumeric ID (e.g. "A3B7K2")
const generateId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // State initialization
  // User starts as null; getSessionUser() re-hydrates from Supabase (or localStorage) on mount
  const [user, setUser] = useState<User | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bbi_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
  const [toastQueue, setToastQueue] = useState<UserNotification[]>([]);


  // Persistence Effects for Client-Side only (User Session & Cart)
  // We don't persist products/orders here anymore because they come from the "DB"
  useEffect(() => localStorage.setItem('bbi_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('bbi_cart', JSON.stringify(cart)), [cart]);

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);


  // Load session + initial data from DB
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [sessionUser, loadedProducts, loadedOrders] = await Promise.all([
          db.getSessionUser(),
          db.getProducts(),
          db.getOrders(),
        ]);
        if (sessionUser) setUser(sessionUser);
        setProducts(loadedProducts);
        setOrders(loadedOrders);
      } catch (error) {
        console.error("Failed to load data:", error);
        addNotification("Failed to load data from server", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [addNotification]);

  // Listen for Supabase auth changes — catches OAuth redirects and token refreshes.
  // SIGNED_OUT is deliberately not handled here to avoid one tab's logout
  // killing sessions in other concurrent tabs.
  useEffect(() => {
    const unsubscribe = db.subscribeToAuthChanges((sessionUser) => {
      if (sessionUser) {
        setUser(sessionUser);
      }
    });
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load initial notifications for the logged-in customer (not admin)
  useEffect(() => {
    if (!user || user.role === UserRole.ADMIN) {
      setUserNotifications([]);
      return;
    }
    db.getUserNotifications(user.id).then(notifs => setUserNotifications(notifs));
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to new notifications in real-time (Supabase Realtime or cross-tab storage event)
  useEffect(() => {
    if (!user || user.role === UserRole.ADMIN) return;
    const unsubscribe = db.subscribeToNotifications(user.id, (newNotif) => {
      setToastQueue(prev => [...prev, newNotif]);
      setUserNotifications(prev =>
        prev.some(n => n.id === newNotif.id) ? prev : [newNotif, ...prev]
      );
    });
    return unsubscribe;
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auth Logic
  const login = async (email: string, pass: string) => {
    const foundUser = await db.login(email, pass);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const loginWithGoogle = async () => {
    try {
      await db.loginWithGoogle();
      // Page redirects to Google — nothing else runs after this
    } catch (error) {
      console.error('Google login failed:', error);
      addNotification('Google login is not available.', 'error');
    }
  };

  const register = async (name: string, email: string, pass: string, phone: string) => {
    const newUser = await db.register(name, email, pass, phone);
    setUser(newUser);
  };

  const logout = async () => {
    await db.logout();
    setUser(null);
    setCart([]);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    await db.updateUser(updatedUser);
    setUser(updatedUser);
  };

  // Cart Logic (Client-side mostly)
  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, product.stock);
        return prev.map(item => item.id === product.id 
          ? { ...item, quantity: newQuantity } 
          : item
        );
      }
      return [...prev, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
    addNotification(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: Math.min(quantity, product.stock) } : item
    ));
  };

  // Order Logic
  const placeOrder = async (details: {
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    scheduledDate: string;
    scheduledTime: string;
    paymentProof?: File | null;
  }) => {
    if (!user) return;

    // Deduct Stock in DB
    const newProducts = [...products];
    for (const cartItem of cart) {
      const product = newProducts.find(p => p.id === cartItem.id);
      if (product) {
        const newStock = product.stock - cartItem.quantity;
        product.stock = newStock;
        await db.updateProduct(product); // DB Update
      }
    }
    setProducts(newProducts); // Local Update

    const newOrder: Order = {
      id: `ORD-${generateId()}`,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      items: [...cart],
      totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      ...details,
      paymentProof: details.paymentProof ? URL.createObjectURL(details.paymentProof) : undefined // Fake upload
    };

    await db.createOrder(newOrder); // DB Update
    setOrders(prev => [newOrder, ...prev]); // Local Update
    setCart([]);
  };

  const submitCustomInquiry = async (details: any) => {
    const newOrder: Order = {
      id: `INQ-${generateId()}`,
      userId: user?.id || 'guest',
      customerName: user?.name || details.name,
      customerEmail: details.email || user?.email,
      items: [],
      totalAmount: 0, // TBD
      status: OrderStatus.PENDING,
      paymentMethod: PaymentMethod.COD,
      deliveryMethod: DeliveryMethod.PICKUP,
      scheduledDate: details.date,
      scheduledTime: 'TBD',
      createdAt: new Date().toISOString(),
      isCustomInquiry: true,
      customDetails: {
        size: details.size,
        notes: details.notes,
        referenceImage: details.image ? URL.createObjectURL(details.image) : undefined
      }
    };
    await db.createOrder(newOrder);
    setOrders(prev => [newOrder, ...prev]);
  };

  // Admin Logic
  const getOrderStatusMessage = (orderId: string, status: OrderStatus): string => {
    const shortId = '#' + orderId.replace(/^(ORD|INQ)-/, ''); // e.g. #A3B7K2
    switch (status) {
      case OrderStatus.CONFIRMED: return `Your order ${shortId} has been confirmed! We're getting started. 🎉`;
      case OrderStatus.BAKING:    return `Your order ${shortId} is now being baked! 🧁`;
      case OrderStatus.COMPLETED: return `Your order ${shortId} is ready! Come and enjoy. 🎂`;
      case OrderStatus.CANCELLED: return `Your order ${shortId} has been cancelled. Please contact us for more info.`;
      default:                    return `Your order ${shortId} status has been updated to ${status}.`;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updatedOrder = { ...order, status };
      await db.updateOrder(updatedOrder);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      // Write a notification for the customer (skip Pending — that's the default)
      if (status !== OrderStatus.PENDING && order.userId !== 'guest') {
        const notif: UserNotification = {
          id: `notif-${Date.now()}`,
          userId: order.userId,
          message: getOrderStatusMessage(orderId, status),
          orderId,
          orderStatus: status,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        await db.addUserNotification(notif);
      }
    }
  };

  const updateInquiryPrice = async (orderId: string, price: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const updatedOrder = { ...order, totalAmount: price };
        await db.updateOrder(updatedOrder);
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    }
  };

  const updateInventory = async (id: string, type: 'product' | 'ingredient', quantity: number) => {
    if (type === 'product') {
      const product = products.find(p => p.id === id);
      if (product) {
        const updatedProduct = { ...product, stock: quantity };
        await db.updateProduct(updatedProduct);
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      }
    }
  };

  const markNotificationRead = async (id: string) => {
    await db.markNotificationRead(id);
    setUserNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    await db.markAllNotificationsRead(user.id);
    setUserNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const dismissToast = (id: string) => {
    setToastQueue(prev => prev.filter(n => n.id !== id));
  };

  const addProduct = async (product: Product) => {
    try {
      await db.addProduct(product);
      setProducts(prev => [...prev, product]);
      addNotification("Product added successfully", "success");
    } catch (error) {
      console.error("Failed to add product:", error);
      addNotification("Failed to add product", "error");
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      await db.updateProduct(product);
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      addNotification("Product updated successfully", "success");
    } catch (error) {
      console.error("Failed to update product:", error);
      addNotification("Failed to update product", "error");
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await db.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      addNotification("Product removed successfully", "success");
    } catch (error) {
      console.error("Failed to delete product:", error);
      addNotification("Failed to remove product", "error");
    }
  };

  return (
    <StoreContext.Provider value={{
      user, products, cart, orders, notifications, isLoading,
      login, register, loginWithGoogle, logout, updateUser,
      addToCart, removeFromCart, updateCartQuantity,
      placeOrder, submitCustomInquiry, updateOrderStatus, updateInquiryPrice, updateInventory, addProduct, updateProduct, deleteProduct,
      addNotification, removeNotification,
      userNotifications, toastQueue, markNotificationRead, markAllNotificationsRead, dismissToast
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};