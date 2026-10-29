# Studio Arella — Complete Mobile API Specification
> **Target Audience:** Mobile Engineering Team (iOS, Android, React Native, Flutter)  
> **Backend Architecture:** Node.js / Express REST API & Supabase PostgreSQL  
> **API Version:** `v1.0.0`  
> **Default Protocol:** HTTPS / JSON (`multipart/form-data` for file & media uploads)

---

## Table of Contents
1. [Architecture & Getting Started](#1-architecture--getting-started)
   - [Base URLs & Environments](#base-urls--environments)
   - [Authentication & JWT Headers](#authentication--jwt-headers)
   - [Standard Request & Error Response Formats](#standard-request--error-response-formats)
   - [User Roles & Permissions](#user-roles--permissions)
2. [Module 1: Authentication & User Accounts](#module-1-authentication--user-accounts)
3. [Module 2: Advertiser Campaigns & Digital Billboard Screens](#module-2-advertiser-campaigns--digital-billboard-screens)
4. [Module 3: In-App Wallet, Billing & Monnify Payments](#module-3-in-app-wallet-billing--monnify-payments)
5. [Module 4: Audience & Creator Social Space (Podcasts & Feed)](#module-4-audience--creator-social-space-podcasts--feed)
6. [Module 5: Creator Memberships, Tipping & Monetization](#module-5-creator-memberships-tipping--monetization)
7. [Module 6: Physical Podcast Studio Booking](#module-6-physical-podcast-studio-booking)
8. [Module 7: Live Audio Experience Rooms](#module-7-live-audio-experience-rooms)
9. [Module 8: Direct Messaging (DMs) & Arella AI Chat](#module-8-direct-messaging-dms--arella-ai-chat)
10. [Module 9: Notifications, Support & Creative Requests](#module-9-notifications-support--creative-requests)
11. [Module 10: Admin & Moderation Operations](#module-10-admin--moderation-operations)
12. [Mobile Integration Best Practices](#mobile-integration-best-practices)

---

## 1. Architecture & Getting Started

### Base URLs & Environments

| Environment | Base URL | Notes |
| :--- | :--- | :--- |
| **Local Emulator (Android)** | `http://10.0.2.2:5000/api` | Maps to `localhost:5000` on host PC |
| **Local Simulator (iOS)** | `http://localhost:5000/api` | Direct local network bridge |
| **Staging / Production Backend** | `https://studio-arella-backend.onrender.com/api` | Primary Express REST API |
| **Next.js Web / Direct API** | `https://studio-arella.vercel.app/api` | Fast direct endpoints for audience feeds & recommendations |

> **Note on Static Media:** Uploaded images and recordings served by the backend are accessible at:  
> `${BASE_URL_WITHOUT_API}/uploads/<filename>` (e.g. `https://studio-arella-backend.onrender.com/uploads/photo.jpg`), or directly via the Cloudinary CDN URLs stored in database fields.

---

### Authentication & JWT Headers

Every protected endpoint requires the standard HTTP `Authorization` header containing the JWT token issued upon registration, login, or Google sign-in:

```http
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json
Accept: application/json
```

* For endpoints marked **`Optional Auth`**, passing the token lets the server know who is requesting (e.g., returning `is_bookmarked: true` or `has_liked: true` on feed items). If omitted, public data is returned.
* For endpoints marked **`Protected (Requires Auth)`**, omitting or providing an expired token returns `401 Unauthorized`.

---

### Standard Request & Error Response Formats

#### Successful Response (HTTP 200 / 201)
Responses generally return JSON objects containing either the resource directly or keyed envelopes:
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Or for lists:
```json
{
  "campaigns": [ ... ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

#### Error Response (HTTP 400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "message": "Human-readable description of what went wrong",
  "error": "Optional technical error details"
}
```

---

### User Roles & Permissions

Studio Arella supports a multi-sided ecosystem with 4 primary roles:
1. **`advertiser`**: Businesses and individuals booking digital billboards and launching outdoor DOOH ad campaigns.
2. **`creator`**: Podcasters, broadcasters, and media personalities publishing shows, audio episodes, and hosting live audio rooms.
3. **`screen_owner`**: Media partners owning physical LED billboards who monetize screen display time.
4. **`admin`**: Studio Arella staff moderating creative ads, managing studio bookings, and inspecting platform payouts.

---

## Module 1: Authentication & User Accounts

### 1.1 Register New Account
Creates a new account and immediately dispatches a 4-digit OTP verification code via email (and optional SMS).
* **Endpoint:** `POST /auth/register`
* **Access:** Public (Rate limited)
* **Request Body:**
```json
{
  "first_name": "Victor",
  "last_name": "Kalu",
  "email": "victor@example.com",
  "password": "Password123!",
  "role": "advertiser", // "advertiser" | "screen_owner" (creators start as advertiser/fan and activate creator features)
  "business_name": "Arella Studios Ltd", // Optional
  "phone": "+2348012345678" // Optional (required for SMS OTP)
}
```
* **Success Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "22f92f4c-f014-42b5-a89a-4c64afc5f24b",
    "name": "Victor Kalu",
    "first_name": "Victor",
    "last_name": "Kalu",
    "email": "victor@example.com",
    "role": "advertiser",
    "credits": 0,
    "email_verified": false
  },
  "message": "Account created! Verification code sent to your email."
}
```

---

### 1.2 Verify Email OTP
Verifies the 4-digit code sent during registration.
* **Endpoint:** `POST /auth/verify-email`
* **Access:** Protected (Send token from registration)
* **Request Body:**
```json
{
  "code": "4821"
}
```
* **Success Response (200 OK):**
```json
{
  "message": "Email verified successfully!"
}
```

---

### 1.3 Resend Verification Code
Resends a fresh 4-digit code via email or SMS.
* **Endpoint:** `POST /auth/resend-verification`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "victor@example.com",
  "method": "email" // "email" | "sms"
}
```

---

### 1.4 User Login
Authenticates with email and password. Handles accounts with Two-Factor Authentication (2FA) enabled.
* **Endpoint:** `POST /auth/login`
* **Access:** Public (Rate limited)
* **Request Body:**
```json
{
  "email": "victor@example.com",
  "password": "Password123!"
}
```
* **Success Response (200 OK — Standard):**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "22f92f4c-f014-42b5-a89a-4c64afc5f24b",
    "name": "Victor Kalu",
    "email": "victor@example.com",
    "role": "creator",
    "credits": 45000.00,
    "avatar": "https://res.cloudinary.com/.../avatar.jpg",
    "creator_tier": "pro",
    "creator_verified": true,
    "creator_niche": "Podcasts & Media",
    "bio": "Broadcaster and media host on Studio Arella.",
    "location": "Lagos, Nigeria",
    "email_verified": true
  }
}
```
* **Success Response (200 OK — If 2FA is enabled):**
```json
{
  "requires_2fa": true,
  "pending_token": "eyJhbGciOi..." // Valid for 5 minutes only to submit TOTP code
}
```

---

### 1.5 Verify 2FA Login Code
Submits the 6-digit Authenticator code when `requires_2fa` is returned by `/auth/login`.
* **Endpoint:** `POST /auth/2fa/login-verify`
* **Access:** Public (Requires `pending_token` in body)
* **Request Body:**
```json
{
  "pending_token": "eyJhbGciOi...",
  "code": "829104"
}
```
* **Success Response (200 OK):** Returns full `{ token, user }`.

---

### 1.6 Google One-Tap / OAuth Sign-in
Authenticates using a Google identity ID token generated by the mobile Google Sign-In SDK.
* **Endpoint:** `POST /auth/google/one-tap`
* **Access:** Public
* **Request Body:**
```json
{
  "credential": "GOOGLE_ID_TOKEN_STRING"
}
```
* **Success Response (200 OK):** Returns `{ token, user }`.

---

### 1.7 Get Current Authenticated User Profile
Retrieves the logged-in user's full profile, role, live in-app wallet balance, and creator settings.
* **Endpoint:** `GET /auth/me`
* **Access:** Protected
* **Success Response (200 OK):** Returns `{ user: { ... } }`.

---

### 1.8 Update User Profile
Updates personal information, bio, niche, location, or social links.
* **Endpoint:** `PUT /auth/profile`
* **Access:** Protected
* **Request Body:**
```json
{
  "name": "Victor Kalu",
  "first_name": "Victor",
  "last_name": "Kalu",
  "business_name": "Arella Studios",
  "phone": "+2348012345678",
  "bio": "Audio creator and host of Umuahia Stories.",
  "location": "Lagos, Nigeria",
  "creator_niche": "Culture",
  "social_links": {
    "twitter": "https://x.com/victor",
    "instagram": "https://instagram.com/victor",
    "website": "https://victorkalu.com"
  }
}
```

---

### 1.9 Upload User Avatar
Uploads an avatar image file to Cloudinary and saves it to the user's profile.
* **Endpoint:** `PUT /auth/avatar`
* **Access:** Protected
* **Content-Type:** `multipart/form-data`
* **Body Form Field:** `avatar` (Binary Image File, max 5MB)
* **Success Response (200 OK):**
```json
{
  "avatar": "https://res.cloudinary.com/.../image.jpg",
  "message": "Avatar updated successfully"
}
```

---

### 1.10 Change Password
* **Endpoint:** `PUT /auth/password`
* **Access:** Protected
* **Request Body:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePassword456!"
}
```

---

### 1.11 Password Reset Flow
1. **Request Reset Link / Code:** `POST /auth/forgot-password`  
   Body: `{ "email": "user@example.com" }`
2. **Submit New Password:** `POST /auth/reset-password`  
   Body: `{ "token": "RESET_TOKEN", "new_password": "NewPassword123!" }`

---

### 1.12 Two-Factor Authentication (2FA) Lifecycle
* **Generate Secret & QR:** `POST /auth/2fa/setup` (Protected)  
  *Returns:* `{ "secret": "JBSWY3DPEHPK3PXP", "otpauth_url": "otpauth://totp/...", "qr_code": "data:image/png;base64,..." }`
* **Confirm Setup:** `POST /auth/2fa/verify-setup`  
  *Body:* `{ "code": "123456" }`
* **Disable 2FA:** `POST /auth/2fa/disable`  
  *Body:* `{ "password": "UserPassword" }`

---

### 1.13 Active Sessions & Devices Management
* **List Active Device Sessions:** `GET /auth/sessions` (Returns IP, device model, browser, last active time)
* **Revoke Specific Session:** `DELETE /auth/sessions/:id`
* **Logout All Other Devices:** `DELETE /auth/sessions/all`

---

## Module 2: Advertiser Campaigns & Digital Billboard Screens

### 2.1 List Digital Billboard Screens
Returns the physical LED display screens registered on the network (e.g. Bems Junction LED, Umuahia Mega Billboard).
* **Endpoint:** `GET /screens`
* **Access:** Protected
* **Query Parameters:** `?status=active&location=Umuahia`
* **Success Response (200 OK):**
```json
{
  "screens": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Bems Junction Mega Billboard",
      "location": "Bems Junction, Aba Road, Umuahia, Abia State",
      "resolution": "1920x1080",
      "orientation": "landscape",
      "price_per_sec": 5.50, // NGN per second of ad display
      "status": "active",
      "impressions_daily": 45000,
      "specs": { "supported_formats": ["mp4", "jpg", "png"], "max_duration": 60 }
    }
  ]
}
```

---

### 2.2 Query Screen Available Booking Slots
Fetches already-booked or locked slots for a given screen within a date range to render the mobile calendar.
* **Endpoint:** `GET /bookings/slots`
* **Access:** Public / Protected
* **Query Parameters:**
  * `screen_id` (UUID, required)
  * `start_date` (ISO Date, required)
  * `end_date` (ISO Date, required)
* **Success Response (200 OK):**
```json
{
  "slots": [
    {
      "start_time": "2026-10-30T09:00:00.000Z",
      "end_time": "2026-10-30T10:00:00.000Z"
    }
  ]
}
```

---

### 2.3 Reserve Slots (5-Minute Cart Lock)
Temporarily locks the selected time blocks for 5 minutes so no other advertiser can steal them during checkout.
* **Endpoint:** `POST /bookings/reserve`
* **Access:** Protected
* **Request Body:**
```json
{
  "screen_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "ad_id": "8c0e271a-e8bc-46f3-a185-1d418702b378",
  "campaign_id": "3d9555f6-fa47-47ef-aa88-f19d80a90e6e", // Optional
  "slots": [
    {
      "start": "2026-10-30T14:00:00.000Z",
      "end": "2026-10-30T15:00:00.000Z",
      "mins": 60
    }
  ]
}
```
* **Success Response (200 OK):**
```json
{
  "booking_id": "a1f94921-2e6b-4e65-a83a-4f51e3914a2b",
  "total_cost": 19800.00,
  "slots_count": 1,
  "duration_seconds": 3600,
  "locked_until": "2026-10-30T13:35:00.000Z"
}
```

---

### 2.4 Confirm Booking / Pay for Reserved Booking
Pay for a reserved booking directly from wallet or finalize with an external payment reference.
* **Pay via In-App Wallet:** `POST /payments/wallet`
  * Body: `{ "booking_id": "...", "booking_type": "screen" }`
* **Pay via Card Gateway (Monnify):** `POST /payments/initialize`
  * Body: `{ "booking_id": "...", "booking_type": "screen" }`

---

### 2.5 Manage Advertising Campaigns
* **List Campaigns:** `GET /campaigns?page=1&limit=10&status=active`
* **Get Campaign Detail:** `GET /campaigns/:id`
* **Create Campaign:** `POST /campaigns`
  ```json
  {
    "name": "Q4 Brand Awareness Push",
    "description": "Peak hour broadcasts across Umuahia metropolis",
    "budget": 250000.00,
    "start_date": "2026-11-01T00:00:00.000Z",
    "end_date": "2026-11-30T23:59:59.000Z"
  }
  ```
* **Fund Campaign from Wallet:** `POST /campaigns/:id/fund/wallet`  
  Deducts `budget` from user's wallet and activates the campaign.
* **Update Campaign:** `PUT /campaigns/:id`
* **Delete Campaign:** `DELETE /campaigns/:id`

---

### 2.6 Upload & Manage Ad Creatives
* **List Creatives:** `GET /ads` (Returns ad status: `pending` | `approved` | `rejected`)
* **Upload Creative:** `POST /ads`
  * **Content-Type:** `multipart/form-data`
  * **Fields:**
    * `file` (Video `.mp4` or Image `.jpg`/`.png`)
    * `title` (string)
    * `duration_seconds` (number, e.g. 15, 30, 60)
    * `campaign_id` (UUID, optional)

---

### 2.7 Advertiser Analytics & Proof of Play
* **Dashboard Summary:** `GET /dashboard/stats` (Active campaigns, total impressions, total spend, screen plays)
* **Hourly Play Analytics:** `GET /analytics/hourly?screen_id=...&date=2026-10-30`
* **Proof-of-Play Camera Logs:** `GET /analytics/proof-of-play?booking_id=...` (Snapshots & timestamps confirming the ad played on the physical screen)

---

## Module 3: In-App Wallet, Billing & Monnify Payments

### 3.1 Get Wallet Balance & Financial Summary
* **Endpoint:** `GET /finances/balance`
* **Access:** Protected
* **Success Response (200 OK):**
```json
{
  "credits": 75000.00, // Available wallet balance in NGN
  "total_spent": 120500.00,
  "currency": "NGN"
}
```

---

### 3.2 Transaction History
* **Endpoint:** `GET /finances/transactions`
* **Access:** Protected
* **Query Parameters:** `?limit=20&page=1`
* **Success Response (200 OK):**
```json
{
  "transactions": [
    {
      "id": "t1-uuid",
      "type": "credit", // "credit" (money added) | "debit" (money spent)
      "source": "card_topup", // "card_topup" | "bank_transfer" | "booking_payment" | "tip"
      "amount": 50000.00,
      "description": "Wallet top-up via Card *4242",
      "reference": "TOPUP-179328192",
      "created_at": "2026-10-29T10:30:00.000Z"
    }
  ]
}
```

---

### 3.3 Top-Up Wallet via Monnify SDK / Checkout
Initializes an online payment session to top up wallet credits.
* **Endpoint:** `POST /payments/initialize-credits`
* **Access:** Protected
* **Request Body:**
```json
{
  "amount": 25000.00
}
```
* **Success Response (200 OK):**
```json
{
  "paymentReference": "MNFY-TOPUP-1793281002",
  "checkoutUrl": "https://sandbox.monnify.com/checkout/...",
  "apiKey": "MK_TEST_...",
  "contractCode": "1234567890",
  "amount": 25000.00
}
```
*(The mobile app passes these parameters directly to the Monnify Mobile SDK or loads `checkoutUrl` in an in-app WebView/Chrome Custom Tab).*

---

### 3.4 Dedicated Virtual Bank Account (Direct Transfer Top-Up)
Generates or retrieves a permanent virtual Nigerian bank account (Wema Bank / Sterling / Moniepoint) tied to the user. Any bank transfer made to this account automatically credits the user's wallet within seconds.
* **Endpoint:** `POST /payments/reserved-account`
* **Access:** Protected
* **Success Response (200 OK):**
```json
{
  "account_number": "7012345678",
  "bank_name": "Wema Bank / Monnify",
  "account_name": "Studio Arella - Victor Kalu",
  "reference": "REV-22f92f4c"
}
```

---

### 3.5 Tokenized Saved Cards
* **List Saved Cards:** `GET /payments/cards`  
  *Returns:* `[{ "id": "...", "card_type": "Mastercard", "last4": "4242", "exp_month": "12", "exp_year": "28", "bank": "Guaranty Trust Bank" }]`
* **Delete Saved Card:** `DELETE /payments/cards/:id`
* **Direct Charge Saved Card:** `POST /payments/charge`  
  *Body:* `{ "card_id": "...", "amount": 15000 }`
* **Submit OTP for 3D Secure:** `POST /payments/charge/submit-otp`  
  *Body:* `{ "transactionReference": "...", "otp": "123456" }`

---

## Module 4: Audience & Creator Social Space (Podcasts & Feed)

### 4.1 Get Podcast & Content Feed
Returns the social audio feed, including author details, likes, bookmark status, and playback media.
* **Endpoint:** `GET /content/feed`
* **Access:** Optional Auth (Provide Bearer token for user-specific `has_liked`, `is_bookmarked`, `is_unlocked` flags)
* **Query Parameters:**
  * `view` (`trending` | `all`)
  * `category` (`Politics` | `Culture` | `Entertainment` | `Business` | `Relationship`)
  * `tag` (e.g. `#umuahia`)
* **Success Response (200 OK):**
```json
{
  "posts": [
    {
      "id": "post-uuid-1",
      "author": {
        "id": "0e0d0c45-7c57-40eb-8910-f3d8cc573b99",
        "name": "Audrey Alexander",
        "role": "Diplomacy & Political Analyst",
        "avatar": "https://.../audrey.png",
        "tier": "pro"
      },
      "title": "Global Diplomacy & African Geopolitics",
      "description": "An in-depth analysis of African economic diplomacy and trade alliances.",
      "category": "Politics",
      "tags": ["#politics", "#diplomacy", "#geopolitics"],
      "mediaUrl": "https://.../audio_episode.mp3",
      "duration": "01:47:00",
      "initialLikes": 112,
      "initialComments": 23,
      "viewsCount": 1400,
      "repostsCount": 18,
      "isBookmarked": false,
      "hasLiked": false,
      "isPremium": false,
      "isUnlocked": true,
      "price": 0
    }
  ]
}
```

---

### 4.2 Publish Creator Content / Post
Allows creators or fans to publish audio podcasts, thoughts, or media updates.
* **Endpoint:** `POST /content`
* **Access:** Protected
* **Request Body:**
```json
{
  "title": "Episode 12: Modern Marriage & Trust",
  "description": "Deep dive into financial transparency and relationship boundaries.",
  "content_type": "podcast", // "post" | "podcast" | "video"
  "media_url": "https://.../recording.mp3",
  "cover_url": "https://.../cover.jpg",
  "duration_text": "01:18:00",
  "category": "Relationship",
  "tags": ["#relationship", "#marriage", "#trust"],
  "is_premium": false,
  "price": 0,
  "badge_theme": "gold"
}
```

---

### 4.3 Like & Bookmark Actions
* **Toggle Like Post:** `POST /content/:id/like` (Protected)  
  *Returns:* `{ "liked": true }` or `{ "liked": false }`
* **Toggle Bookmark Post:** `POST /content/:id/bookmark` (Protected)  
  *Returns:* `{ "bookmarked": true }` or `{ "bookmarked": false }`
* **List User's Bookmarks:** `GET /content/bookmarks` (Protected)

---

### 4.4 Comments Threading
* **Get Comments:** `GET /content/:id/comments` (Optional Auth)  
  *Returns:* `[{ "id": "...", "content": "Great episode!", "user": { "name": "...", "avatar": "..." }, "created_at": "..." }]`
* **Add Comment:** `POST /content/:id/comments` (Protected)  
  *Body:* `{ "content": "Loved the breakdown on African multilateral trade!" }`

---

### 4.5 Creator Profile, Followers & Suggestions
* **Get Full Creator Profile:** `GET /creators/:id`  
  *(Accepts Creator UUID or `@handle`)*  
  *Returns:* `{ creator: { name, handle, bio, avatar, banner_url, social_links }, stats: { followersCount, followingCount, postsCount }, isFollowing: boolean, socialProof: { users: [...] }, posts: [...] }`
* **Toggle Follow Creator:** `POST /creators/:id/follow` (Protected)  
  *Body:* `{ "followerId": "USER_UUID" }`  
  *Returns:* `{ "isFollowing": true }`
* **Get Follower List:** `GET /creators/:id/followers`
* **Get Following List:** `GET /creators/:id/following`
* **Get Recommended Creators ("You might like"):** `GET /creators/suggestions` (Optional Auth)

---

## Module 5: Creator Memberships, Tipping & Monetization

### 5.1 Creator Membership Plans
* **Fetch Creator's Tiers:** `GET /memberships/plans/:creatorId`  
  *Returns:* List of plans (e.g. Bronze Fan N1,000/mo, VIP Insider N5,000/mo).
* **Subscribe to Membership:** `POST /memberships/subscribe` (Protected)
  ```json
  {
    "creator_id": "0e0d0c45-7c57-40eb-8910-f3d8cc573b99",
    "plan_id": "plan-uuid",
    "payment_reference": "WALLET" // or gateway reference
  }
  ```
* **List My Active Subscriptions:** `GET /memberships/my-subscriptions` (Protected)
* **Cancel Subscription:** `POST /memberships/:id/cancel` (Protected)

---

### 5.2 Pay-Per-Episode (Premium Content Unlock)
Unlocks a paywalled episode using wallet credits or direct debit.
* **Endpoint:** `POST /content/:id/purchase`
* **Access:** Protected
* **Request Body:**
```json
{
  "payment_method": "wallet" // "wallet" | "card"
}
```
* **Success Response (200 OK):** `{ "success": true, "unlocked": true }`

---

### 5.3 Send Creator Tip / Gratuity
Sends money directly from the user's wallet or card into the creator's payout wallet.
* **Endpoint:** `POST /creator/tips`
* **Access:** Protected
* **Request Body:**
```json
{
  "creator_id": "0e0d0c45-7c57-40eb-8910-f3d8cc573b99",
  "amount": 2500.00,
  "currency": "NGN",
  "message": "Keep up the phenomenal podcast work!" // Optional
}
```

---

### 5.4 Creator Wallet, Bank Account & Payouts
* **Get Creator Earnings Wallet:** `GET /creator/wallet` (Protected)  
  *Returns:* `{ wallet: { available_balance, pending_balance, total_earned, total_withdrawn }, ledger: [...], recentPayouts: [...] }`
* **Update Settlement Bank Details:** `PUT /creator/wallet/bank` (Protected)
  ```json
  {
    "bank_name": "Access Bank",
    "account_number": "0123456789",
    "account_name": "Victor Kalu"
  }
  ```
* **Request Payout / Withdrawal:** `POST /creator/payout` (Protected)
  ```json
  {
    "amount": 50000.00
  }
  ```
* **Payout History:** `GET /creator/payouts` (Protected)

---

## Module 6: Physical Podcast Studio Booking

Studio Arella operates physical broadcast and recording studios (e.g. at Bems Junction, Umuahia). Creators and advertisers can book studio slots directly through the mobile app.

### 6.1 Check Studio Availability
* **Endpoint:** `GET /podcasts/availability`
* **Access:** Public
* **Query Parameters:** `?date=2026-10-31`
* **Success Response (200 OK):**
```json
{
  "availableSlots": [
    { "time": "09:00", "status": "available", "rate": 15000 },
    { "time": "11:00", "status": "booked" }
  ]
}
```

---

### 6.2 Reserve Single Studio Recording Session
* **Endpoint:** `POST /podcasts/reserve`
* **Access:** Protected
* **Request Body:**
```json
{
  "studio_name": "Main Audio Suite A",
  "date": "2026-10-31",
  "start_time": "14:00",
  "end_time": "16:00",
  "duration_hours": 2,
  "notes": "4-mic setup with multi-track ISO audio"
}
```
* **Confirm / Pay from Wallet:** `POST /payments/wallet` with `{ "booking_id": "...", "booking_type": "podcast" }`

---

### 6.3 Multi-Episode Series Package Booking
* **Reserve Series:** `POST /podcasts/reserve-series`
* **Pay Series from Wallet:** `PUT /podcasts/series/:seriesId/pay`
* **My Studio Reservations:** `GET /podcasts/my-bookings`
* **Cancel / Reschedule Booking:** `PUT /podcasts/:id/cancel`

---

## Module 7: Live Audio Experience Rooms

Similar to Twitter Spaces or Clubhouse, creators host interactive audio rooms.

### 7.1 List Live Audio Rooms
* **Endpoint:** `GET /live-experiences` (Optional Auth)
* **Returns:** Active and scheduled live rooms with host avatar, category, participant count, and entry fee (if paid room).
* **Get Featured Live Broadcast:** `GET /live/featured`

### 7.2 Join Room & Listen
* **Endpoint:** `POST /live-experiences/:id/join`
* **Access:** Protected

### 7.3 Room Live Chat & Reactions
* **Get Room Chat Feed:** `GET /live-experiences/:id/messages`
* **Send Message in Room:** `POST /live-experiences/:id/messages`  
  *Body:* `{ "message": "Fascinating point on boundary setting!" }`
* **Like Chat Message:** `POST /live-experiences/messages/:messageId/like`

---

## Module 8: Direct Messaging (DMs) & Arella AI Chat

### 8.1 1-on-1 Direct Messaging (DMs)
* **Get Active Conversations List:** `GET /chats/conversations` (Protected)  
  *Returns:* List of contacts, last message snippet, timestamp, and unread counts.
* **Get Message History:** `GET /chats/:contactId/messages` (Protected)  
  *Returns:* Chronological array of incoming/outgoing messages.
* **Send Direct Message:** `POST /chats/:contactId/messages` (Protected)  
  *Body:* `{ "text": "Hello, I would like to feature you on my upcoming billboard broadcast." }`

---

### 8.2 Arella AI Assistant Chat
* **Endpoint:** `POST /chat`
* **Access:** Protected (Rate limited)
* **Request Body:**
```json
{
  "message": "How do I calculate CPM for billboard advertising in Umuahia?"
}
```
* **Success Response (200 OK):**
```json
{
  "reply": "On Studio Arella, billboard pricing is billed per second or minute..."
}
```

---

## Module 9: Notifications, Support & Creative Requests

### 9.1 In-App Notifications
* **Get Notifications:** `GET /notifications` (Protected)
* **Unread Badge Count:** `GET /notifications/unread`  
  *(Use this for the mobile tab bar / bell icon badge).*
* **Mark Single Read:** `PUT /notifications/:id/read`
* **Mark All Read:** `PUT /notifications/read-all`
* **Delete Notification:** `DELETE /notifications/:id`

---

### 9.2 Custom Creative Requests
Advertisers who don't have finished billboard videos can hire Studio Arella's in-house motion designers.
* **Submit Design Request:** `POST /creative-requests` (Protected)  
  *Body:* `{ "title": "Bems Farm Brand Launch", "instructions": "Animate our logo and highlight 20% discount", "asset_urls": [...] }`
* **My Creative Requests:** `GET /creative-requests/mine`

---

### 9.3 Support Tickets
* **Submit Support Ticket:** `POST /support/tickets` (Protected)  
  *Body:* `{ "subject": "Billing issue on billboard #SA-1029", "message": "...", "priority": "high" }`
* **My Tickets:** `GET /support/tickets/mine`

---

## Module 10: Admin & Moderation Operations

*(Accessible only to users with `role: "admin"`)*
* **Platform Health Stats:** `GET /admin/stats`
* **User Management:** `GET /admin/users` & `PUT /admin/users/:id/role`
* **Screen Creative Moderation Queue:** `GET /ads/review-queue`
* **Approve / Reject Creative:** `PUT /ads/:id/review`  
  *Body:* `{ "status": "approved" }` or `{ "status": "rejected", "rejection_reason": "Contains low-res text" }`
* **All System Bookings & Transactions:** `GET /admin/bookings`, `GET /admin/transactions`

---

## Mobile Integration Best Practices

### 1. Token Persistence & Auto-Logout Interceptor
Store the JWT using secure native storage:
* **React Native / Expo:** `expo-secure-store`
* **Flutter:** `flutter_secure_storage`
* **iOS / Android:** iOS Keychain / Android EncryptedSharedPreferences

Configure an Axios or Fetch HTTP interceptor:
```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token & redirect to Login screen
      await SecureStore.deleteItemAsync('user_token');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
    return Promise.reject(error);
  }
);
```

### 2. Audio Streaming & Background Playback
* Media URLs returned by `/content/feed` and `/shows/:id` point to MP3 audio streams.
* Recommended native libraries:
  * **React Native:** `react-native-track-player` (supports background lock-screen controls, buffering, and lock screen metadata).
  * **Flutter:** `just_audio` + `audio_service`.

### 3. Image & Video Uploads
When uploading to `PUT /auth/avatar` or `POST /ads`, format as `FormData`:
```typescript
const formData = new FormData();
formData.append('avatar', {
  uri: photo.uri,
  name: 'avatar.jpg',
  type: 'image/jpeg',
} as any);

await fetch(`${BASE_URL}/auth/avatar`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    // Do NOT set Content-Type header manually; let the browser/runtime set multipart boundary!
  },
  body: formData,
});
```

### 4. Unread Notification Polling / Push Notifications
* Poll `GET /notifications/unread` every 60 seconds when app is active, or trigger upon returning to the foreground (`AppState` change).
* Pass device push tokens to user settings for FCM / APNs notifications.
