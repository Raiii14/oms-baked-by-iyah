import { User, Product, Order, Ingredient, UserRole } from '../types';
import { INITIAL_PRODUCTS, INITIAL_INGREDIENTS, MOCK_ADMIN } from '../constants';

// This interface defines the contract that any database service (Supabase, Firebase, etc.) must fulfill.
// To switch databases, you simply create a new class implementing this interface.
export interface DatabaseProvider {
  // Auth
  login(email: string, pass: string): Promise<User | null>;
  register(name: string, email: string, pass: string): Promise<User>;
  updateUser(user: User): Promise<User>;

  // Data Fetching
  getProducts(): Promise<Product[]>;
  getIngredients(): Promise<Ingredient[]>;
  getOrders(): Promise<Order[]>;

  // Data Mutation
  createOrder(order: Order): Promise<Order>;
  updateOrder(order: Order): Promise<Order>;
  updateProduct(product: Product): Promise<Product>;
  updateIngredient(ingredient: Ingredient): Promise<Ingredient>;
}

// --- LocalStorage Implementation (Current) ---
class LocalStorageService implements DatabaseProvider {
  // Simulate network delay for realism
  private async delay(ms: number = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper to get data
  private get<T>(key: string, defaultVal: T): T {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultVal;
  }

  // Helper to set data
  private set(key: string, val: any) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  async login(email: string, pass: string): Promise<User | null> {
    await this.delay();
    if (email === MOCK_ADMIN.email && pass === MOCK_ADMIN.password) {
      return MOCK_ADMIN;
    }
    
    // Simple hash check (same as before)
    const hashPassword = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString();
    };

    const storedUsers = this.get<User[]>('bbi_users_db', []);
    const hashedPassword = hashPassword(pass);
    
    const foundUser = storedUsers.find((u: User) => 
      u.email === email && (u.password === hashedPassword || u.password === pass)
    );
    
    return foundUser || null;
  }

  async register(name: string, email: string, pass: string): Promise<User> {
    await this.delay();
    const hashPassword = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return hash.toString();
    };

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password: hashPassword(pass),
      role: UserRole.CUSTOMER
    };

    const storedUsers = this.get<User[]>('bbi_users_db', []);
    this.set('bbi_users_db', [...storedUsers, newUser]);
    return newUser;
  }

  async updateUser(user: User): Promise<User> {
    await this.delay();
    const storedUsers = this.get<User[]>('bbi_users_db', []);
    const updatedUsers = storedUsers.map(u => u.id === user.id ? user : u);
    this.set('bbi_users_db', updatedUsers);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    await this.delay(100); // Faster read
    const products = this.get<Product[]>('bbi_products', INITIAL_PRODUCTS);
    // Ensure "Custom Celebration Cake" (id: p5) is filtered out
    return products.filter((p: Product) => p.id !== 'p5');
  }

  async getIngredients(): Promise<Ingredient[]> {
    await this.delay(100);
    return this.get<Ingredient[]>('bbi_ingredients', INITIAL_INGREDIENTS);
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
    const updatedOrders = orders.map(o => o.id === order.id ? order : o);
    this.set('bbi_orders', updatedOrders);
    return order;
  }

  async updateProduct(product: Product): Promise<Product> {
    await this.delay();
    const products = this.get<Product[]>('bbi_products', INITIAL_PRODUCTS);
    const updatedProducts = products.map(p => p.id === product.id ? product : p);
    this.set('bbi_products', updatedProducts);
    return product;
  }

  async updateIngredient(ingredient: Ingredient): Promise<Ingredient> {
    await this.delay();
    const ingredients = this.get<Ingredient[]>('bbi_ingredients', INITIAL_INGREDIENTS);
    const updatedIngredients = ingredients.map(i => i.id === ingredient.id ? ingredient : i);
    this.set('bbi_ingredients', updatedIngredients);
    return ingredient;
  }
}

// Export the instance. 
// When you switch to Supabase/Firebase, you will just change this line:
// export const db = new SupabaseService();
export const db = new LocalStorageService();
