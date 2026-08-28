# 🏭 Sewak Plastics Field Sales Tracker & Verification App

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)
[![Dexie IndexedDB](https://img.shields.io/badge/Dexie.js-IndexedDB-orange.svg)](https://dexie.org/)

A lightweight, mobile-first web app built for **Sewak Plastics (Kenya)** — manufacturer of **Plastic Water Tanks** and **Plastic Plumbing Pipes** only — to monitor 20 field sales representatives across **Nakuru County** during work hours, verify physical shop visits, and prevent location spoofing under unstable 3G/4G connectivity on low-end Android handsets.

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
  - **Inputs:** Shop / Hardware Name, Customer Phone (Kenyan format validation `07...` or `01...`), Landmark / Physical Location in Nakuru County, Orders & Comments.
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
- **Real-Time Nakuru County Map Monitor (`/admin/map`):**
  - Interactive Leaflet map centered on Nakuru County (Nakuru CBD, Naivasha, Gilgil, Molo, Njoro, Salgaa, Bahati & Subukia).
  - Auto-fits all 20 salesmen markers simultaneously on map load.
  - **Color-Coded Status Pins:**
    - 🟢 **Green:** Moving / Active
    - 🟠 **Orange:** Stationary $> 15\text{ mins}$
    - 🔴 **Red:** GPS Disabled / Offline
    - 🔵 **Blue:** Verified Shop Visit Logged
  - **Agent Drawer:** Slide-over panel displaying today's breadcrumb travel route with polylines, timestamps, velocity logs, and visit history.
  - **Live Movement Simulator:** One-click simulation tool for testing agent routes on desktop browsers.
- **Visit Verification Table (`/admin/visits`):**
  - Searchable and filterable table of all store visits in Nakuru County.
  - Anti-spoofing anomaly alert badges with flag reasons (e.g. *Velocity Jump: 125 km/h*).
  - Photo inspection lightbox modal and manual "Mark Verified" / "Flag Anomaly" toggles.
- **Sales Agents Roster (`/admin/agents`):**
  - Directory of 20 sales representatives, device fingerprints, authorization PINs, and shift activity.

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

The complete SQL migration script with Row Level Security (RLS) policies and seed data is located in:
👉 [`supabase/schema.sql`](supabase/schema.sql)

### Tables:
1. `profiles`: `id`, `full_name`, `phone_number`, `role`, `device_fingerprint`, `is_active`, `pin`
2. `location_logs`: `id`, `agent_id`, `latitude`, `longitude`, `accuracy`, `speed`, `is_mocked`, `ip_address`, `recorded_at`, `is_synced_offline`
3. `client_visits`: `id`, `agent_id`, `shop_name`, `phone_number`, `physical_location`, `latitude`, `longitude`, `comments`, `device_ip`, `device_name`, `visited_at`, `photo_url`, `is_flagged`, `flag_reason`, `integrity_hash`

---

## 🔑 Demo Access Profiles (Sample of 20 Reps across Nakuru County)

| Role | Name | Phone Number | PIN | Location Hub (Nakuru County) |
|---|---|---|---|---|
| **Field Agent** | John Kimani | `0712345601` | `1234` | Nakuru CBD & Section 58 |
| **Field Agent** | Mercy Achieng | `0712345602` | `1234` | Kaptembwa / Shabab |
| **Field Agent** | David Kiprono | `0712345603` | `1234` | Free Area & Pipeline |
| **Field Agent** | Faith Wanjiku | `0712345604` | `1234` | Lanet & Kunste |
| **Field Agent** | Peter Omwamba | `0712345605` | `1234` | Nakuru Industrial Area |
| **Field Agent** | Grace Njeri | `0712345606` | `1234` | Njoro Town & Egerton |
| **Field Agent** | Samuel Koech | `0712345607` | `1234` | Ngata Junction |
| **Field Agent** | Eunice Moraa | `0712345608` | `1234` | Salgaa Trading Center |
| **Field Agent** | Dennis Kipkemboi | `0712345609` | `1234` | Molo Town Center |
| **Field Agent** | Beatrice Chebet | `0712345610` | `1234` | Elburgon & Turi |
| **Field Agent** | James Mwangi | `0712345611` | `1234` | Gilgil Town |
| **Field Agent** | Rosemary Wambui | `0712345612` | `1234` | Kikopey Highway |
| **Field Agent** | Geoffrey Kiptoo | `0712345613` | `1234` | Naivasha CBD |
| **Field Agent** | Caroline Muthoni | `0712345614` | `1234` | Karagita & South Lake |
| **Field Agent** | Victor Otieno | `0712345615` | `1234` | Kayole Naivasha |
| **Field Agent** | Agnes Wanjiru | `0712345616` | `1234` | Mai Mahiu Junction |
| **Field Agent** | Brian Rotich | `0712345617` | `1234` | Bahati & Kabatini |
| **Field Agent** | Lydia Chepkemoi | `0712345618` | `1234` | Subukia Valley |
| **Field Agent** | Kevin Ochieng | `0712345619` | `1234` | Ronda & Menengai |
| **Field Agent** | Stella Nyambura | `0712345620` | `1234` | Milimani & London |
| **Operations Admin** | Sarah Mwangi | `0700000000` | `8888` | Nakuru Operations HQ |

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
