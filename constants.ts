import { Product, ProductCategory, User, UserRole, PastCake } from './types';

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
  email: 'iyah.admin@bakedbyiyah.com',
  name: 'Iyah',
  role: UserRole.ADMIN,
  password: 'BakedByIyah@2026'
};

export const SIZE_OPTIONS = [
  { value: '6 inch', label: '6"', sub: 'Round' },
  { value: '8 inch', label: '8"', sub: 'Round' },
  { value: '10 inch', label: '10"', sub: 'Round' },
  { value: '2 Tier', label: '2', sub: 'Tier' },
  { value: 'Other', label: '?', sub: 'Other' },
] as const;

export const PAST_CAKES: PastCake[] = [
  { name: 'Brookies Tower',             image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/487108081_1060524726096042_4061940913461564815_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=74x8pmvqsDkQ7kNvwH4jh9_&_nc_oc=Adnc1NYT3pUXNg-2JWVOhvz3HkzfQdLgHORpcJPMkIa865BWxHgT1S1-kFh8-vnmuSc&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=i_sQIVtX7eobxsB-JQKnVg&_nc_ss=8&oh=00_Afw7wVGL3runxLNmz4936XQr3M4MK2E5Oao0DHf0CSPMAA&oe=69B3014B' },
  { name: "Mother's Day Cake",           image: 'https://scontent-mnl1-1.xx.fbcdn.net/v/t39.30808-6/496844213_1096896189125562_1980152484651145326_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=7b2446&_nc_ohc=rHHASGHB3roQ7kNvwHILEXC&_nc_oc=AdnNaPnnJmvrlNAYtpguf4COP3lAS1AQiKJIXAWIl-jhXnwCC9nA-JsAx5ovF_1vKmg&_nc_zt=23&_nc_ht=scontent-mnl1-1.xx&_nc_gid=xiQDz1X6TUJB7IVhzOFztw&_nc_ss=8&oh=00_Afx9JtIbM8gkNaywkzP8hQE7bWqH6l2WEr8l7PFdy01xkQ&oe=69B31C06' },
  { name: 'Debut Cake',                  image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/487143206_1060524739429374_7498172421836945018_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=5Mx6qCVeXi4Q7kNvwG4widi&_nc_oc=Adm2I8buY-IPAldiKPIck4pjNipDe-0_aMBAfSX_M7LMJRINWh3ZCPhivv2WnBH6WL8&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=NDPWLkGmwAnG1qfmwe1juA&_nc_ss=8&oh=00_AfzAc8ijRJmkI_R6vtnS0zrJc9V2SG3Bgk6qSQkoi781ag&oe=69B309B1' },
  { name: 'Chocolate Overload Cake',     image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/494786922_1086787506803097_4302366667543655730_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=7b2446&_nc_ohc=0VZ4dX5cG2cQ7kNvwEYXVbS&_nc_oc=AdkRbFuXL47cxGgXSYQO7Y3xwdS1RKdLD2Mt_SlG5GaLPLweufGZmU8IYTDCilQHO4A&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=VuPPVMQYkgHpoeo9fwDsvA&_nc_ss=8&oh=00_AfymNH2jDrg5HUkI_j3bC4VHA0N-J_3_Bj9Vg6_esMnI5A&oe=69B315B2' },
  { name: 'Spiderman Themed Cake',       image: 'https://scontent-mnl3-2.xx.fbcdn.net/v/t39.30808-6/512003522_1127062139442300_1954159200695648108_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=107&ccb=1-7&_nc_sid=7b2446&_nc_ohc=6FBRMuzahowQ7kNvwG78_mU&_nc_oc=Adm40HWlr9VvJ92Kf6yVEXde5wL3p0hvBp6O38qrXU0v7F4_OfrLxr7FHmxFgnHIOGA&_nc_zt=23&_nc_ht=scontent-mnl3-2.xx&_nc_gid=sZJ2oXDNRws8bixey4-JvA&_nc_ss=8&oh=00_AfyfH2En_OXBExBP3oi74lQNRjS4WEsdOWm-CC6lNuODGw&oe=69B32F06' },
  { name: 'Vintage Themed Cake',         image: 'https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/535778182_1171987488283098_379305248485660217_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=7b2446&_nc_ohc=ahK6J5JiVZEQ7kNvwGMv5Kr&_nc_oc=AdmDMRqR91uwQ6ENZ_AeiSPl78KoQYtx_R0NW9FXI87PKtZGCACHJUsUTI_nQ7--bos&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=TIfQ1koNL81_XyZL5EI83w&_nc_ss=8&oh=00_AfyoYJ2XZtb-oPb5XpcfEvMj_7-YqHdfjvv82fC6e-hpXQ&oe=69B3051B' },
  { name: 'Tulip Bouqcake',              image: 'https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/537023479_1171996674948846_5876839080930745082_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=101&ccb=1-7&_nc_sid=7b2446&_nc_ohc=AZ3993t3bKQQ7kNvwGdVDN8&_nc_oc=AdmapsczytBb0h9z2u9INaBlB-6jfcI5MEWRl0ZpL57EVqmXTVxCik1Kjz0goV4gZQM&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=lc7CSi27fpHCIYBtgW5WqA&_nc_ss=8&oh=00_AfzM5cKkMjYvSlFo7t3FcexOhxNx-TyVzToMSPkF_B2Odw&oe=69B34F81' },
  { name: 'Interior Design Themed Cake', image: 'https://scontent-mnl3-1.xx.fbcdn.net/v/t39.30808-6/535926836_1171987581616422_5803633332250890303_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=7b2446&_nc_ohc=Qhn5MsVE_y8Q7kNvwHrFT3Z&_nc_oc=AdmDarXYFbscmDCNwtQfnthSFWr-CmUA9QLp8a6tuoRhH9DmVwU0yaAEo97qdjroUqA&_nc_zt=23&_nc_ht=scontent-mnl3-1.xx&_nc_gid=SpPINcF6o8Pt1wW6pk-_5Q&_nc_ss=8&oh=00_Afwepoo51Q_pag-fN973oaB9ted4WoNxD8JHkQHvFJ1iHA&oe=69B31089' },
  { name: 'SpongeBob Themed Cake',       image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/547997162_1195820302566483_8910351040558425401_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=L_SS7aQaEhkQ7kNvwFr6ISq&_nc_oc=AdkM6fRa5ov5-BEvlONah8XJSIwBpsv5RxklNc8xKNEGDwNCZ3zUb2QIZSqlrUnCi4g&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=AFJbhdBEHHMvZ1_Qt2eamA&_nc_ss=8&oh=00_AfwILU6MuFqzRRJLRwb9Ejzu8pTsvsSzOJSznkYJ23xyyA&oe=69B31D30' },
  { name: 'Coding Themed Cake',          image: 'https://scontent-mnl1-1.xx.fbcdn.net/v/t39.30808-6/487567325_1060908922724289_5619092308825302151_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=7b2446&_nc_ohc=XnydoAVOKiUQ7kNvwHUjJVg&_nc_oc=Adn5nGxX2gFWjC6YGDhFUw99yEfeqQqzisXYpIzcXdM7p3xFfX3wUwvKDw7Lg51Jphg&_nc_zt=23&_nc_ht=scontent-mnl1-1.xx&_nc_gid=VV_1bRSnvrGYzSciXJfLTw&_nc_ss=8&oh=00_Afx9c1fJsi6TVJSZ7ygYeigvQ_ei-8Wss36BFdHTIDjDTw&oe=69B30B97' },
  { name: 'Red Vintage Bow Cake',        image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/557985391_1212074240941089_8356171292982685372_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=7b2446&_nc_ohc=SP-wABdemMcQ7kNvwH6AjFU&_nc_oc=Adll2_5S9FeoxMrw0V-tShZpXT-7UDTQg2mTK_SjEDmkobFDAJNxLLQIXrxDRy7C1Ys&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=O6IGwS2wQXturjnoa1AwqA&_nc_ss=8&oh=00_AfzdaKbMLi4nX9ZOlIV0DZu89JoUGR5HyhNXOvVhkYtrbw&oe=69B302AD' },
  { name: 'Kuromi Themed Cake (Twin)',   image: 'https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/489845443_1067976972017484_4570877682225026267_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=7b2446&_nc_ohc=JsnQQUp1qb0Q7kNvwGYr89m&_nc_oc=Adnx1DjALamADFsAg2iwqCovVhabmQEFHDr6I5y0qq6lkl3cMZuSoG_Ty2zsVENbhXI&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=GhpaUrDj8mMy3gCbNeyt1A&_nc_ss=8&oh=00_Afx7FgZHcRaVwpahj38wdHvqqD7QkTMf5KMvMFKFlKDRcw&oe=69B31AE6' },
  { name: 'Kuromi Themed Cake',          image: 'https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/488250058_1065369775611537_4884608332579361473_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=7b2446&_nc_ohc=V6y6cyZ6TK0Q7kNvwE8bvaW&_nc_oc=Adk3x9dkk_T3DvEdpWBJn5VYkKDaEJQjf_Y4vpwp-txjVXztF0SJH-FCkgmGt6iOSxQ&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=yoKoNzTIf99s0sHbb3NXtA&_nc_ss=8&oh=00_AfxHlRCCZmN-JqdpGCWrW4d5t8U-wcLV3g2ZX0XFjHEEzQ&oe=69B2FBF9' },
];
