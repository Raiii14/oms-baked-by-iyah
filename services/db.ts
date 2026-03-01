import { User, Product, Order, UserRole, UserNotification, OrderStatus, PaymentMethod, DeliveryMethod, ProductCategory } from '../types';
import { INITIAL_PRODUCTS, MOCK_ADMIN } from '../constants';
import { supabase } from './supabaseClient';

// ─── DatabaseProvider Interface ───────────────────────────────────────────────
// Any backend (localStorage, Supabase, Firebase…) must implement this contract.

export interface DatabaseProvider {
  // Auth
  getSessionUser(): Promise<User | null>;
  login(email: string, pass: string): Promise<User | null>;
  register(name: string, email: string, pass: string, phone: string): Promise<User>;
  logout(): Promise<void>;
  updateUser(user: User): Promise<User>;

  // Data Fetching
  getProducts(): Promise<Product[]>;
  getOrders(): Promise<Order[]>;

  // Data Mutation
  createOrder(order: Order): Promise<Order>;
  updateOrder(order: Order): Promise<Order>;
  addProduct(product: Product): Promise<Product>;
  updateProduct(product: Product): Promise<Product>;
  deleteProduct(productId: string): Promise<void>;

  // Notifications
  getUserNotifications(userId: string): Promise<UserNotification[]>;
  addUserNotification(notification: UserNotification): Promise<void>;
  markNotificationRead(notificationId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;

  /**
   * Subscribe to new notifications for a user.
   * The callback fires once per NEW notification (existing ones are ignored).
   * Returns an unsubscribe function — call it in useEffect cleanup.
   */
  subscribeToNotifications(userId: string, callback: (notif: UserNotification) => void): () => void;
}

// ─── LocalStorage Implementation (Fallback / Dev) ────────────────────────────

class LocalStorageService implements DatabaseProvider {
  private async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private get<T>(key: string, defaultVal: T): T {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultVal;
  }

  private set(key: string, val: unknown) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  // Session is persisted as 'bbi_user' by StoreContext's localStorage effect
  async getSessionUser(): Promise<User | null> {
    await this.delay(50);
    const saved = localStorage.getItem('bbi_user');
    return saved ? JSON.parse(saved) : null;
  }

  async login(email: string, pass: string): Promise<User | null> {
    await this.delay();
    if (email === MOCK_ADMIN.email && pass === MOCK_ADMIN.password) {
      return MOCK_ADMIN;
    }

    const hash = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        h = ((h << 5) - h) + c;
        h = h & h;
      }
      return h.toString();
    };

    const storedUsers = this.get<User[]>('bbi_users_db', []);
    const hashed = hash(pass);
    return storedUsers.find(u => u.email === email && (u.password === hashed || u.password === pass)) || null;
  }

  async register(name: string, email: string, pass: string, phone: string): Promise<User> {
    await this.delay();
    const hash = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        h = ((h << 5) - h) + c;
        h = h & h;
      }
      return h.toString();
    };

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password: hash(pass),
      role: UserRole.CUSTOMER,
      phoneNumber: phone,
    };

    const storedUsers = this.get<User[]>('bbi_users_db', []);
    this.set('bbi_users_db', [...storedUsers, newUser]);
    return newUser;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('bbi_user');
  }

  async updateUser(user: User): Promise<User> {
    await this.delay();
    const storedUsers = this.get<User[]>('bbi_users_db', []);
    this.set('bbi_users_db', storedUsers.map(u => u.id === user.id ? user : u));
    return user;
  }

  async getProducts(): Promise<Product[]> {
    await this.delay(100);
    const products = this.get<Product[]>('bbi_products', INITIAL_PRODUCTS);
    return products.filter(p => p.id !== 'p5');
  }

  async getOrders(): Promise<Order[]> {
    await this.delay(100);
    return this.get<Order[]>('bbi_orders', []);
  }

  async createOrder(order: Order): Promise<Order> {
    await this.delay();
    const orders = this.get<Order[]>('bbi_orders', []);
    this.set('bbi_orders', [order, ...orders]);
    return order;
  }

  async updateOrder(order: Order): Promise<Order> {
    await this.delay();
    const orders = this.get<Order[]>('bbi_orders', []);
    this.set('bbi_orders', orders.map(o => o.id === order.id ? order : o));
    return order;
  }

  async addProduct(product: Product): Promise<Product> {
    await this.delay();
    const products = this.get<Product[]>('bbi_products', INITIAL_PRODUCTS);
    this.set('bbi_products', [...products, product]);
    return product;
  }

  async updateProduct(product: Product): Promise<Product> {
    await this.delay();
    const products = this.get<Product[]>('bbi_products', INITIAL_PRODUCTS);
    this.set('bbi_products', products.map(p => p.id === product.id ? product : p));
    return product;
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.delay();
    const products = this.get<Product[]>('bbi_products', INITIAL_PRODUCTS);
    this.set('bbi_products', products.filter(p => p.id !== productId));
  }

  async getUserNotifications(userId: string): Promise<UserNotification[]> {
    await this.delay(50);
    const all = this.get<UserNotification[]>('bbi_user_notifications', []);
    return all.filter(n => n.userId === userId);
  }

  async addUserNotification(notification: UserNotification): Promise<void> {
    await this.delay(50);
    const all = this.get<UserNotification[]>('bbi_user_notifications', []);
    this.set('bbi_user_notifications', [notification, ...all]);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.delay(50);
    const all = this.get<UserNotification[]>('bbi_user_notifications', []);
    this.set('bbi_user_notifications', all.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await this.delay(50);
    const all = this.get<UserNotification[]>('bbi_user_notifications', []);
    this.set('bbi_user_notifications', all.map(n => n.userId === userId ? { ...n, isRead: true } : n));
  }

  subscribeToNotifications(userId: string, callback: (notif: UserNotification) => void): () => void {
    // Seed known IDs so only truly new notifications trigger the callback
    const knownIds = new Set<string>(
      this.get<UserNotification[]>('bbi_user_notifications', [])
        .filter(n => n.userId === userId)
        .map(n => n.id)
    );

    const handleStorage = (e: StorageEvent) => {
      if (e.key !== 'bbi_user_notifications') return;
      const all = this.get<UserNotification[]>('bbi_user_notifications', []);
      all
        .filter(n => n.userId === userId && !knownIds.has(n.id))
        .forEach(n => {
          knownIds.add(n.id);
          callback(n);
        });
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }
}


// ─── Supabase Implementation ──────────────────────────────────────────────────

class SupabaseService implements DatabaseProvider {
  // Fetch and map a profiles row → User
  private async fetchProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return {
      id: data.id as string,
      email: data.email as string,
      name: data.name as string,
      role: data.role as UserRole,
      phoneNumber: data.phone_number as string | undefined,
      lastNameUpdate: data.last_name_update as number | undefined,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapOrder(o: Record<string, any>): Order {
    return {
      id: o.id,
      userId: o.user_id,
      customerName: o.customer_name,
      items: o.items,
      totalAmount: o.total_amount,
      status: o.status as OrderStatus,
      paymentMethod: o.payment_method as PaymentMethod,
      paymentProof: o.payment_proof,
      deliveryMethod: o.delivery_method as DeliveryMethod,
      scheduledDate: o.scheduled_date,
      scheduledTime: o.scheduled_time,
      createdAt: o.created_at,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      deliveryAddress: o.delivery_address,
      isCustomInquiry: o.is_custom_inquiry,
      customDetails: o.custom_details,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapNotification(n: Record<string, any>): UserNotification {
    return {
      id: n.id,
      userId: n.user_id,
      message: n.message,
      orderId: n.order_id,
      orderStatus: n.order_status as OrderStatus,
      isRead: n.is_read,
      createdAt: n.created_at,
    };
  }

  async getSessionUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return this.fetchProfile(session.user.id);
  }

  async login(email: string, pass: string): Promise<User | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error || !data.user) return null;
    return this.fetchProfile(data.user.id);
  }

  async register(name: string, email: string, pass: string, phone: string): Promise<User> {
    // Pass name + phone_number as user metadata so the DB trigger can create
    // the profiles row automatically (even for users added via dashboard).
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { name, phone_number: phone, role: UserRole.CUSTOMER } },
    });
    if (error || !data.user) throw new Error(error?.message || 'Registration failed');

    // Upsert as a fallback — if the trigger already created the row, this will
    // fill in any fields the trigger couldn't (and never error on conflict).
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      name,
      email,
      phone_number: phone,
      role: UserRole.CUSTOMER,
    }, { onConflict: 'id' });
    if (profileError) throw new Error(profileError.message);

    return {
      id: data.user.id,
      email,
      name,
      role: UserRole.CUSTOMER,
      phoneNumber: phone,
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async updateUser(user: User): Promise<User> {
    const { error } = await supabase.from('profiles').update({
      name: user.name,
      phone_number: user.phoneNumber,
      last_name_update: user.lastNameUpdate,
    }).eq('id', user.id);
    if (error) throw error;
    return user;
  }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .neq('id', 'p5');
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id as string,
      name: p.name as string,
      description: p.description as string,
      price: p.price as number,
      category: p.category as ProductCategory,
      image: p.image as string,
      stock: p.stock as number,
    }));
  }

  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(o => this.mapOrder(o));
  }

  async createOrder(order: Order): Promise<Order> {
    const { error } = await supabase.from('orders').insert({
      id: order.id,
      user_id: order.userId,
      customer_name: order.customerName,
      items: order.items,
      total_amount: order.totalAmount,
      status: order.status,
      payment_method: order.paymentMethod,
      payment_proof: order.paymentProof,
      delivery_method: order.deliveryMethod,
      scheduled_date: order.scheduledDate,
      scheduled_time: order.scheduledTime,
      created_at: order.createdAt,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      delivery_address: order.deliveryAddress,
      is_custom_inquiry: order.isCustomInquiry,
      custom_details: order.customDetails,
    });
    if (error) throw error;
    return order;
  }

  async updateOrder(order: Order): Promise<Order> {
    const { error } = await supabase.from('orders').update({
      user_id: order.userId,
      customer_name: order.customerName,
      items: order.items,
      total_amount: order.totalAmount,
      status: order.status,
      payment_method: order.paymentMethod,
      payment_proof: order.paymentProof,
      delivery_method: order.deliveryMethod,
      scheduled_date: order.scheduledDate,
      scheduled_time: order.scheduledTime,
      created_at: order.createdAt,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      delivery_address: order.deliveryAddress,
      is_custom_inquiry: order.isCustomInquiry,
      custom_details: order.customDetails,
    }).eq('id', order.id);
    if (error) throw error;
    return order;
  }

  async addProduct(product: Product): Promise<Product> {
    const { error } = await supabase.from('products').insert(product);
    if (error) throw error;
    return product;
  }

  async updateProduct(product: Product): Promise<Product> {
    const { error } = await supabase.from('products').update({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
    }).eq('id', product.id);
    if (error) throw error;
    return product;
  }

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
  }

  async getUserNotifications(userId: string): Promise<UserNotification[]> {
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(n => this.mapNotification(n));
  }

  async addUserNotification(notification: UserNotification): Promise<void> {
    const { error } = await supabase.from('user_notifications').insert({
      id: notification.id,
      user_id: notification.userId,
      message: notification.message,
      order_id: notification.orderId,
      order_status: notification.orderStatus,
      is_read: notification.isRead,
      created_at: notification.createdAt,
    });
    if (error) throw error;
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
  }

  subscribeToNotifications(userId: string, callback: (notif: UserNotification) => void): () => void {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(this.mapNotification(payload.new as Record<string, unknown>));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }
}


// ─── Active export ────────────────────────────────────────────────────────────
// To roll back to localStorage, swap the two lines below — nothing else changes.
//
// export const db: DatabaseProvider = new LocalStorageService();
export const db: DatabaseProvider = new SupabaseService();

// Both implementations are exported so they can be referenced in tests or swapped in.
export { LocalStorageService, SupabaseService };
