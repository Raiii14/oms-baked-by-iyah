import { Product, ProductCategory, Ingredient, User, UserRole } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Classic Brookies',
    description: 'The perfect combination of brownies and cookies. A customer favorite!',
    price: 180,
    category: ProductCategory.COOKIES,
    image: 'https://picsum.photos/400/400?random=1',
    stock: 20
  },
  {
    id: 'p2',
    name: 'Banana Loaf',
    description: 'Moist and not too sweet banana bread, perfect for coffee.',
    price: 150,
    category: ProductCategory.PASTRIES,
    image: 'https://picsum.photos/400/400?random=2',
    stock: 15
  },
  {
    id: 'p3',
    name: 'Chocolate Moist Cake',
    description: 'Rich chocolate cake that melts in your mouth.',
    price: 450,
    category: ProductCategory.CAKES,
    image: 'https://picsum.photos/400/400?random=3',
    stock: 5
  },
  {
    id: 'p4',
    name: 'Red Velvet Crinkles',
    description: 'Soft and chewy crinkles with cream cheese filling.',
    price: 120,
    category: ProductCategory.COOKIES,
    image: 'https://picsum.photos/400/400?random=4',
    stock: 0 // Sold out test
  },
  {
    id: 'p5',
    name: 'Custom Celebration Cake',
    description: 'Base price for standard customized cakes.',
    price: 800,
    category: ProductCategory.CAKES,
    image: 'https://picsum.photos/400/400?random=5',
    stock: 10
  }
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'i1', name: 'Flour', unit: 'kg', quantity: 50, threshold: 10 },
  { id: 'i2', name: 'Sugar', unit: 'kg', quantity: 30, threshold: 5 },
  { id: 'i3', name: 'Eggs', unit: 'tray', quantity: 12, threshold: 2 },
  { id: 'i4', name: 'Cocoa Powder', unit: 'kg', quantity: 8, threshold: 2 },
  { id: 'i5', name: 'Butter', unit: 'block', quantity: 20, threshold: 5 },
];

export const MOCK_ADMIN: User = {
  id: 'admin-001',
  email: 'admin@bakedbyiyah.com',
  name: 'Iyah (Owner)',
  role: UserRole.ADMIN,
  password: 'admin123'
};
