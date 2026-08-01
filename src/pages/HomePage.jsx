import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RideCard } from '../components/RideCard';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Car, 
  ShieldCheck, 
  Users, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  PlusCircle,
  Clock,
  Sparkles,
  X
} from 'lucide-react';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [rideDate, setRideDate] = useState('');
  const [featuredRides, setFeaturedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(localStorage.getItem('db_banner_dismissed') === 'true');

  const dismissBanner = () => {
    localStorage.setItem('db_banner_dismissed', 'true');
    setBannerDismissed(bannerDismissed => true);
  };

  useEffect(() => {
    // Fetch featured rides
    axios.get('/api/rides?status=available')
      .then(res => {
        if (res.data.success) {
          setFeaturedRides(res.data.rides.slice(0, 3));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Fetch database status
    axios.get('/api/db-status')
      .then(res => {
        if (res.data && res.data.success) {
          setDbStatus(res.data);
        }
      })
      .catch(err => console.error('Error fetching db status in homepage:', err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickup) params.append('pickup', pickup);
    if (destination) params.append('destination', destination);
    if (rideDate) params.append('date', rideDate);
    navigate(`/rides?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* Database Connection Warning Banner */}
      {!bannerDismissed && dbStatus?.mode === 'local' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5 text-amber-600 dark:text-amber-500 font-medium text-left">
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-500 text-[10px] font-extrabold font-mono">i</span>
              <div>
                <p className="leading-normal font-semibold">
                  🚦 ডেটাবেজ কানেকশন অ্যালার্ট (Local Mode Active):
                </p>
                <p className="text-[11px] text-slate-600 dark:text-amber-500/80 leading-normal mt-0.5">
                  বর্তমানে আপনার অ্যাপটি লোকাল SQLite ফাইলে কাজ করছে। ডেটা সরাসরি আপনার Supabase ক্লাউড ড্যাশবোর্ডে স্টোর করতে চাইলে উপরে ডানদিকের "Database Status" বাটনে অথবা এখানে ক্লিক করে সঠিক কানেকশন URI দিন।
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  const navBtn = document.querySelector('[title*="Database Status"]');
                  if (navBtn) {
                    navBtn.click();
                  } else {
                    alert("Please click the 'Database Status' icon at the top right of the navigation bar.");
                  }
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all text-[11px] cursor-pointer shadow-xs whitespace-nowrap"
              >
                কানেক্ট Supabase (Connect Now)
              </button>
              <button
                onClick={dismissBanner}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Dismiss Banner"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-900 py-16 lg:py-24">
        {/* Glowing Background Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Smart Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">Ride Sharing</span> Portal
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Connect with fellow university students traveling in the same direction. Share rides, split travel expenses, reduce campus traffic, and travel safely together.
            </p>

            {/* Quick Action CTA */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/rides"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Available Rides</span>
              </Link>

              {isAuthenticated ? (
                (user?.role === 'driver' || user?.role === 'admin') && (
                  <Link
                    to="/driver-dashboard"
                    className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-sm transition-all border border-slate-200 dark:border-slate-700 flex items-center space-x-2"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Post Ride Offer</span>
                  </Link>
                )
              ) : (
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-sm transition-all border border-slate-200 dark:border-slate-700 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Join as Student / Driver</span>
                </Link>
              )}
            </div>

          </div>

          {/* Search Card Widget */}
          <div className="mt-12 max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Search className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Find Your Campus Commute</span>
            </h3>

            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Pickup */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Pickup Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Dhanmondi"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Destination</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-cyan-500 dark:text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Campus Gate"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Travel Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={rideDate}
                    onChange={(e) => setRideDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Rides</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-slate-50/50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Designed For Campus Safety & Convenience</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Built specifically for university students, faculty, and verified student drivers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verified Users</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                All drivers and passengers are verified university students with institutional emails and department details.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Flexible Offers</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Student drivers can publish ride offers with custom pickup locations, seat counts, fare amounts, and departure times.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Instant Requests</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Passengers can request rides with one click. Drivers get instant updates to accept or reject with real-time seat tracking.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Featured Available Rides Preview */}
      <section className="py-16 bg-white dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>Live Commutes</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Recent Available Rides</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Book upcoming ride offers published by verified student drivers.</p>
            </div>
            <Link
              to="/rides"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center space-x-1 self-start sm:self-auto bg-emerald-500/5 dark:bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/10 hover:border-emerald-500/25 transition-all"
            >
              <span>Explore All Available Rides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-72 animate-pulse p-5"></div>
              ))}
            </div>
          ) : featuredRides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredRides.map(ride => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onRequestRide={() => navigate('/rides')}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-medium">No active rides available right now.</p>
              <p className="text-xs text-slate-400 mt-1">Be the first driver to post a ride offer!</p>
            </div>
          )}

        </div>
      </section>

      {/* Role Capabilities Section */}
      <section className="py-16 bg-slate-50/50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Three Distinct Roles</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Comprehensive role-based architecture built for your campus.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Student Role */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold inline-block border border-emerald-500/20">
                1. Student / Passenger
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Secure JWT Authentication</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Filter Rides by Route &amp; Date</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Send Fast Commute Requests</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Track Live Booking Status</span>
                </li>
              </ul>
            </div>

            {/* Driver Role */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-bold inline-block border border-cyan-500/20">
                2. Student Driver
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Publish Custom Commute Offers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Manage Vehicle Details</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Review Passenger Requests</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Accept/Reject with Automatic Seats</span>
                </li>
              </ul>
            </div>

            {/* Admin Role */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold inline-block border border-purple-500/20">
                3. Administrator
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Full Dashboard &amp; System Analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Manage System Users &amp; Drivers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Remove Non-compliant Accounts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Review Complete Request Logs</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
