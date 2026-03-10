<div align="center">

# 🎂 Baked By Iyah — Order Management System

**A full-stack web application for managing orders, products, and customer inquiries for Baked By Iyah, a homemade bakery in the Philippines.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-bakedbyiyah.vercel.app-rose?style=for-the-badge)](https://bakedbyiyah.vercel.app)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-green?style=for-the-badge&logo=supabase)](https://supabase.com)

</div>

---

## Overview

Single-page application built with React and Supabase. Customers browse products, place orders, and request custom cakes. The admin manages orders, inventory, and the menu — all in real time.

---

## Key Modules

**Authentication** — Email/password and Google OAuth login. Role-based access separates customers from the admin. The `/admin` route is fully protected from customer access.

**Product Catalog** — Menu page filtered by category (Cakes, Cookies, Pastries). Supports best seller badges and admin-controlled product visibility toggles.

**Shopping Cart & Checkout** — Persistent cart across page refreshes. Checkout supports Cash on Delivery or GCash, and Pickup or Delivery with scheduling.

**Custom Cake Inquiry** — Customers submit a request with size, flavor notes, and an optional reference image. Admin accepts or declines and sets a custom price.

**Order Management** — Customers view order history with live status updates. Admin views, filters, sorts, and paginates all orders and inquiries.

**Admin Dashboard** — Centralized panel for managing orders, inquiries, inventory, menu items, and sales reports.

**Real-Time Notifications** — In-app toasts pushed instantly to customers when the admin updates an order status, via Supabase Realtime.

**Email Notifications** — Transactional emails sent on order placement and key status changes, handled by a Supabase Edge Function.

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

| Category | Tool / Technology | Purpose |
|---|---|---|
| Frontend | React 18 | UI component framework |
| Language | TypeScript 5.7 | Type safety across the codebase |
| Build | Vite 6 | Dev server and production bundler |
| Styling | Tailwind CSS | Utility-first CSS styling |
| Routing | React Router v6 | Client-side page navigation |
| Database | Supabase (PostgreSQL) | Stores all app data with Row Level Security |
| Authentication | Supabase Auth | Email/password and Google OAuth |
| Realtime | Supabase Realtime | Live notification delivery to the browser |
| Edge Functions | Supabase + Deno | Server-side email sending logic |
| Charts | Recharts | Sales report visualizations |
| Icons | Lucide React | UI icon set |
| Deployment | Vercel | Hosts and auto-deploys from GitHub |

---

## Routes

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/menu` | Product catalog | Public |
| `/custom-cake` | Custom cake inquiry | Public |
| `/contact` | Contact and FAQ | Public |
| `/login` | Login | Public |
| `/register` | Registration | Public |
| `/cart` | Cart and order history | Authenticated |
| `/checkout` | Place an order | Authenticated |
| `/profile` | Profile settings | Authenticated |
| `/admin` | Admin dashboard | Admin only |

---

## Architecture

**State Management** — All shared state lives in `StoreContext` — the single source of truth for the authenticated user, cart, products, orders, and notifications. Every page accesses it via `useStore()`.

**Data Layer** — All Supabase calls go through the `DatabaseProvider` interface in `services/db.ts`. Components never call `supabase` directly, keeping all data access in one place and the backend swappable.

**Code Splitting** — Every page is lazy-loaded via `React.lazy()`, downloading only when visited. Each lazy route has a dedicated skeleton screen shown during loading.

**Real-Time Notifications** — `StoreContext` subscribes to `INSERT` events on `user_notifications` filtered by `user_id`. When the admin updates an order, a notification row is inserted and the customer's browser receives it instantly.

---

## Deployment

Live at [bakedbyiyah.vercel.app](https://bakedbyiyah.vercel.app). Deployed on Vercel — add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel environment variables. No server configuration needed.
