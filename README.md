<div align="center">

# 🎂 Baked By Iyah — Order Management System

**A full-stack web application for managing orders, products, and customer inquiries for Baked By Iyah, a homemade bakery in the Philippines.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-bakedbyiyah.vercel.app-rose?style=for-the-badge)](https://bakedbyiyah.vercel.app)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-green?style=for-the-badge&logo=supabase)](https://supabase.com)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
  - [Schema](#schema)
  - [Admin Account Setup](#admin-account-setup)
- [Available Scripts](#available-scripts)
- [Application Routes](#application-routes)
- [Data Models](#data-models)
- [Architecture](#architecture)
- [Deployment](#deployment)

---

## Overview

Baked By Iyah OMS is a client-side single-page application (SPA) built with React and backed by Supabase. Customers can browse the product catalog, add items to their cart, place orders, and request custom cake designs. The admin (baker) manages orders, updates statuses, adjusts inventory, and views sales reports — all in real time.

---

## Features

### Customer
- **Browse Products** — Filter the catalog by category: Cakes, Cookies, and Pastries
- **Shopping Cart** — Add, remove, and adjust item quantities; cart persists across page refreshes
- **Checkout** — Choose between Cash on Delivery or GCash payment, and Pickup or Delivery
- **Custom Cake Inquiry** — Submit a custom cake request with size, flavor notes, and a reference image
- **Order Tracking** — View personal order history and live status updates
- **Notifications** — Real-time in-app alerts when the admin updates an order status
- **Profile Management** — Update display name and phone number (name change limited to once per year)

### Admin
- **Order Management** — View, filter, sort, and paginate all customer orders
- **Inquiry Management** — Respond to custom cake requests and set custom pricing
- **Inventory Control** — Update product stock levels directly from the dashboard
- **Menu Management** — Add, edit, and delete products with image support (including Google Drive links)
- **Sales Reports** — Weekly and monthly revenue charts and order volume visualizations

### Authentication
- Email and password sign-in / registration
- Google OAuth sign-in
- Server-side token verification on every request (`getUser()` — not client-side session reads)
- Role-based route protection: the `/admin` route is inaccessible to customers

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Language | TypeScript 5.7 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Backend & Auth | Supabase (PostgreSQL + GoTrue) |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Project Structure

```
oms-baked-by-iyah/
├── App.tsx                    # Root router and lazy-loaded route definitions
├── index.tsx                  # React DOM entry point
├── index.css                  # Global stylesheet (Tailwind base + custom font)
├── types.ts                   # All TypeScript interfaces and enums
├── constants.ts               # Seed products and mock admin constant
│
├── components/
│   ├── CakeFormModal.tsx      # Custom cake inquiry form modal (props-driven, no store access)
│   ├── CakeGallery.tsx        # Cake inspiration gallery grid
│   ├── Layout.tsx             # Shared navigation bar and footer wrapper
│   ├── Modal.tsx              # Reusable modal dialog
│   ├── NotificationToast.tsx  # Toast notification display
│   ├── StatusBadge.tsx        # Reusable color-coded order status pill badge
│   └── skeletons/
│       ├── SkeletonBase.tsx   # Base SkeletonBox and SkeletonText primitives
│       └── *.tsx              # Per-page loading skeleton screens (one per route)
│
├── context/
│   └── StoreContext.tsx       # Global state: user, cart, products, orders, notifications
│
├── hooks/
│   └── useCakePage.ts         # Page-level logic: all state, effects, and handlers for the Cake page
│
├── pages/
│   ├── Home.tsx               # Landing page with hero, featured products, and highlights
│   ├── Menu.tsx               # Product catalog with category filtering
│   ├── Cake.tsx               # Custom cake inquiry page — thin orchestrator, delegates to useCakePage
│   ├── Cart.tsx               # Shopping cart and order history
│   ├── Checkout.tsx           # Order placement form
│   ├── Profile.tsx            # User profile editor
│   ├── AdminDashboard.tsx     # Full admin panel (orders, inventory, reports, menu)
│   └── Auth.tsx               # Login and registration page
│
├── services/
│   ├── db.ts                  # DatabaseProvider interface + SupabaseService implementation
│   └── supabaseClient.ts      # Supabase client initialization
│
├── utils/
│   ├── cakeSerializer.ts      # serializeCakeNotes() — builds the notes string from FormState for inquiries
│   ├── dateUtils.ts           # formatTime() (24hr → AM/PM) and getMinDate() (tomorrow's date)
│   └── imageCompression.ts    # Client-side image compression before upload
│
└── supabase/
    └── schema.sql             # Full database schema with RLS policies and seed data
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- A [Supabase](https://supabase.com) account and project (free tier works)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/oms-baked-by-iyah.git
   cd oms-baked-by-iyah
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env
   ```
   Then fill in your Supabase credentials (see [Environment Variables](#environment-variables)).

4. Set up the database (see [Database Setup](#database-setup)).

5. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Where to find these values:**
> Supabase Dashboard → Your Project → Project Settings → API
>
> **Important:** Use the `anon` / `public` key. Never use the `service_role` key in the frontend — it bypasses Row Level Security.

These same variables must be added to your Vercel project under **Settings → Environment Variables** for production.

---

## Database Setup

### Schema

Run the full schema once in your Supabase project:

1. Go to **Supabase Dashboard → SQL Editor → New Query**
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql)
3. Click **Run**

This creates four tables with Row Level Security (RLS) enabled:

| Table | Description |
|---|---|
| `profiles` | Extended user data: name, phone number, role (`CUSTOMER` or `ADMIN`) |
| `products` | Bakery product catalog with stock tracking |
| `orders` | All customer orders and custom cake inquiries |
| `user_notifications` | Per-user status update notifications with realtime enabled |

The schema also includes:
- An automatic trigger (`on_auth_user_created`) that creates a `profiles` row whenever a new user registers
- Row Level Security policies so customers can only access their own data
- A seed `INSERT` populating the initial product catalog

### Admin Account Setup

The admin account is not created through the registration form. Follow these steps:

1. Go to **Supabase Dashboard → Authentication → Users → Add User**
   - Email: `iyah.admin@bakedbyiyah.com`
   - Password: `BakedByIyah@2026`

2. The `on_auth_user_created` trigger will automatically create a `profiles` row, but it defaults to `role = 'CUSTOMER'`. Promote it to admin by running this in the SQL Editor:
   ```sql
   UPDATE profiles
   SET role = 'ADMIN', name = 'Iyah'
   WHERE email = 'iyah.admin@bakedbyiyah.com';
   ```

3. **Optional:** In **Authentication → Providers → Email**, disable **Confirm email** so customers can log in immediately after registering without needing to verify their email.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server at `http://localhost:5173` |
| `npm run build` | Compile TypeScript and bundle for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally before deploying |

---

## Application Routes

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/menu` | Product catalog | Public |
| `/custom-cake` | Custom cake inquiry form | Public |
| `/login` | Login | Public |
| `/register` | Registration | Public |
| `/cart` | Cart and order history | Authenticated |
| `/checkout` | Order placement | Authenticated |
| `/profile` | Profile settings | Authenticated |
| `/admin` | Admin dashboard | Admin only |

All routes except `/login` and `/register` are wrapped in the shared `Layout` (navigation bar + footer). The `/admin` route redirects non-admin users to `/login`.

---

## Data Models

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;          // 'CUSTOMER' | 'ADMIN'
  phoneNumber?: string;
  lastNameUpdate?: number; // Unix timestamp — name can only be changed once per year
}
```

### Product

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;           // Philippine Pesos (₱)
  category: ProductCategory; // 'Cakes' | 'Cookies' | 'Pastries'
  image: string;           // URL
  stock: number;
}
```

### Order

```typescript
interface Order {
  id: string;              // Format: 'ORD-XXXXXX' or 'INQ-XXXXXX' for custom inquiries
  userId: string;
  customerName: string;
  items: CartItem[];       // Snapshot of purchased items at order time
  totalAmount: number;
  status: OrderStatus;     // 'Pending' | 'Confirmed' | 'Baking' | 'Completed' | 'Cancelled'
  paymentMethod: PaymentMethod;   // 'Cash on Delivery' | 'GCash'
  deliveryMethod: DeliveryMethod; // 'Pickup' | 'Delivery'
  scheduledDate: string;
  scheduledTime: string;
  deliveryAddress?: string;
  isCustomInquiry?: boolean;
  customDetails?: {
    size: string;
    notes: string;
    referenceImage?: string;
  };
}
```

### UserNotification

```typescript
interface UserNotification {
  id: string;
  userId: string;
  message: string;
  orderId: string;
  orderStatus: OrderStatus;
  isRead: boolean;
  createdAt: string;
}
```

---

## Architecture

### State Management

All shared state lives in [`StoreContext`](context/StoreContext.tsx). It is the single source of truth for: the authenticated user, product catalog, shopping cart, orders, and notifications. Every page reads from and writes to `StoreContext` via the `useStore()` hook.

```
StoreContext (global state)
    ├── user           — authenticated user profile (null if logged out)
    ├── products       — full product catalog from Supabase
    ├── cart           — current shopping cart (persisted to sessionStorage)
    ├── orders         — all orders (customers see own; admin sees all)
    └── notifications  — in-app toast messages
```

### Page-Level Logic Hooks

When a page's state, effects, and handlers exceed ~40 lines, they are extracted into a custom hook in `hooks/`. The page file becomes a thin orchestrator — it calls the hook and renders JSX, nothing else. Currently `hooks/useCakePage.ts` owns all logic for the `/custom-cake` route.

### Data Layer

All Supabase interactions go through a single abstraction layer: the `DatabaseProvider` interface in [`services/db.ts`](services/db.ts). Components never call `supabase` directly — they call `db.login()`, `db.getOrders()`, etc. This keeps all data access logic in one file and makes the backend swappable.

### Route Code Splitting

Every page is lazy-loaded using `React.lazy()`. Each page becomes a separate JavaScript file that is only downloaded when the user navigates to that route, reducing initial load time. Each lazy route has a dedicated skeleton screen shown during loading.

### Real-time Notifications

When a customer is logged in, `StoreContext` opens a Supabase Realtime channel subscribed to `INSERT` events on `user_notifications` filtered by `user_id`. When the admin updates an order status, the app:
1. Calls `db.updateOrder()` to update the order row
2. Calls `db.addUserNotification()` to insert a notification row
3. The customer's browser receives the new row in real time and displays a toast

---

## Deployment

The app is deployed on Vercel and is accessible at **[bakedbyiyah.vercel.app](https://bakedbyiyah.vercel.app)**.

### Deploy Your Own

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Set the required environment variables in Vercel **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Vercel will automatically run `npm run build` and deploy the `dist/` output.

No server configuration is needed — this is a fully static SPA. All backend logic runs through Supabase.
