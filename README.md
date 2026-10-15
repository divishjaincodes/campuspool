# CampusPool 🚗

> **Ride Together. Pay Less. Travel Safer.**  
> A full-stack-ready, mobile-first student carpooling platform designed for **VIT Bhopal University**.

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

**CampusPool** connects VIT Bhopal University students travelling along common commuting corridors between **Bhopal**, **Sehore**, **Ashta**, and the campus at Kothri Kalan. Students can share vehicle space, split fuel and toll expenses transparently, and travel comfortably with verified peers.

### Core Philosophy: Single Student Role
- **One User Role Only:** Every registered user is a **Student** (`role: 'student'`). No separate driver signup, driver login, or driver dashboards.
- **Ride Creator / Posted By:** Any student can offer spare seats in their vehicle. They are credited as **"Ride Creator"** or **"Posted by"**—never a commercial driver role.
- **Instant Automatic Booking:** When a student requests an open seat, confirmation happens **automatically** if seats are available and ride restrictions (such as Women-Only) are satisfied. No manual driver approval queue.
- **Seat Allocation & Overbooking Prevention:** Seats decrement immediately upon booking and are instantly released back if a booking is cancelled.
- **Direct Cost-Sharing:** All contributions (Option A: Fixed per seat or Option B: Shared total trip cost) are direct splits settled via cash or UPI during travel. CampusPool does not act as a commercial middleman.

---

## 🎨 Apple-Inspired Minimalist Design System

- **Global Typography:** 100% **Poppins** (Google Fonts weights: 300, 400, 500, 600, 700, 800) loaded across every heading, label, input, button, table, and modal.
- **Color Palette:**
  - Background: Pure White `#FFFFFF` & Soft Neutral `#F5F5F7`
  - Primary Typography: Near-Black `#1D1D1F`
  - Secondary Typography: Muted Grey `#6E6E73`
  - Restrained Accent: Apple Blue `#0071E3`
  - Subtle Borders: `#D2D2D7`
- **Mobile-First Responsiveness:**
  - Tested from **320px** viewport up to desktop without horizontal scrolling.
  - Dedicated **Fixed Mobile Bottom Navigation Bar** (`Home`, `Find Rides`, `Offer Ride`, `My Trips`, `Profile`) with device safe-area insets (`env(safe-area-inset-bottom)`).
  - Mobile bottom filter drawer and desktop sidebar with active filter counters.
  - 6-step mobile wizard for ride creation with real-time cost calculation preview.

---

## 🛡️ Women-Only Ride Safety

Female students can create or search for rides restricted to women. The platform automatically validates the student's self-declared profile during instant booking, blocking ineligible accounts with a clear and respectful community notice.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone https://github.com/divishjaincodes/campuspool.git
cd campuspool

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 👥 Demo Personas & Quick Switcher

CampusPool features a persistent floating **Demo Bar** at the top of the interface allowing instant switching between test student personas without entering passwords:

1. **Aarav Sharma** (`aarav.sharma2023@vitbhopal.ac.in`) — Student (Owner of Honda City, creator of Bhopal ↔ Campus rides).
2. **Ananya Patel** (`ananya.patel2023@vitbhopal.ac.in`) — Student (Female, creator of Women-Only rides from Lalghati to Campus).
3. **Rohan Verma** (`rohan.verma2024@vitbhopal.ac.in`) — Student (Male commuter booking seats from Bhopal ISBT).
4. **Priya Singh** (`priya.singh2024@vitbhopal.ac.in`) — Student (Female commuter booking seats on Women-Only rides).
5. **CampusPool Moderator** (`admin@campuspool.vitbhopal.ac.in`) — Campus cell administrator with access to `/admin` analytics, user suspension, and safety reports.

*Reset Demo Data:* Click the reset icon in the demo bar or visit `/settings` to restore the fresh seed dataset.

---

## 📂 Project Architecture

```
src/
├── components/
│   ├── common/        # Navbar, BottomNav, DemoSwitcher, ConfirmModal, EmptyState, Footer
│   ├── layout/        # AppLayout with safe padding
│   └── rides/         # RideCard, GenderBadge, InstantBookModal, RideFilterSheet
├── context/           # AuthContext (single student role), ToastContext
├── data/              # Realistic mock seed data for VIT Bhopal & commuting routes
├── pages/
│   ├── admin/         # AdminDashboard, AdminUsers, AdminRides, AdminReports, AdminAnalytics
│   ├── CreateRidePage.tsx     # 6-step guided ride offering wizard
│   ├── DashboardPage.tsx      # Unified student dashboard
│   ├── LandingPage.tsx        # Hero, quick search, and carpool benefits
│   ├── MessagesPage.tsx       # In-app chat threads linked to carpools
│   ├── MyTripsPage.tsx        # "Rides I Created" & "Rides I Booked"
│   ├── NotificationsPage.tsx  # Alerts for bookings and messages
│   ├── ProfilePage.tsx        # Student identity, gender disclosure, vehicle info
│   ├── RideDetailPage.tsx     # Journey timeline, creator profile, instant booking
│   ├── RidesPage.tsx          # Ride discovery with multi-criteria filters
│   └── SafetyPage.tsx         # Guidelines and emergency protocols
├── services/
│   ├── mock/          # LocalStorage implementation (auth, rides, bookings, chat, reports)
│   └── index.ts       # Unified service contract ready for Supabase migration
├── types/             # TypeScript interfaces matching future PostgreSQL tables
└── utils/             # Cost calculation engine and date formatters
```

---

## 🔮 Future Supabase Integration

The frontend uses a clean service abstraction (`src/services/`) that mirrors the future Supabase schema:
- **Supabase Auth:** Replacing `authService` with passwordless college email OTP.
- **PostgreSQL Tables:** Direct mapping to `profiles`, `rides`, `bookings`, `messages`, `reviews`, and `reports`.
- **Atomic Concurrency:** PostgreSQL functions enforcing seat reservation and overbooking prevention at the database level.
- **Row Level Security (RLS):** Policies restricting phone numbers and private registration details to confirmed co-passengers only.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
