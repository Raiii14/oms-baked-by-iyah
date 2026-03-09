import { User, Product, Order, UserRole, UserNotification, OrderStatus, PaymentMethod, DeliveryMethod, ProductCategory } from '../types';

import { supabase } from './supabaseClient';

// ─── DatabaseProvider Interface ───────────────────────────────────────────────
// Any backend (localStorage, Supabase, Firebase…) must implement this contract.

export interface DatabaseProvider {
  // Auth
  getSessionUser(): Promise<User | null>;
  login(email: string, pass: string): Promise<User | null>;
  loginWithGoogle(): Promise<void>;
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

  /**
   * Subscribe to Supabase auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED).
   * Fires with the resolved User profile or null. Used to catch OAuth redirects.
   * Returns an unsubscribe function.
   */
  subscribeToAuthChanges(callback: (user: User | null) => void): () => void;

  /**
   * Upload a compressed payment receipt to Supabase Storage.
   * Returns a 1-hour signed URL that can be stored as order.paymentProof.
   */
  uploadPaymentReceipt(userId: string, orderId: string, file: File): Promise<string>;

  /**
   * Upload a compressed custom cake reference image to Supabase Storage.
   * Returns a 1-hour signed URL that can be stored as customDetails.referenceImage.
   */
  uploadCustomCakeReference(userId: string, orderId: string, file: File): Promise<string>;

  /**
   * Generate a fresh 1-hour signed URL for any stored image.
   * bucket: 'payment-receipts' | 'custom-cake-references'
   */
  getImageSignedUrl(bucket: 'payment-receipts' | 'custom-cake-references', path: string): Promise<string>;

  /**
   * Send a transactional email via the send-email Edge Function.
   * Never throws — email failures must not crash order operations.
   */
  sendEmail(to: string, subject: string, html: string): Promise<void>;
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
    if (error) {
      console.error('[db] fetchProfile error:', error.message, 'code:', error.code);
      return null;
    }
    if (!data) {
      console.error('[db] fetchProfile: no profile row found');
      return null;
    }
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
    // getUser() verifies the token with the Supabase server on every call,
    // preventing stale client-side session data from being trusted.
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // 'Auth session missing' is the normal unauthenticated state — not an error worth logging.
      if (error.message !== 'Auth session missing!') {
        console.error('[db] getSessionUser error:', error.message);
      }
      return null;
    }
    if (!user) return null;
    return this.fetchProfile(user.id);
  }

  async login(email: string, pass: string): Promise<User | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      console.error('[db] login error:', error.message, 'status:', error.status);
      return null;
    }
    if (!data.user) {
      console.error('[db] login: no user returned despite no error');
      return null;
    }
    const profile = await this.fetchProfile(data.user.id);
    if (!profile) console.error('[db] login: profile not found after successful auth');
    return profile;
  }

  async register(name: string, email: string, pass: string, phone: string): Promise<User> {
    // Pass name + phone_number as user metadata so the DB trigger (handle_new_user)
    // can create the profiles row automatically. The trigger is SECURITY DEFINER so
    // it bypasses RLS and runs even before the user confirms their email.
    // We do NOT manually insert/upsert here because with email confirmation enabled
    // the user has no active session after signUp(), which would cause RLS violations
    // on any subsequent write to `profiles`.
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { name, phone_number: phone, role: UserRole.CUSTOMER } },
    });
    if (error || !data.user) throw new Error(error?.message || 'Registration failed');

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

  async loginWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    // Browser redirects to Google — no return value
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

  // ── Storage helpers ────────────────────────────────────────────────────────

  private async uploadToStorage(
    bucket: 'payment-receipts' | 'custom-cake-references',
    path: string,
    file: File,
  ): Promise<string> {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      console.error(`[db] uploadToStorage failed → bucket: ${bucket}`, uploadError.message);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1-hour TTL
    if (urlError || !data?.signedUrl)
      throw new Error(`Signed URL generation failed: ${urlError?.message ?? 'no URL returned'}`);

    return data.signedUrl;
  }

  async uploadPaymentReceipt(userId: string, orderId: string, file: File): Promise<string> {
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${userId}/${orderId}.${ext}`;
    return this.uploadToStorage('payment-receipts', path, file);
  }

  async uploadCustomCakeReference(userId: string, orderId: string, file: File): Promise<string> {
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${userId}/${orderId}-ref.${ext}`;
    return this.uploadToStorage('custom-cake-references', path, file);
  }

  async getImageSignedUrl(
    bucket: 'payment-receipts' | 'custom-cake-references',
    path: string,
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600);
    if (error || !data?.signedUrl)
      throw new Error(`Signed URL generation failed: ${error?.message ?? 'no URL returned'}`);
    return data.signedUrl;
  }

  // ── Auth subscriptions ───────────────────────────────────────────────────────

  subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        // IMPORTANT: defer fetchProfile to the next task via setTimeout.
        // onAuthStateChange fires while the Supabase SDK still holds its internal
        // Web Lock (used for token storage). Calling supabase.from() inside this
        // callback synchronously tries to re-acquire the same lock, causing a
        // deadlock where the DB query hangs forever. setTimeout(0) lets the lock
        // release before we make the profiles query.
        const userId = session.user.id;
        setTimeout(async () => {
          const profile = await this.fetchProfile(userId);
          callback(profile);
        }, 0);
      }
      // SIGNED_OUT is intentionally ignored — it fires on all tabs when any tab
      // signs out, which would kill sessions in unrelated tabs. Logout is handled
      // explicitly by the logout() call in StoreContext.
    });
    return () => subscription.unsubscribe();
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const { error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
    });
    if (error) console.error('[db] sendEmail error:', error);
    // Never throw — email failure must not crash order operations
  }
}


// ─── Active export ────────────────────────────────────────────────────────────
export const db: DatabaseProvider = new SupabaseService();

export { SupabaseService };
