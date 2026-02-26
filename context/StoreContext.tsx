import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Product, Order, Ingredient, CartItem, UserRole, OrderStatus, PaymentMethod, DeliveryMethod } from '../types';
import { INITIAL_PRODUCTS, INITIAL_INGREDIENTS, MOCK_ADMIN } from '../constants';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  user: User | null;
  products: Product[];
  ingredients: Ingredient[];
  cart: CartItem[];
  orders: Order[];
  notifications: Notification[];
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, pass: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  placeOrder: (details: {
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    scheduledDate: string;
    scheduledTime: string;
    paymentProof?: File | null;
  }) => void;
  submitCustomInquiry: (details: any) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateInquiryPrice: (orderId: string, price: number) => void;
  updateInventory: (id: string, type: 'product' | 'ingredient', quantity: number) => void;
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with localStorage checks
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bbi_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bbi_products');
    const loadedProducts = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    // Ensure "Custom Celebration Cake" (id: p5) is removed if it exists
    return loadedProducts.filter((p: Product) => p.id !== 'p5');
  });


  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('bbi_ingredients');
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bbi_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('bbi_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence Effects
  useEffect(() => localStorage.setItem('bbi_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('bbi_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('bbi_ingredients', JSON.stringify(ingredients)), [ingredients]);
  useEffect(() => localStorage.setItem('bbi_cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('bbi_orders', JSON.stringify(orders)), [orders]);

  // Auth Logic
  // Simple hash function for demonstration (NOT for production use)
  const hashPassword = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  };

  const login = (email: string, pass: string) => {
    if (email === MOCK_ADMIN.email && pass === MOCK_ADMIN.password) {
      setUser(MOCK_ADMIN);
      return true;
    }
    // Mock user login - normally would check DB
    const storedUsers = JSON.parse(localStorage.getItem('bbi_users_db') || '[]');
    const hashedPassword = hashPassword(pass);
    
    // Check both hashed (new) and plain (old) for backward compatibility during dev
    const foundUser = storedUsers.find((u: User) => 
      u.email === email && (u.password === hashedPassword || u.password === pass)
    );
    
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, pass: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password: hashPassword(pass), // Store hashed password
      role: UserRole.CUSTOMER
    };
    const storedUsers = JSON.parse(localStorage.getItem('bbi_users_db') || '[]');
    localStorage.setItem('bbi_users_db', JSON.stringify([...storedUsers, newUser]));
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setCart([]);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    
    // Update local state
    setUser(updatedUser);
    
    // Update "DB"
    const storedUsers = JSON.parse(localStorage.getItem('bbi_users_db') || '[]');
    const updatedUsers = storedUsers.map((u: User) => u.id === user.id ? updatedUser : u);
    localStorage.setItem('bbi_users_db', JSON.stringify(updatedUsers));
  };

  // Cart Logic
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
  const placeOrder = (details: {
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    scheduledDate: string;
    scheduledTime: string;
    paymentProof?: File | null;
  }) => {
    if (!user) return;

    // Deduct Stock
    const newProducts = [...products];
    cart.forEach(cartItem => {
      const productIndex = newProducts.findIndex(p => p.id === cartItem.id);
      if (productIndex >= 0) {
        newProducts[productIndex].stock -= cartItem.quantity;
      }
    });
    setProducts(newProducts);

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
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

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    
    // Simulating Notification
    alert(`Order ${newOrder.id} submitted successfully! We will notify you via email.`);
  };

  const submitCustomInquiry = (details: any) => {
    // Treat as a special order
    const newOrder: Order = {
      id: `INQ-${Date.now()}`,
      userId: user?.id || 'guest',
      customerName: user?.name || details.name,
      customerEmail: user?.email,
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
    setOrders(prev => [newOrder, ...prev]);
    alert("Inquiry sent! The owner will review and send a price quote.");
  };

  // Admin Logic
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    // Simulate Notification
    const order = orders.find(o => o.id === orderId);
    if (order) {
        console.log(`Email sent to customer: Order ${orderId} is now ${status}`);
    }
  };

  const updateInquiryPrice = (orderId: string, price: number) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, totalAmount: price } : o));
  };

  const updateInventory = (id: string, type: 'product' | 'ingredient', quantity: number) => {
    if (type === 'product') {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: quantity } : p));
    } else {
      setIngredients(prev => prev.map(i => i.id === id ? { ...i, quantity: quantity } : i));
    }
  };

  return (
    <StoreContext.Provider value={{
      user, products, ingredients, cart, orders, notifications,
      login, register, logout, updateUser,
      addToCart, removeFromCart, updateCartQuantity,
      placeOrder, submitCustomInquiry, updateOrderStatus, updateInquiryPrice, updateInventory,
      addNotification, removeNotification
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