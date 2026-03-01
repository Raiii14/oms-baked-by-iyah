import { Product, ProductCategory, User, UserRole } from './types';

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
  }
];

export const MOCK_ADMIN: User = {
  id: 'admin-001',
  email: 'admin@bakedbyiyah.com',
  name: 'Iyah',
  role: UserRole.ADMIN,
  password: 'admin123'
};
