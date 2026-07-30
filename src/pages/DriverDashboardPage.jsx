import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RideCard } from '../components/RideCard';
import { RideModal } from '../components/RideModal';
import { useAuth } from '../context/AuthContext';
import { 
  Car, 
  PlusCircle, 
  Users, 
  Check, 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2 
} from 'lucide-react';

export const DriverDashboardPage = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('rides');
  const [myRides, setMyRides] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRide, setEditingRide] = useState(null);

  const [feedback, setFeedback] = useState(null);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      // Fetch my rides
      const ridesRes = await axios.get(`/api/rides?driver_id=${user?.id}`);
      if (ridesRes.data.success) {
        setMyRides(ridesRes.data.rides);
      }

      // Fetch incoming requests
      const reqRes = await axios.get('/api/requests');
      if (reqRes.data.success) {
        setIncomingRequests(reqRes.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDriverData();
    }
  }, [user]);

  const handleSaveRide = async (rideData) => {
    if (editingRide) {
      await axios.put(`/api/rides/${editingRide.id}`, rideData);
      setFeedback('Ride offer updated successfully!');
    } else {
      await axios.post('/api/rides', rideData);
      setFeedback('New ride offer published successfully!');
    }
    fetchDriverData();
  };

  const handleDeleteRide = async (rideId) => {
    if (!window.confirm('Are you sure you want to delete this ride offer? All associated requests will be cancelled.')) return;

    try {
      const res = await axios.delete(`/api/rides/${rideId}`);
      if (res.data.success) {
        setFeedback('Ride offer deleted.');
        fetchDriverData();
      }
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to delete ride.');
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      const res = await axios.put(`/api/requests/${requestId}`, { status });
      if (res.data.success) {
        setFeedback(`Request ${status.toLowerCase()} successfully!`);
        fetchDriverData();
      }
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to update request.');
    }
  };

  const pendingCount = incomingRequests.filter(r => r.request_status === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
              <Car className="w-7 h-7 text-cyan-400" />
              <span>Driver Management Portal</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your ride posts, edit trip details, and approve or reject incoming student passenger requests.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingRide(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center space-x-2 self-start sm:self-auto shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish New Ride</span>
          </button>
        </div>

        {feedback && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-emerald-400 font-semibold flex items-center justify-between">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="hover:underline text-slate-400">Dismiss</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('rides')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'rides'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>My Published Rides ({myRides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 relative ${
              activeTab === 'requests'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Incoming Passenger Requests ({incomingRequests.length})</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {pendingCount} new
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: My Published Rides */}
        {activeTab === 'rides' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-64 animate-pulse"></div>
                ))}
              </div>
            ) : myRides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRides.map(ride => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onEditRide={(r) => {
                      setEditingRide(r);
                      setIsModalOpen(true);
                    }}
                    onDeleteRide={handleDeleteRide}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Car className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Active Ride Posts</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You haven't posted any ride offers yet. Click below to publish your first ride offer!
                </p>
                <button
                  onClick={() => {
                    setEditingRide(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Publish Ride
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Requests */}
        {activeTab === 'requests' && (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-24 animate-pulse"></div>
                ))}
              </div>
            ) : incomingRequests.length > 0 ? (
              <div className="space-y-4">
                {incomingRequests.map(req => (
                  <div
                    key={req.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    
                    {/* Passenger & Ride Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <img
                          src={req.passenger_profile_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
                          alt={req.passenger_name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{req.passenger_name}</p>
                          <p className="text-xs text-slate-400">{req.passenger_department || 'University Student'} • {req.passenger_email}</p>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                        <p className="font-semibold text-slate-200">
                          Requested Ride: <span className="text-emerald-400">{req.pickup_location} → {req.destination}</span>
                        </p>
                        <p className="text-slate-400">
                          Date: {req.ride_date} at {req.ride_time} • Fare: ৳{req.fare} BDT • Seats Remaining in Ride: {req.available_seats}
                        </p>
                      </div>

                      {req.passenger_phone && (
                        <p className="text-xs text-emerald-400 flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Passenger Phone: <strong className="font-mono">{req.passenger_phone}</strong></span>
                        </p>
                      )}
                    </div>

                    {/* Request Action Controls */}
                    <div className="flex items-center space-x-2 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                      {req.request_status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'Accepted')}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1 shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'Rejected')}
                            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                          req.request_status === 'Accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          Status: {req.request_status}
                        </span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Incoming Passenger Requests</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When students request seats on your published rides, they will appear here for your review and approval.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create / Edit Ride Modal */}
        <RideModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRide(null);
          }}
          onSubmit={handleSaveRide}
          initialRide={editingRide}
        />

      </div>
    </div>
  );
};
