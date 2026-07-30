import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  Phone, 
  Mail, 
  BookOpen, 
  Send, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const RideDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [ride, setRide] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/rides/${id}`);
      if (res.data.success) {
        setRide(res.data.ride);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRequest = async () => {
    if (isAuthenticated) {
      try {
        const res = await axios.get('/api/requests');
        if (res.data.success) {
          const req = res.data.requests.find(r => r.ride_id === Number(id) && r.request_status !== 'Cancelled');
          setExistingRequest(req || null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchRideDetails();
    fetchUserRequest();
  }, [id]);

  const handleRequestRide = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setRequesting(true);
      setMsg(null);
      const res = await axios.post('/api/requests', { ride_id: Number(id) });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Ride request submitted successfully!' });
        fetchUserRequest();
        fetchRideDetails();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit request.' });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Ride Not Found</h2>
          <p className="text-xs text-slate-400">The requested ride offer may have been deleted or expired.</p>
          <Link to="/rides" className="inline-block px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">
            Return to Available Rides
          </Link>
        </div>
      </div>
    );
  }

  const isDriver = user?.id === ride.driver_id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous page</span>
        </button>

        {msg && (
          <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="hover:underline">Dismiss</button>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold capitalize">
                  {ride.status}
                </span>
                <span className="text-xs text-slate-400">Posted on {ride.created_at?.split(' ')[0] || 'Today'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                {ride.pickup_location} → {ride.destination}
              </h1>
            </div>

            <div className="text-left sm:text-right bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fare per passenger</span>
              <span className="text-2xl font-black text-emerald-400">৳{ride.fare} BDT</span>
            </div>
          </div>

          {/* Departure Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Travel Date</span>
              </span>
              <p className="text-sm font-bold text-white">{ride.ride_date}</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Departure Time</span>
              </span>
              <p className="text-sm font-bold text-white">{ride.ride_time}</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Available Seats</span>
              </span>
              <p className="text-sm font-bold text-white">{ride.available_seats} Seats Remaining</p>
            </div>

          </div>

          {/* Description / Remarks */}
          {ride.description && (
            <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-slate-300">Driver Remarks</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{ride.description}</p>
            </div>
          )}

          {/* Driver & Vehicle Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            
            {/* Driver Profile */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Driver Information</h3>
              
              <div className="flex items-center space-x-3">
                <img
                  src={ride.profile_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
                  alt={ride.driver_name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <p className="text-sm font-bold text-white">{ride.driver_name}</p>
                  <p className="text-xs text-emerald-400 font-medium">{ride.driver_department || 'University Student'}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-900">
                <p className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{ride.driver_phone || 'Phone hidden until request accepted'}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{ride.driver_email || 'Email hidden'}</span>
                </p>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Vehicle Details</h3>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{ride.vehicle_name || 'Campus Vehicle'}</p>
                  <p className="text-xs text-cyan-400 font-mono">{ride.vehicle_number || 'REG: N/A'}</p>
                </div>
              </div>

              <div className="text-xs text-slate-400 pt-2 border-t border-slate-900">
                <p>Vehicle Type: <span className="text-slate-200 font-semibold">{ride.vehicle_type || 'Car'}</span></p>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="text-xs text-slate-400 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Campus Ride • Safe Student Commute</span>
            </div>

            <div>
              {isDriver ? (
                <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/50 px-4 py-2 rounded-xl border border-cyan-800">
                  You are the driver of this ride
                </span>
              ) : existingRequest ? (
                <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Request Status: {existingRequest.request_status}</span>
                </div>
              ) : ride.available_seats > 0 ? (
                <button
                  onClick={handleRequestRide}
                  disabled={requesting}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{requesting ? 'Submitting Request...' : 'Send Ride Request'}</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-rose-400 bg-rose-950/50 px-4 py-2.5 rounded-xl border border-rose-800">
                  This ride is fully booked
                </span>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
