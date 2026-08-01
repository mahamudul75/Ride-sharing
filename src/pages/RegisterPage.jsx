import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Phone, BookOpen, Car, Bike, ShieldCheck } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Software Engineering');
  const [role, setRole] = useState('student');
  
  // Driver fields
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (role === 'driver' && (!vehicleName.trim() || !vehicleNumber.trim())) {
      setError('Drivers must provide vehicle name and registration number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        phone,
        department,
        role,
        vehicle_name: role === 'driver' ? vehicleName : '',
        vehicle_number: role === 'driver' ? vehicleNumber : '',
        vehicle_type: role === 'driver' ? vehicleType : ''
      });

      if (response.data.success) {
        login(response.data.token, response.data.user);
        navigate('/');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
      <div className="max-w-xl w-full mx-auto space-y-5 sm:space-y-6 bg-slate-900 border border-slate-800 p-4 sm:p-8 rounded-2xl shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Create Campus Account</h2>
          <p className="text-xs text-slate-400">Register as a Student Passenger or Student Driver</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select User Role</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-3 px-2 sm:px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all cursor-pointer ${
                  role === 'student'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">Student Passenger</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('driver')}
                className={`py-3 px-2 sm:px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all cursor-pointer ${
                  role === 'driver'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400 shadow-sm ring-1 ring-cyan-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Car className="w-4 h-4 shrink-0" />
                <span className="truncate">Student Driver</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Tanvir Hasan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="user@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  autoComplete="tel"
                  placeholder="+8801700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Department</label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>
          </div>

          {/* Conditional Driver Details */}
          {role === 'driver' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                <Car className="w-4 h-4 shrink-0" />
                <span>Vehicle Information (Required for Drivers)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota Axio"
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    className="w-full min-w-0 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Vehicle Reg No *</label>
                  <input
                    type="text"
                    required
                    placeholder="DHAKA-METRO-GA-00"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full min-w-0 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full min-w-0 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white"
                  >
                    <option value="Car">Car (Sedan/SUV)</option>
                    <option value="Bike">Motorcycle / Bike</option>
                    <option value="Microbus">Microbus</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Already registered? </span>
          <Link to="/login" className="text-emerald-400 hover:underline font-bold">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};
