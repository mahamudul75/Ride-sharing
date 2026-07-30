import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DatabaseStatusModal } from '../components/DatabaseStatusModal';
import { 
  Shield, 
  Users, 
  Car, 
  Send, 
  Trash2, 
  Activity, 
  CheckCircle2, 
  Search, 
  RefreshCw,
  AlertTriangle,
  Database
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalRides: 0,
    totalRequests: 0
  });

  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('users');
  const [userSearch, setUserSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, ridesRes, reqRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users'),
        axios.get('/api/rides'),
        axios.get('/api/requests')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (ridesRes.data.success) setRides(ridesRes.data.rides);
      if (reqRes.data.success) setRequests(reqRes.data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This will remove all their profiles, rides, and requests.`)) return;

    try {
      const res = await axios.delete(`/api/admin/users/${userId}`);
      if (res.data.success) {
        setFeedback(`User "${userName}" deleted successfully.`);
        fetchAdminData();
      }
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleDeleteRide = async (rideId) => {
    if (!window.confirm('Delete this ride offer from the system?')) return;

    try {
      const res = await axios.delete(`/api/rides/${rideId}`);
      if (res.data.success) {
        setFeedback('Ride offer removed by Admin.');
        fetchAdminData();
      }
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to delete ride.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.department?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
              <Shield className="w-7 h-7 text-purple-400" />
              <span>System Administration Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Global overview, user management, ride post moderation, and activity monitoring.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Database Engine &amp; Supabase</span>
            </button>

            <button
              onClick={fetchAdminData}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Stats</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-emerald-400 font-semibold flex items-center justify-between">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="hover:underline text-slate-400">Dismiss</button>
          </div>
        )}

        {/* System Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total Users</span>
            </span>
            <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
            <p className="text-[10px] text-slate-500">Registered platform accounts</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Car className="w-3.5 h-3.5 text-cyan-400" />
              <span>Student Drivers</span>
            </span>
            <p className="text-3xl font-black text-cyan-400">{stats.totalDrivers}</p>
            <p className="text-[10px] text-slate-500">Verified vehicle owners</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-yellow-400" />
              <span>Total Rides</span>
            </span>
            <p className="text-3xl font-black text-white">{stats.totalRides}</p>
            <p className="text-[10px] text-slate-500">Published offer posts</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span>Total Requests</span>
            </span>
            <p className="text-3xl font-black text-purple-400">{stats.totalRequests}</p>
            <p className="text-[10px] text-slate-500">Passenger booking logs</p>
          </div>

        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Manage Users ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('rides')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rides'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Manage Rides ({rides.length})
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Request Logs ({requests.length})
          </button>
        </div>

        {/* Tab 1: Manage Users */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-base font-bold text-white">Registered Platform Users</h3>
              
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, email, department..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Vehicle Details</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={u.profile_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : u.role === 'driver'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        {u.department || 'General Student'}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {u.vehicle_name ? `${u.vehicle_name} (${u.vehicle_number})` : 'N/A'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 2: Manage Rides */}
        {activeTab === 'rides' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">System Ride Posts</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                    <th className="py-2.5 px-3">Route</th>
                    <th className="py-2.5 px-3">Driver</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Seats</th>
                    <th className="py-2.5 px-3">Fare</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {rides.map(r => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {r.pickup_location} → {r.destination}
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-medium">
                        {r.driver_name}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {r.ride_date} at {r.ride_time}
                      </td>
                      <td className="py-3 px-3">
                        {r.available_seats} remaining
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                        ৳{r.fare}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteRide(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Ride"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Request Logs */}
        {activeTab === 'requests' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">System Ride Request Logs</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                    <th className="py-2.5 px-3">Passenger</th>
                    <th className="py-2.5 px-3">Driver</th>
                    <th className="py-2.5 px-3">Route</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {req.passenger_name}
                      </td>
                      <td className="py-3 px-3 text-cyan-400">
                        {req.driver_name}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {req.pickup_location} → {req.destination}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.request_status === 'Accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : req.request_status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {req.request_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {req.request_date?.split(' ')[0] || 'Today'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DatabaseStatusModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
      </div>
    </div>
  );
};
