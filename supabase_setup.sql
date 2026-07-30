-- ============================================================
-- CAMPUS RIDE SHARING SYSTEM - SUPABASE SQL SETUP SCRIPT
-- Copy all of this code and paste it into Supabase SQL Editor
-- then click RUN to set up your database tables and seed data.
-- ============================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  department VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profile_image TEXT,
  vehicle_name VARCHAR(100),
  vehicle_number VARCHAR(100),
  vehicle_type VARCHAR(50)
);

-- 3. Create Rides Table
CREATE TABLE IF NOT EXISTS rides (
  id SERIAL PRIMARY KEY,
  driver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pickup_location VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  ride_date VARCHAR(20) NOT NULL,
  ride_time VARCHAR(20) NOT NULL,
  available_seats INT NOT NULL,
  fare NUMERIC(10, 2) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Ride Requests Table
CREATE TABLE IF NOT EXISTS ride_requests (
  id SERIAL PRIMARY KEY,
  ride_id INT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  passenger_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disable Row Level Security (RLS) to ensure smooth full-stack API access
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rides DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_requests DISABLE ROW LEVEL SECURITY;

-- Sample Seed Data (Password for all seed users is: password123)
-- Admin: admin@campus.edu
-- Driver 1: rahim.driver@campus.edu
-- Driver 2: tanvir.driver@campus.edu
-- Student 1: anika.student@campus.edu
-- Student 2: sabbir.student@campus.edu

INSERT INTO users (id, name, email, password, phone, department, role) 
VALUES 
  (1, 'System Admin', 'admin@campus.edu', '$2b$10$P07QDTcAtx4Sx3JMb8JYP.dq1VJAY56Rf5g0dK.FS4QYLJnPadXg2', '+8801700000000', 'Computer Science', 'admin'),
  (2, 'Rahim Ahmed', 'rahim.driver@campus.edu', '$2b$10$P07QDTcAtx4Sx3JMb8JYP.dq1VJAY56Rf5g0dK.FS4QYLJnPadXg2', '+8801811111111', 'Electrical Engineering', 'driver'),
  (3, 'Tanvir Hasan', 'tanvir.driver@campus.edu', '$2b$10$P07QDTcAtx4Sx3JMb8JYP.dq1VJAY56Rf5g0dK.FS4QYLJnPadXg2', '+8801922222222', 'Software Engineering', 'driver'),
  (4, 'Anika Rahman', 'anika.student@campus.edu', '$2b$10$P07QDTcAtx4Sx3JMb8JYP.dq1VJAY56Rf5g0dK.FS4QYLJnPadXg2', '+8801733333333', 'Software Engineering', 'student'),
  (5, 'Sabbir Hossain', 'sabbir.student@campus.edu', '$2b$10$P07QDTcAtx4Sx3JMb8JYP.dq1VJAY56Rf5g0dK.FS4QYLJnPadXg2', '+8801644444444', 'Business Administration', 'student')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, user_id, profile_image, vehicle_name, vehicle_number, vehicle_type)
VALUES
  (1, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', '', '', ''),
  (2, 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', 'Toyota Corolla', 'DHAKA-METRO-GA-1234', 'Car'),
  (3, 3, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', 'Yamaha FZ-S', 'DHAKA-METRO-HA-5678', 'Bike'),
  (4, 4, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250', '', '', ''),
  (5, 5, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rides (id, driver_id, pickup_location, destination, ride_date, ride_time, available_seats, fare, description, status)
VALUES
  (1, 2, 'Dhanmondi 27', 'Daffodil International University', '2026-08-01', '08:30', 3, 120, 'AC Sedan car, comfortable ride directly to Main Campus.', 'available'),
  (2, 3, 'Uttara Sector 10', 'Campus Gate 2', '2026-08-01', '09:00', 1, 80, 'Quick bike ride to campus. Helmet provided.', 'available'),
  (3, 2, 'Mirpur 10', 'University City Campus', '2026-08-02', '10:15', 4, 100, 'Leaving early to beat traffic. Non-smoking ride.', 'available')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ride_requests (id, ride_id, passenger_id, request_status)
VALUES
  (1, 1, 4, 'Pending'),
  (2, 2, 5, 'Accepted')
ON CONFLICT (id) DO NOTHING;

-- Synchronize ID Sequences after inserting hardcoded seed records
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM users), false);
SELECT setval('profiles_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM profiles), false);
SELECT setval('rides_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM rides), false);
SELECT setval('ride_requests_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM ride_requests), false);
