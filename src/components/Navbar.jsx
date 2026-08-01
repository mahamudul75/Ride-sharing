import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DatabaseStatusModal } from './DatabaseStatusModal';
import axios from 'axios';
import { 
  Car, 
  Search, 
  PlusCircle, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Shield, 
  Menu, 
  X,
  Compass,
  FileText,
  Database,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  useEffect(() => {
    const fetchDbStatus = () => {
      axios.get('/api/db-status')
        .then(res => {
          if (res.data && res.data.success) {
            setDbStatus(res.data);
          }
        })
        .catch(err => console.error('Error fetching db status in navbar:', err));
    };

    fetchDbStatus();

    // Re-fetch when the modal opens or closes (in case database configuration has changed)
    if (!isDbModalOpen) {
      fetchDbStatus();
    }
  }, [isDbModalOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-white/95 dark:bg-slate-950/95 text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-900 sticky top-0 z-40 shadow-xs backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand & Menu Toggle */}
            <div className="flex items-center space-x-3.5">
              {/* 3-line Hamburger Menu Button */}
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 focus:outline-none transition-all duration-200 cursor-pointer"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/" className="flex items-center space-x-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-xl tracking-tight group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/25 transition-all duration-200">
                  <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="leading-none text-slate-900 dark:text-white font-extrabold text-lg font-display tracking-tight">CampusRide</span>
                </div>
              </Link>
            </div>

            {/* Right: User Profile & Logout */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 rounded-xl transition-all duration-200 cursor-pointer"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? <Moon className="w-4.5 h-4.5 text-indigo-600" /> : <Sun className="w-4.5 h-4.5 text-amber-400" />}
              </button>

              <div className="h-4 w-px bg-slate-150 dark:bg-slate-800 shrink-0" />

              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all duration-200 group"
                  >
                    <img
                      src={user.profile_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800 group-hover:border-emerald-500 dark:group-hover:border-emerald-400 transition-colors duration-200"
                    />
                    <div className="flex flex-col text-left hidden sm:flex">
                      <span className="text-xs font-semibold text-slate-800 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">{user.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize font-medium leading-none mt-0.5">
                        {user.role} {user.department ? `• ${user.department}` : ''}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all duration-200 cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all duration-200 flex items-center space-x-1.5"
                  >
                    <LogIn className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-md hover:shadow-emerald-500/10 active:scale-[0.98] transition-all duration-200 flex items-center space-x-1.5 shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Elegant Side Navigation Drawer Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop blur/overlay */}
          <div 
            className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-slate-950 shadow-2xl border-r border-slate-100 dark:border-slate-900 flex flex-col z-50 transform transition-transform duration-300 ease-out">
            
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
              <Link 
                to="/" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center space-x-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-lg tracking-tight group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center">
                  <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-slate-900 dark:text-white font-extrabold font-display">CampusRide</span>
              </Link>

              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all duration-200 cursor-pointer"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
              <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Navigation</span>

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                  isActive('/') 
                    ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Compass className="w-4.5 h-4.5" />
                  <span>Home</span>
                </div>
              </Link>

              <Link
                to="/rides"
                onClick={() => setMenuOpen(false)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                  isActive('/rides') 
                    ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Search className="w-4.5 h-4.5" />
                  <span>Available Rides</span>
                </div>
              </Link>

              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                  isActive('/about') 
                    ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-4.5 h-4.5" />
                  <span>About Project</span>
                </div>
              </Link>

              {isAuthenticated && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-900 my-4" />
                  <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Member Portal</span>

                  <Link
                    to="/my-requests"
                    onClick={() => setMenuOpen(false)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                      isActive('/my-requests') 
                        ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20' 
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Compass className="w-4.5 h-4.5 text-slate-400" />
                      <span>My Requests</span>
                    </div>
                  </Link>

                  {(user?.role === 'driver' || user?.role === 'admin') && (
                    <Link
                      to="/driver-dashboard"
                      onClick={() => setMenuOpen(false)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                        isActive('/driver-dashboard') 
                          ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20' 
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <PlusCircle className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Driver Portal</span>
                      </div>
                    </Link>
                  )}

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                        isActive('/admin') 
                          ? 'bg-purple-50 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400 border border-purple-100/50 dark:border-purple-500/20' 
                          : 'text-purple-600 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Shield className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                        <span>Admin Panel</span>
                      </div>
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer Settings */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 transition-all duration-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-4 h-4 text-indigo-600" />
                      <span>Switch to Dark</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Switch to Light</span>
                    </>
                  )}
                </div>
                <span className="text-[10px] opacity-60 capitalize">{theme} Mode</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Database Status / Supabase Modal */}
      <DatabaseStatusModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
    </>
  );
};

