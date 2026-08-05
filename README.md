<div align="center">

<img src="./public/navLogos.png" alt="Easy Wheels Logo" width="140" />

# Easy Wheels

### A full-stack, production-grade ride-hailing platform

Built with **Next.js 14 · TypeScript · MongoDB · Tailwind CSS · Socket.io · Razorpay · ZegoCloud**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

[Live Demo](https://easy-wheels.vercel.app) · [Report a Bug](../../issues) · [Request Feature](../../issues)

---

<!-- SCREENSHOTS PLACEHOLDER -->
> 📸 **Screenshots coming soon** — live app screenshots will be added here.

---

</div>


## 🚀 Overview

**Easy Wheels** is a production-ready ride-hailing web application inspired by platforms like Ola and Uber. It supports three distinct user roles — **Customer**, **Partner (Driver)**, and **Admin** — each with their own dedicated dashboards, workflows, and access controls.

The platform handles the complete lifecycle of a ride: from partner onboarding with KYC verification, to real-time ride tracking on a live map, to payment collection through Razorpay. Every step is managed through clean, animated interfaces built with a consistent design system.

> This is a **solo full-stack project**, covering UI/UX design, frontend development, backend API design, database modelling, third-party integrations, real-time communication, and deployment.

---

## ✨ Core Features

### For Customers
- 🔍 Search rides with **address autocomplete** (Photon/Komoot geocoding)
- 📍 Use **current GPS location** as pickup point with automatic reverse geocoding
- 🗺️ Interactive **Leaflet map** with live route rendering via OSRM
- 🚗 Browse **nearby available vehicles** filtered by type and proximity
- 💳 Pay seamlessly via **Razorpay** (UPI, cards, net banking)
- 📡 **Real-time ride tracking** via WebSockets

### For Partners (Drivers)
- 🧭 Guided **8-step onboarding** from vehicle registration to going live
- 📄 Upload KYC documents (Aadhaar, Driving Licence, Vehicle RC) to Cloudinary
- 🏦 Set up payout account with bank details and UPI ID
- 📹 Complete **Video KYC** with admin via ZegoCloud
- 💰 Configure vehicle pricing (base fare, per-KM rate, waiting charge)
- 📊 Track onboarding progress with a visual step-by-step dashboard

### For Admins
- 📊 **Admin dashboard** with KPI cards (total riders, approved, pending, rejected)
- 🔎 Review pending rider applications with full document previews
- ✅ Approve or reject riders/vehicles/KYC with contextual rejection reasons
- 🎥 Start, join, and conclude live **Video KYC sessions**
- 🔔 All actions trigger **automated email notifications** to riders

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + custom design tokens |
| **Animations** | Framer Motion (`motion/react`) |
| **State Management** | Redux Toolkit |
| **Authentication** | NextAuth.js (credentials + session strategy) |
| **Database** | MongoDB with Mongoose ODM |
| **File Storage** | Cloudinary |
| **Maps** | Leaflet.js + React Leaflet |
| **Routing** | OSRM (Open Source Routing Machine) |
| **Geocoding** | Photon by Komoot (OpenStreetMap-based) |
| **Real-time** | Socket.io (WebSockets) |
| **Payments** | Razorpay |
| **Video KYC** | ZegoCloud UIKit |
| **Email** | Nodemailer (SMTP) |
| **Icons** | Lucide React |
| **HTTP Client** | Axios |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP ROUTER                       │
├──────────────────┬──────────────────┬───────────────────────────┤
│   /user/*        │   /rider/*       │   /admin/*                │
│  Customer UI     │  Partner UI      │  Admin Dashboard          │
├──────────────────┴──────────────────┴───────────────────────────┤
│                     API ROUTES  (/api/*)                        │
│  auth · user · rider · admin · vehicles · bookings · payments   │
├─────────────────────────────────────────────────────────────────┤
│              SOCKET.IO SERVER (Real-time events)                │
│      ride:request · ride:accept · location:update · etc.        │
├──────────┬──────────────┬───────────────┬────────────────────────┤
│ MongoDB  │  Cloudinary  │  Razorpay     │  ZegoCloud / Nodemailer│
│ Database │  File Upload │  Payments     │  Video KYC / Emails    │
└──────────┴──────────────┴───────────────┴────────────────────────┘
```

---
## 👥 User Roles & Flows

### User (Rider / Customer)

```
Register/Login → Book a Ride → Select Vehicle + Enter Locations
→ View Map (route + nearby vehicles) → Choose Vehicle → Pay via Razorpay
→ Track Ride in Real-time → Ride Complete
```

### Partner (Driver)

```
Register → 8-Step Onboarding (see below) → Admin Review → Go Live
→ Receive Ride Requests via Socket.io → Accept/Reject
→ Real-time Location Updates → Collect Payment
```

### Admin

```
Login → Dashboard (KPIs + review queues)
→ Review Rider Applications → Approve/Reject
→ Start Video KYC Sessions → Approve/Reject KYC
→ Review Vehicle Pricing → Approve/Reject
```

---

## 🧭 Partner Onboarding Pipeline

The partner onboarding is a **sequential 8-step wizard** where each step unlocks the next only after admin approval at key checkpoints.

| Step | Title | Description | Status Flow |
|------|-------|-------------|-------------|
| 1 | **Vehicle Details** | Type, number, model | Auto-saved |
| 2 | **Documents** | Aadhaar, Driving Licence, RC (Cloudinary) | → Admin reviews |
| 3 | **Bank & Payout** | Account number, IFSC, UPI | Auto-saved |
| 4 | **Review** | Admin reviews complete profile | `pending → approved/rejected` |
| 5 | **Video KYC** | Live face verification via ZegoCloud | `pending → in_progress → approved/rejected` |
| 6 | **Pricing** | Set base fare, per-KM rate, waiting charge + vehicle photo | → Admin reviews |
| 7 | **Final Review** | Last admin check | `pending → approved` |
| 8 | **Live** | Partner can now receive ride requests | 🟢 Active |

**Progress tracking:** Each step writes to `user.riderOnboardingSteps` (integer 0–8). The partner dashboard renders a scrollable step tracker with status pills, a horizontal progress timeline, a circular arc indicator, and auto-expanding panels (e.g. Video KYC dropdown with room ID and join button).

**Rejection flow:** If any step is rejected, the `rejectionReason` is surfaced inline in the partner dashboard with a "Request Again" option where applicable.

---

## 🔍 Admin Review Workflows

### Rider Review (`/admin/reviews/rider/[id]`)
- Full split-layout page: left column has vehicle details, KYC document previews (PDF iframe + image lightbox), and bank details; right sidebar has rider profile and a visual review checklist.
- **Approve** → `GET /api/admin/reviews/rider/[id]/approve` — sets `riderStatus: "approved"`, advances onboarding step.
- **Reject** → `POST /api/admin/reviews/rider/[id]/reject` — stores `rejectionReason`, sends email notification.

### Vehicle Pricing Review (`/admin/reviews/vehicle/[id]`)
- Shows vehicle photo, type/number/model, full pricing breakdown (base + per-KM + waiting), and owner profile.
- **Approve** → `GET /api/admin/reviews/vehicle/[id]/approve` — sets `vehicle.status: "approved"`, advances rider to step 7.
- **Reject** → `POST /api/admin/reviews/vehicle/[id]/reject` — stores rejection reason, rider can resubmit.

### Video KYC (`/admin/video-kyc/*`)
- Admin starts a session via `GET /api/admin/video-kyc/start/[riderId]` — generates a ZegoCloud room ID, sets `videoKYCStatus: "in_progress"`.
- Admin and rider join the same room at `/rider/video-kyc/[roomId]`.
- Admin completes session via `POST /api/admin/video-kyc/complete` with `action: "approved" | "rejected"` + optional `rejectionReason`.

---

## 📡 Real-time Features

Socket.io powers all live interactions:

| Event | Direction | Description |
|-------|-----------|-------------|
| `ride:request` | Server → Partners | Broadcast new ride to nearby available partners |
| `ride:accept` | Partner → Server | Partner accepts a ride |
| `ride:reject` | Partner → Server | Partner rejects a ride |
| `location:update` | Partner → Server | Continuous GPS coordinates during active ride |
| `location:broadcast` | Server → User | Forward location to the booking user |
| `ride:complete` | Partner → Server | Marks ride as done, triggers payment |
| `kyc:status` | Server → Rider | Notify rider when KYC session starts |

---

## 🗺️ Maps & Geocoding

### Leaflet.js (React Leaflet)
- CARTO light tiles for the base map with an optional satellite layer.
- Draggable pickup and drop markers — on drag-end, reverse geocodes the new position via Nominatim and updates the parent state.
- A **Recenter button** (top-left) fits all route points back into view with animated padding.
- Route drawn as a polyline fetched from **OSRM** (`router.project-osrm.org`) with a haversine fallback for straight-line distance when OSRM is unavailable.
- Mid-route distance badge rendered as a Leaflet `divIcon` at the polyline midpoint.

### Photon by Komoot
- Address autocomplete with debounced search (380ms) — queried as the user types.
- Results normalised into `{ name, city, state, country, lat, lng, fullLabel }`.
- Reverse geocoding on "Use my location" button using the browser Geolocation API.

---

## 💳 Payments — Razorpay

```
User selects ride → POST /api/payments/create-order
  → Razorpay.orders.create({ amount, currency, receipt })
  → Returns { orderId, amount, currency }

Frontend opens Razorpay checkout modal
  → On payment success → POST /api/payments/verify
  → Validate HMAC SHA256 signature
    → On valid: mark booking as paid, emit ride:request via Socket.io
    → On invalid: return 400
```

Supported payment methods: **UPI · Debit/Credit Cards · Net Banking · Wallets**

---

## 🎥 Video KYC — ZegoCloud

Easy Wheels uses ZegoCloud's UIKit Prebuilt for 1-on-1 video verification.

**Flow:**
1. Admin clicks "Start KYC" → API generates a room ID (`kyc-{riderId}-{timestamp}`) and updates `videoKYCRoomId` and `videoKYCStatus: "in_progress"` on the user document.
2. Rider's dashboard auto-expands the Video KYC panel showing the room ID, a "Join Call" button, and pre-flight tips.
3. Both join `/rider/video-kyc/[roomId]` — the page shows a camera preview, mic/camera toggles, and device status indicators before joining.
4. Admin sees "Approve KYC" and "Reject" buttons in the top bar (visible only during the active call).
5. On completion, `POST /api/admin/video-kyc/complete` updates status and emails the rider.

**Token generation** uses `ZegoUIKitPrebuilt.generateKitTokenForTest` (development) — replace with server-side token generation for production.

---

## 📧 Email Automation

Automated emails are sent using **Nodemailer** (SMTP) for the following events:

| Trigger | Recipient | Content |
|---------|-----------|---------|
| Rider application approved | Partner | Welcome + next steps |
| Rider application rejected | Partner | Reason + resubmission instructions |
| Video KYC approved | Partner | Confirmation + pricing step prompt |
| Video KYC rejected | Partner | Rejection reason + request-again link |
| Vehicle pricing approved | Partner | Confirmation + final review info |
| Vehicle pricing rejected | Partner | Reason + resubmission instructions |
| Booking confirmed | Customer | Booking details + estimated fare |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/[...nextauth]` | NextAuth handler (login/session) |

### Rider Onboarding
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/rider/onboarding/vehicle` | Get or submit vehicle details |
| `GET/POST` | `/api/rider/onboarding/documents` | Get or upload KYC documents |
| `GET/POST` | `/api/rider/onboarding/bank` | Get or submit bank details |
| `GET/POST` | `/api/rider/onboarding/pricing` | Get or submit vehicle pricing + image |
| `GET` | `/api/rider/video-kyc/request` | Request a new Video KYC slot |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Stats + pending review lists |
| `GET` | `/api/admin/reviews/rider/[id]` | Full rider details for review |
| `GET` | `/api/admin/reviews/rider/[id]/approve` | Approve rider application |
| `POST` | `/api/admin/reviews/rider/[id]/reject` | Reject with reason |
| `GET` | `/api/admin/reviews/vehicle/[id]` | Vehicle pricing details |
| `GET` | `/api/admin/reviews/vehicle/[id]/approve` | Approve vehicle pricing |
| `POST` | `/api/admin/reviews/vehicle/[id]/reject` | Reject with reason |
| `GET` | `/api/admin/video-kyc/pending` | Pending KYC rider list |
| `GET` | `/api/admin/video-kyc/start/[id]` | Start KYC session, generate room |
| `POST` | `/api/admin/video-kyc/complete` | Complete KYC (approve/reject) |

### Vehicles & Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/vehicles/near-by` | Geospatial nearby vehicle search |
| `POST` | `/api/payments/create-order` | Create Razorpay order |
| `POST` | `/api/payments/verify` | Verify payment signature |

---


## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# ── App ──────────────────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# ── MongoDB ───────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/easy-wheels

# ── Cloudinary ────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Razorpay ──────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx

# ── ZegoCloud ─────────────────────────────────────────────────
NEXT_PUBLIC_ZEGO_APP_ID=123456789
NEXT_PUBLIC_ZEGO_SERVER_SECRET=your_zego_server_secret

# ── Email (SMTP) ──────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=Easy Wheels <noreply@easywheels.com>

# ── Socket.io ─────────────────────────────────────────────────
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

> ⚠️ **Never commit your `.env.local` file.** It is already included in `.gitignore`.

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18.0.0`
- MongoDB Atlas account (or local MongoDB `>= 6.0`)
- Cloudinary account
- Razorpay account (test mode is fine for development)
- ZegoCloud account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/easy-wheels.git
cd easy-wheels

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in all values

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Create an Admin Account

After registering a new account, manually update the role in MongoDB:

```javascript
// In MongoDB Atlas or mongosh
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Seed Vehicles (Optional)

To test the nearby vehicle search without going through full onboarding, you can insert a test vehicle with a GeoJSON location:

```javascript
db.vehicles.insertOne({
  type: "bike",
  vehicleNumber: "DL01AB0001",
  vehicleModel: "Honda Activa",
  status: "approved",
  isActive: true,
  baseFare: 30,
  pricePerKM: 12,
  waitingCharge: 2,
  location: { type: "Point", coordinates: [77.2090, 28.6139] }
})
```

---

## ☁️ Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set all environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.


## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
# Fork the project
# Create your feature branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m "feat: add your feature"

# Push to the branch
git push origin feature/your-feature-name

# Open a Pull Request
```

Please follow the existing code style — TypeScript strict mode, Tailwind-only styling, and functional React components with hooks.



<div align="center">

Built with ❤️ by **[Saket](https://github.com/sakettt07)**

⭐ Star this repo if you found it helpful!

</div>
