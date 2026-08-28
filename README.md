# 🏭 Sewak Plastics Field Sales Tracker & Verification PWA

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)
[![Dexie IndexedDB](https://img.shields.io/badge/Dexie.js-IndexedDB-orange.svg)](https://dexie.org/)
[![PWA](https://img.shields.io/badge/PWA-VitePWA-purple.svg)](https://vite-pwa-org.netlify.app/)

A lightweight, mobile-first Progressive Web App (PWA) built for **Sewak Plastics (Kenya)** to monitor field sales representatives during work hours, verify physical shop visits, and prevent location spoofing under unstable 3G/4G connectivity on low-end Android handsets.

---

## 🎨 Design System & Brand Palette

- **Primary Red:** `#B91C1C` (Action buttons, anomaly alert badges, brand accents)
- **Deep Blue:** `#172554` (Headers, navbars, admin sidebar, primary container backgrounds)
- **Outdoor Background:** Light surface (`#F8FAFC` / `#FFFFFF`) for maximum outdoor readability under high sunlight
- **Mobile UX Target:** Large tap targets ($\ge 48\text{px}$ touch height), zero dense desktop overhead, minimal DOM overhead.

---

## 🚀 Key Features

### 👤 1. Mobile Field Agent View (`/agent`)
- **Clock In / Shift Banner:**
  - One-tap toggleable Clock In / Clock Out button in `#172554` / `#B91C1C`.
  - Shift status indicator: *"Tracking Active (8:00 AM - 5:00 PM EAT)"*.
  - Automatically restricts tracking outside Kenya working hours (8:00 AM – 5:00 PM EAT) to comply with Kenya Data Protection regulations.
- **Simplified Client Visit Entry (`/agent/visit`):**
  - **Auto-Captured Read-Only Fields:** NTP Server validated Timestamp, High-precision GPS Fix ($\pm \text{accuracy}$ meters), Client Network IP, Device Model & Browser Fingerprint.
  - **Inputs:** Shop / Hardware Name, Customer Phone (Kenyan format validation `07...` or `01...`), Landmark / Physical Location, Orders & Comments.
  - **Storefront Proof Photo:** Native camera viewfinder directly streaming from hardware (`capture="environment"` fallback) with embedded anti-spoofing watermark stamps (GPS, Agent Name, EAT Timestamp). Gallery photo uploads are strictly blocked.
- **Offline Sync & Status Banner:**
  - Sticky top bar: 🟢 **Online (Synced)** or 🟠 **Offline (X entries stored safely on device)**.
  - Local IndexedDB storage with automatic background synchronization when 3G/4G connectivity returns.

---

### 🛡️ 2. Anti-Spoofing & Offline Data Integrity
- **Mock Location Detection:** Inspects HTML5 Geolocation `isMocked` property reported by Android Chrome.
- **Velocity Jump Filter:** Computes Haversine distance and speed between consecutive fixes. Discrepancies exceeding **$100\text{ km/h}$** or teleportation are flagged with alert badges.
- **Time Tampering Protection:** Verifies local device clock against NTP server / HTTP `Date` headers (`https://worldtimeapi.org/api/timezone/Africa/Nairobi`). Time skews $> 5\text{ minutes}$ trigger warning flags.
- **SHA-256 Integrity Hash:** Every local visit payload is hashed with SHA-256 before saving to IndexedDB, preventing client-side database tampering before sync.

---

### 🗺️ 3. Operations Admin Dashboard (`/admin`)
- **Real-Time Kenya Map Monitor (`/admin/map`):**
  - Interactive Leaflet map centered on Kenya (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret).
  - **Color-Coded Status Pins:**
    - 🟢 **Green:** Moving / Active
    - 🟠 **Orange:** Stationary $> 15\text{ mins}$
    - 🔴 **Red:** GPS Disabled / Offline
    - 🔵 **Blue:** Verified Shop Visit Logged
  - **Agent Drawer:** Slide-over panel displaying today's breadcrumb travel route with polylines, timestamps, velocity logs, and visit history.
  - **Live Movement Simulator:** One-click simulation tool for testing agent routes on desktop browsers.
- **Visit Verification Table (`/admin/visits`):**
  - Searchable and filterable table of all store visits.
  - Anti-spoofing anomaly alert badges with flag reasons (e.g. *Velocity Jump: 125 km/h*).
  - Photo inspection lightbox modal and manual "Mark Verified" / "Flag Anomaly" toggles.
- **Sales Agents Roster (`/admin/agents`):**
  - Directory of sales reps, device fingerprints, authorization PINs, and shift activity.

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

The complete SQL migration script with Row Level Security (RLS) policies and seed data is located in:
👉 [`supabase/schema.sql`](supabase/schema.sql)

### Tables:
1. `profiles`: `id`, `full_name`, `phone_number`, `role`, `device_fingerprint`, `is_active`, `pin`
2. `location_logs`: `id`, `agent_id`, `latitude`, `longitude`, `accuracy`, `speed`, `is_mocked`, `ip_address`, `recorded_at`, `is_synced_offline`
3. `client_visits`: `id`, `agent_id`, `shop_name`, `phone_number`, `physical_location`, `latitude`, `longitude`, `comments`, `device_ip`, `device_name`, `visited_at`, `photo_url`, `is_flagged`, `flag_reason`, `integrity_hash`

---

## 🔑 Demo Access Profiles

| Role | Name | Phone Number | PIN | Location |
|---|---|---|---|---|
| **Field Agent** | John Kimani | `0712345678` | `1234` | Nairobi Eastlands |
| **Field Agent** | Mercy Achieng | `0723456789` | `1234` | Mombasa Coastal |
| **Field Agent** | David Kiprono | `0734567890` | `1234` | Kisumu Central |
| **Field Agent** | Faith Wanjiku | `0745678901` | `1234` | Nakuru Hub |
| **Operations Admin** | Sarah Mwangi | `0700000000` | `8888` | Operations HQ |

*Quick login buttons are available directly on the login screen.*

---

## 💻 Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` if connecting to live Supabase:
```bash
cp .env.example .env
```
*(If no Supabase credentials are provided, the app seamlessly runs in built-in offline local store mode with full persistence).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:8001](http://localhost:8001) in your browser.

### 4. Build for Production
```bash
npm run build
```
The output will be bundled in the `dist/` directory ready for static hosting or PWA deployment on Vercel, Netlify, or AWS S3/CloudFront.
