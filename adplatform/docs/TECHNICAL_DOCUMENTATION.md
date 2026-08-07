# Studio Arella — Technical Documentation

## 1. System Architecture Overview

Studio Arella's AdPlatform is a full-stack web application designed for booking and managing digital out-of-home (DOOH) advertising screens. 

### Technology Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand (State Management), Lucide React (Icons).
- **Backend:** Node.js, Express, TypeScript.
- **Database:** PostgreSQL (using `pg` driver with raw SQL).
- **Integrations:** Cloudinary (Media Hosting), n8n (AI Moderation), Paystack (Payments).

### High-Level Architecture
1. **Client Layer (Next.js):** Communicates with the backend via REST APIs using `axios`. Manages local state using Zustand.
2. **API Layer (Express):** Exposes secure endpoints. Handles authentication (JWT), business logic, and database operations.
3. **Storage Layer:** PostgreSQL stores structured data (users, campaigns, bookings). Cloudinary hosts raw media assets (videos/images).

---

## 2. Core Workflows & Custom Features

### 2.1 Video Upload & AI Moderation (n8n Gatekeeper)
The platform features a synchronous AI moderation pipeline. When a user uploads an ad creative, it is not saved to the database immediately. 
1. The frontend initiates a `multipart/form-data` upload to the backend.
2. The backend intercepts the file and sends it to a secure **n8n Webhook**.
3. n8n uploads the file to Cloudinary and runs AI models (e.g., Google Vision/Video Intelligence) to detect explicit content.
4. The backend waits (synchronously) for the n8n response:
   - **If Approved:** n8n returns `{"status": "approved", "cloudinary_url": "..."}`. The backend saves the ad to the database and returns a `201 Created` to the frontend.
   - **If Rejected:** n8n returns `{"status": "rejected", "reason": "Explicit content detected"}`. The backend discards the ad and returns a `400 Bad Request`, displaying the reason on the frontend.

### 2.2 Auto-Spillover Booking Scheduler
The booking calendar employs a strict, contiguous-block algorithm to ensure zero fragmentation on the screen.
- **Strictly Ascending Allocation:** The system auto-assigns minute slots from `:00` upwards based on existing bookings. Users cannot manually skip or create gaps within an hour.
- **Auto-Spillover:** If a user requests a loop duration (e.g., 70 minutes) that exceeds the remaining availability in the current hour, the system assigns a single contiguous block that automatically spills over into the next consecutive hours.
- **Read-Only UI:** The Minute Grid in the frontend is read-only, serving merely as a visual tracker of the system's mathematically optimized assignments.

---

## 3. Backend Infrastructure & API Payloads

The backend provides a secure REST API. Below are the core payloads for the primary endpoints.

### Authentication Endpoints
**`POST /api/auth/register`**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "business_name": "Arella Corp",
  "phone": "+2348000000000",
  "role": "advertiser" // or "screen_owner"
}
```

**`POST /api/auth/login`**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```
*Response returns a signed JWT token used for all subsequent authenticated requests.*

### Ad Creatives
**`POST /api/ads`** (Sent as `multipart/form-data`)
```text
title: "Summer Promo"
campaign_id: 12
duration_seconds: 60
media_type: "video"
file: <Binary File Data>
```

### Campaigns
**`POST /api/campaigns`**
```json
{
  "name": "Q3 Marketing Push",
  "budget": 50000,
  "start_date": "2026-09-01T00:00:00Z",
  "end_date": "2026-09-30T23:59:59Z"
}
```

### Bookings
**`POST /api/bookings`**
Creates a booking block spanning the allocated time slots.
```json
{
  "screen_id": 1,
  "campaign_id": 12,
  "ad_id": 45,
  "start_time": "2026-08-10T14:15:00Z",
  "end_time": "2026-08-10T15:25:00Z",
  "duration_minutes": 70,
  "total_cost": 70000,
  "payment_reference": "ref_123456789"
}
```

### Payments & Finances
**`POST /api/finances/add-credits`**
Triggered after a successful Paystack transaction.
```json
{
  "amount": 50000,
  "reference": "paystack_txn_987654321"
}
```

---

## 4. Frontend Application Structure

The frontend is built with Next.js 14 utilizing the App Router (`app/` directory).

- **Routing:** All protected routes sit inside dashboard layouts. Routing paths correspond exactly to the dashboard navigation (e.g., `/dashboard`, `/campaigns`, `/book`, `/finances`).
- **State Management:** Handled by `Zustand`. Key stores include `authStore` (user sessions) and `cartStore` (pending bookings before checkout).
- **Styling:** Fully implemented with Tailwind CSS. Theme variables (colors, fonts, radii) are centrally managed in `globals.css` and a central `theme.ts` utility file for programmatic CSS injection.
- **Animations:** Employs Framer Motion (and custom CSS keyframes) for micro-interactions, page transitions, and toast notifications to deliver a highly premium, dynamic user experience.

---

## 5. Deployment & Configuration

### Environment Variables
**Backend (`.env`)**
```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/adplatform
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/video-moderation
```

**Frontend (`.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Planned Hosting Environment
1. **Hostinger:** The platform is planned to be migrated and hosted entirely on Hostinger. This includes hosting the Next.js frontend, the Node.js backend API, and the PostgreSQL database within Hostinger's VPS or specialized hosting environments.
