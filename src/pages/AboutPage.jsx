import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Database, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Lock, 
  Cpu, 
  UserCheck,
  ArrowLeft
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-12 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Back Button */}
        <div className="flex justify-start">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>System Architecture & Technical Details</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Campus Ride Sharing Portal
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A secure and optimized platform built on a robust full-stack REST API architecture, featuring real-time data flow, JWT authentication, and relational database management.
          </p>
        </div>

        {/* Requirements Checklist */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl transition-all">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <span>Key Platform Architectures & Features</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "1. Frontend", desc: "Built with React 19, Vite, Tailwind CSS, Lucide icons, responsive layout." },
              { title: "2. Backend API", desc: "Express.js RESTful API architecture with proper HTTP status codes." },
              { title: "3. Database Integration", desc: "Relational SQLite/PostgreSQL schema with 4 primary tables and FK joins." },
              { title: "4. Full CRUD Operations", desc: "Drivers can Create, Read, Update, Delete rides; passengers manage requests." },
              { title: "5. Authentication System", desc: "JWT token authentication with bcrypt password hashing." },
              { title: "6. Role Based Access", desc: "Granular access controls for Student, Driver, and Admin users." },
              { title: "7. Dynamic Database Data", desc: "Zero static UI mock data — all items originate from relational DB." },
              { title: "8. Input Validation", desc: "Form sanitation, email check, password strength, backend middleware." },
              { title: "9. Clean Architecture", desc: "MVC structure: controllers, models, routes, middlewares, configs." },
              { title: "10. Production Deployment", desc: "Prepared for GitHub, environment variable declarations, Docker build script." }
            ].map((req, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-1">
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{req.title}</span>
                <p className="text-xs text-slate-600 dark:text-slate-300">{req.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Database Schema Diagram */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl transition-all">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-amber-500 dark:text-yellow-400" />
            <span>Relational Database Schema (4 Tables)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Table 1: users */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">users</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Primary User Table</span>
              </div>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                <li><span className="text-amber-600 dark:text-amber-400 font-bold">id</span> INTEGER PK AUTOINCREMENT</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">name</span> TEXT NOT NULL</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">email</span> TEXT UNIQUE NOT NULL</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">password</span> TEXT NOT NULL (bcrypt)</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">phone</span> TEXT</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">department</span> TEXT</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">role</span> TEXT ('student'|'driver'|'admin')</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">created_at</span> DATETIME</li>
              </ul>
            </div>

            {/* Table 2: profiles */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">profiles</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">1-to-1 User Profile</span>
              </div>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                <li><span className="text-amber-600 dark:text-amber-400 font-bold">id</span> INTEGER PK AUTOINCREMENT</li>
                <li><span className="text-purple-600 dark:text-purple-400 font-bold">user_id</span> INTEGER FK -&gt; users.id</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">profile_image</span> TEXT</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">vehicle_name</span> TEXT</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">vehicle_number</span> TEXT</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">vehicle_type</span> TEXT</li>
              </ul>
            </div>

            {/* Table 3: rides */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">rides</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Ride Offers Table</span>
              </div>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                <li><span className="text-amber-600 dark:text-amber-400 font-bold">id</span> INTEGER PK AUTOINCREMENT</li>
                <li><span className="text-purple-600 dark:text-purple-400 font-bold">driver_id</span> INTEGER FK -&gt; users.id</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">pickup_location</span> TEXT NOT NULL</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">destination</span> TEXT NOT NULL</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">ride_date</span> TEXT NOT NULL</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">ride_time</span> TEXT NOT NULL</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">available_seats</span> INTEGER NOT NULL</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">fare</span> REAL NOT NULL</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">description</span> TEXT</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">status</span> TEXT DEFAULT 'available'</li>
              </ul>
            </div>

            {/* Table 4: ride_requests */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">ride_requests</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Passenger Requests</span>
              </div>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                <li><span className="text-amber-600 dark:text-amber-400 font-bold">id</span> INTEGER PK AUTOINCREMENT</li>
                <li><span className="text-purple-600 dark:text-purple-400 font-bold">ride_id</span> INTEGER FK -&gt; rides.id</li>
                <li><span className="text-purple-600 dark:text-purple-400 font-bold">passenger_id</span> INTEGER FK -&gt; users.id</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">request_status</span> TEXT ('Pending'|'Accepted'|'Rejected'|'Cancelled')</li>
                <li><span className="text-slate-900 dark:text-slate-200 font-bold">request_date</span> DATETIME</li>
              </ul>
            </div>

          </div>
        </div>

        {/* REST API Endpoints Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl transition-all">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Server className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            <span>REST API Specifications</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Endpoint</th>
                  <th className="py-2.5 px-3">Auth Required</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">POST</td>
                  <td className="py-3 px-3">/api/auth/register</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-sans">Public</span></td>
                  <td className="py-3 px-3">User Registration & Password Hashing</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">POST</td>
                  <td className="py-3 px-3">/api/auth/login</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-sans">Public</span></td>
                  <td className="py-3 px-3">User Authentication & JWT Generation</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-bold">GET</td>
                  <td className="py-3 px-3">/api/users/profile</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-sans">JWT Bearer</span></td>
                  <td className="py-3 px-3">Fetch current user profile</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-bold">GET</td>
                  <td className="py-3 px-3">/api/rides</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-sans">Public</span></td>
                  <td className="py-3 px-3">Search & filter available rides</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">POST</td>
                  <td className="py-3 px-3">/api/rides</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-sans">Driver / Admin</span></td>
                  <td className="py-3 px-3">Publish a new ride offer</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-bold">PUT</td>
                  <td className="py-3 px-3">/api/rides/:id</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-sans">Driver / Admin</span></td>
                  <td className="py-3 px-3">Update ride details</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-400 font-bold">DELETE</td>
                  <td className="py-3 px-3">/api/rides/:id</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-sans">Driver / Admin</span></td>
                  <td className="py-3 px-3">Delete ride offer</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">POST</td>
                  <td className="py-3 px-3">/api/requests</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-sans">JWT Bearer</span></td>
                  <td className="py-3 px-3">Submit ride request</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-bold">PUT</td>
                  <td className="py-3 px-3">/api/requests/:id</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-sans">Driver / Admin</span></td>
                  <td className="py-3 px-3">Accept or Reject passenger request</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-purple-600 dark:text-purple-400 font-bold">GET</td>
                  <td className="py-3 px-3">/api/admin/users</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-sans">Admin Only</span></td>
                  <td className="py-3 px-3">View all system users</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
