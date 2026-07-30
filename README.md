# Campus Ride Sharing Portal

**Course Project:** SE 322 Software Engineering Web Application Lab  
**Developer:** MD Mahamudul Hasan  
**Category:** Transportation / Campus Service  
**Stack:** React 19, Express.js, SQLite/PostgreSQL Relational DB, JWT, Tailwind CSS  

---

## 📌 Project Overview
**Campus Ride Sharing Portal** is a full-stack dynamic web application designed for university students to find and share rides with fellow students traveling along the same route. The portal supports role-based authentication (Student Passenger, Student Driver, System Admin), full CRUD ride management, live passenger requests approval, and database persistence.

---

## 🚀 Key Features

### 1. User Roles & Capabilities
- **Student / Passenger:**
  - Secure registration & JWT authentication
  - Multi-field ride search (Pickup Location, Destination, Travel Date, Max Fare)
  - Submit ride requests to student drivers
  - Track request status (*Pending*, *Accepted*, *Rejected*, *Cancelled*)
  - View driver phone numbers & vehicle information upon acceptance

- **Student Driver:**
  - Publish new ride offers with vehicle details (Car, Motorcycle, Microbus)
  - Edit and delete published ride posts
  - Receive incoming passenger requests in real-time
  - Accept or Reject requests with automatic seat count management

- **System Admin:**
  - System dashboard with live stats (Total Users, Drivers, Rides, Requests)
  - User management (View registered users, delete accounts)
  - Content moderation (Remove invalid ride posts, inspect request logs)

---

## 🗄️ Relational Database Schema

The database consists of 4 primary relational tables with Foreign Keys and CASCADE rules:

1. **`users`**
   - `id` (PK, INTEGER)
   - `name` (TEXT)
   - `email` (TEXT, UNIQUE)
   - `password` (TEXT, bcrypt hashed)
   - `phone` (TEXT)
   - `department` (TEXT)
   - `role` (TEXT: `'student'` | `'driver'` | `'admin'`)
   - `created_at` (DATETIME)

2. **`profiles`**
   - `id` (PK, INTEGER)
   - `user_id` (FK -> `users.id`)
   - `profile_image` (TEXT)
   - `vehicle_name` (TEXT)
   - `vehicle_number` (TEXT)
   - `vehicle_type` (TEXT)

3. **`rides`**
   - `id` (PK, INTEGER)
   - `driver_id` (FK -> `users.id`)
   - `pickup_location` (TEXT)
   - `destination` (TEXT)
   - `ride_date` (TEXT)
   - `ride_time` (TEXT)
   - `available_seats` (INTEGER)
   - `fare` (REAL)
   - `description` (TEXT)
   - `status` (TEXT: `'available'` | `'full'` | `'completed'`)

4. **`ride_requests`**
   - `id` (PK, INTEGER)
   - `ride_id` (FK -> `rides.id`)
   - `passenger_id` (FK -> `users.id`)
   - `request_status` (TEXT: `'Pending'` | `'Accepted'` | `'Rejected'` | `'Cancelled'`)
   - `request_date` (DATETIME)

---

## 📡 REST API Architecture

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT |
| `POST` | `/api/auth/logout` | Public | Invalidate user session |
| `GET` | `/api/users/profile` | Auth | Fetch active user profile |
| `PUT` | `/api/users/profile` | Auth | Update profile & vehicle info |
| `GET` | `/api/rides` | Public | Search & filter ride offers |
| `GET` | `/api/rides/:id` | Public | Get single ride details |
| `POST` | `/api/rides` | Driver/Admin | Create a new ride offer |
| `PUT` | `/api/rides/:id` | Driver/Admin | Edit existing ride offer |
| `DELETE` | `/api/rides/:id` | Driver/Admin | Delete ride offer |
| `POST` | `/api/requests` | Auth | Submit ride request |
| `GET` | `/api/requests` | Auth | Fetch user/driver requests |
| `PUT` | `/api/requests/:id` | Auth | Accept/Reject/Cancel request |
| `GET` | `/api/admin/users` | Admin | List all registered users |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user account |
| `GET` | `/api/admin/stats` | Admin | Get platform metrics |

---

## 🛠️ Installation & Setup

1. **Clone Repository:**
   ```bash
   git clone https://github.com/your-username/campus-ride-sharing-portal.git
   cd campus-ride-sharing-portal
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy `.env.example` to `.env`:
   ```env
   JWT_SECRET="campus_ride_sharing_jwt_secret_key_2026"
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 Pre-seeded Evaluator Accounts

For rapid testing during SE 322 evaluation, the system includes pre-seeded accounts (Password for all: `password123`):

- **System Admin:** `admin@campus.edu`
- **Student Driver (Car):** `rahim.driver@campus.edu`
- **Student Driver (Bike):** `tanvir.driver@campus.edu`
- **Student Passenger:** `anika.student@campus.edu`
