import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  logout: () => void;
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
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bbi_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bbi_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
  const [toastQueue, setToastQueue] = useState<UserNotification[]>([]);
  const knownNotifIdsRef = useRef<Set<string>>(new Set());


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


  // Load initial data from "DB"
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedProducts, loadedOrders] = await Promise.all([
          db.getProducts(),
          db.getOrders()
        ]);
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

  // Load notifications for the logged-in customer (not admin)
  useEffect(() => {
    if (!user || user.role === UserRole.ADMIN) {
      setUserNotifications([]);
      knownNotifIdsRef.current = new Set();
      return;
    }
    db.getUserNotifications(user.id).then(notifs => {
      setUserNotifications(notifs);
      // Seed known IDs — existing notifications should NOT trigger toasts
      knownNotifIdsRef.current = new Set(notifs.map(n => n.id));
    });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cross-tab sync: admin writes to localStorage in one tab, customer receives it here
  useEffect(() => {
    if (!user || user.role === UserRole.ADMIN) return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== 'bbi_user_notifications') return;
      db.getUserNotifications(user.id).then(notifs => {
        const fresh = notifs.filter(n => !knownNotifIdsRef.current.has(n.id));
        if (fresh.length > 0) {
          setToastQueue(prev => [...prev, ...fresh]);
          fresh.forEach(n => knownNotifIdsRef.current.add(n.id));
        }
        setUserNotifications(notifs);
      });
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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

  const register = async (name: string, email: string, pass: string, phone: string) => {
    const newUser = await db.register(name, email, pass, phone);
    setUser(newUser);
  };

  const logout = () => {
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

  return (
    <StoreContext.Provider value={{
      user, products, cart, orders, notifications, isLoading,
      login, register, logout, updateUser,
      addToCart, removeFromCart, updateCartQuantity,
      placeOrder, submitCustomInquiry, updateOrderStatus, updateInquiryPrice, updateInventory, addProduct, updateProduct,
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