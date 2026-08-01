# Nabz - Blood Donation & Emergency Blood Request Platform (Frontend)

Nabz is a production-ready, highly responsive, modern healthcare platform built with **Next.js 15+ (App Router), TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod, and Axios**.

It integrates directly with the Nabz NestJS backend REST API to facilitate donor registration, emergency blood request broadcasting, and real-time proximity compatible donor matching.

---

## 🚀 Key Features Built-in

1. **Robust API Interceptor & Token Refresh Queue**
   - Seamless JWT storage in `localStorage` with automatic `Authorization: Bearer <token>` injection.
   - Intelligent 401 Unauthorized interceptor. When access tokens expire, it halts concurrent requests, places them in a queue, silently calls `POST /api/auth/refresh` to fetch new tokens, and retries the original requests flawlessly.

2. **Responsive Sidebar Layout & Modern Theme**
   - A clean medical design (deep red accent palettes, soft shadows, rounded-3xl cards, and page-loading skeletons).
   - Sidebar auto-collapses into a beautiful slide-out drawer on tablets and mobile screens.
   - Dynamic real-time toast notifications and interactive unread counters in the header.

3. **Multi-Role Registration Form**
   - Allows creating accounts as a **Blood Seeker** or **Blood Donor**.
   - Includes real-time client-side coordinate detection via **HTML5 Geolocation APIs** to populate Latitude and Longitude variables instantly.
   - For donors, it automatically initializes their donor profile with their specified blood type.

4. **Interactive Dashboard**
   - Displays key statistical metric cards (Active Requests, Required Blood Units, Matches Found, Total Donations).
   - Features a **Donation Availability Toggle** directly connected to backend donor-profile states.
   - Displays real-time matching compatibility reference guides for Whole Blood transfusions.

5. **Blood Requests CRUD Module**
   - **Create Request**: Fill out hospital name, bags needed, urgency level, and select/detect hospital geographic coordinates.
   - **Searchable Paginated Table List**: Search requests by hospital address/name, filter by status (Pending, Matched, Completed, Cancelled), and sort by date or volume.
   - **Interactive Details View**: Standardized cards displaying details. Contains safe confirmation modals (`ConfirmDialog`) for seekers or admins to mark searches as completed or cancelled.
   - **Live Proximity Matching Engine**: Queries available compatible donors in real-time. Features adjustable radius selectors (10km, 20km, 50km, 100km) to see nearby compatible donors with approximate distances sorted nearest first. Masked donor names protect privacy.

6. **On-Demand Finder & Notifications**
   - Find donors in any area by inputting custom blood types, GPS coordinates, and radius km.
   - Track paginated push notifications with "Mark as Read" or "Mark All as Read" capabilities.

---

## 🛠️ Step-by-Step Installation & Launch Guide

Follow these steps to set up and run the entire Nabz stack locally:

### Step 1: Start the NestJS Backend API
1. Navigate to the repository root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the local environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL DATABASE_URL and signing secrets
   ```
4. Generate the database prisma schemas and seed references (creates reference blood types and a demo administrator account):
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed
   ```
5. Launch the NestJS backend dev server:
   ```bash
   npm run start:dev
   ```
The backend API documentation is available at `http://localhost:3000/api/docs`.

### Step 2: Set up the Next.js 15+ Frontend
1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install all frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file pointing to the backend API endpoint (defaults to local backend port):
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
   ```
4. Start the frontend Next.js development server (uses Fast compilation with **Turbopack**):
   ```bash
   npm run dev
   ```
The application will launch on **`http://localhost:3000`**.

---

## 📖 Guided User Flows & Walkthrough

Here is how to test and experience the complete user flows of Nabz:

### Flow A: Registering as a Blood Donor (Lifesaver)
1. Open `http://localhost:3000/register`.
2. Enter your name, email, phone number, and a secure password.
3. Choose the role **"Blood Donor"**.
4. A new dropdown will appear asking for your **Blood Type** (e.g., `O-` or `A+`). Select your type.
5. Under Geographic Location, click **"Detect Location"** to automatically populate your current coordinates, or enter coordinates manually (e.g. Kuala Lumpur default: Lat `3.1390`, Lng `101.6869`).
6. Click **"Create Account"** to submit.
7. You are instantly logged in and redirected to the **Donor Dashboard**.
8. Click **"Status: Available"** button in the top header to toggle your donation availability on and off.
9. Go to the **"Donor Profile"** settings in the sidebar to configure last whole blood donation dates.

### Flow B: Creating an Emergency Blood Request (Seeker)
1. Register a separate account as a **"Blood Seeker"** (using a different email/phone) or login.
2. Click **"New Request"** in the sidebar or the quick actions section of the Seeker Dashboard.
3. Select the required blood type (e.g. `A+`) and the **Urgency Level** (Low, Medium, High, Critical).
4. Enter the **Hospital Name** and **Hospital Full Address**.
5. Click **"Detect Hospital GPS"** or input coordinates where the patient is located.
6. Input the number of whole blood bags needed.
7. Click **"Broadcast Request"**.
8. You are instantly redirected to the **Request Details Page**.

### Flow C: Live Proximity Matching (Beholding the Matching Engine)
1. On the **Request Details Page** you just created, scroll down to the **"Nearby Compatible Donors Match"** card.
2. The platform instantly performs geographic distance calculations using the backend's **Haversine Proximity formula** and maps compatible transfusion rules (e.g. an `A+` request will match `A+`, `A-`, `O+`, and `O-` donors).
3. Change the calculation radius dropdown from **50 km** to **10 km** or **100 km**. You will see the list automatically update to display matched donors sorted with nearest distance (e.g. `~ 12.4 km`) first!
4. Display names are automatically masked for privacy (e.g. "Ahmad Zulkifli" -> "Ahmad Z."), protecting sensitive donor identifiers.
5. In the background, system push-notification alerts are instantly broadcasted to the matched available donors.

### Flow D: On-Demand Donor Search
1. Click **"Find Donors"** in the sidebar.
2. Select any target blood type, coordinates, and custom radius in kilometers.
3. Click **"Search Nearby"** to instantly query and calculate matches anywhere in the world on-demand!

---

## 📦 Building for Production

To compile, optimize, and bundle the Next.js application for high-performance production hosting:

```bash
cd frontend
npm run build
npm run start
```
This performs static optimization checking, compiles variables, and validates 100% strict Type safety.
