import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer id="main-footer" className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-auto relative z-10">
      {/* Top Accent Line */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Column 1: Brand & Project Vision */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white font-extrabold text-lg">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                <Car className="w-5 h-5" />
              </div>
              <span className="tracking-tight">Campus Ride Sharing</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              A comprehensive student ride-sharing portal designed for safe, economical, and eco-friendly university commutes. Connecting verified student drivers with student passengers across campus routes.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Online & Authenticated</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Navigation</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center space-x-1.5">
                  <span>Home Overview</span>
                </Link>
              </li>
              <li>
                <Link to="/rides" className="hover:text-emerald-400 transition-colors flex items-center space-x-1.5">
                  <span>Browse Available Rides</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors flex items-center space-x-1.5">
                  <span>Project & Architecture</span>
                </Link>
              </li>
              <li>
                <Link to="/driver-dashboard" className="hover:text-emerald-400 transition-colors flex items-center space-x-1.5">
                  <span>Driver Management Portal</span>
                </Link>
              </li>
              <li>
                <Link to="/my-requests" className="hover:text-emerald-400 transition-colors flex items-center space-x-1.5">
                  <span>My Ride Requests</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Safety & Features</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verified University Student Drivers</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Real-Time Ride Request Approval</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Transparent Seat & Fare Listings</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Secure Contact Sharing Upon Acceptance</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Developer Credits */}
        <div className="border-t border-slate-900 pt-6 flex flex-col items-center justify-center text-center text-xs text-slate-400 gap-4">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-slate-400">
              © {new Date().getFullYear()} Campus Ride Sharing Portal. All rights reserved.
            </p>
            <p className="text-emerald-400 font-medium mt-1">
              Developed by : Mahamudul hasan
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
