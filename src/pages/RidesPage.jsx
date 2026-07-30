import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RideCard } from '../components/RideCard';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  RefreshCw, 
  Car, 
  CheckCircle2, 
  PlusCircle,
  Clock
} from 'lucide-react';

export const RidesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [rides, setRides] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [pickup, setPickup] = useState(searchParams.get('pickup') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [rideDate, setRideDate] = useState(searchParams.get('date') || '');
  const [maxFare, setMaxFare] = useState(500);

  // Requesting action status
  const [requestingRideId, setRequestingRideId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (pickup) params.append('pickup_location', pickup);
      if (destination) params.append('destination', destination);
      if (rideDate) params.append('ride_date', rideDate);
      params.append('status', 'available');

      const res = await axios.get(`/api/rides?${params.toString()}`);
      if (res.data.success) {
        setRides(res.data.rides);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRequests = async () => {
    if (isAuthenticated) {
      try {
        const res = await axios.get('/api/requests');
        if (res.data.success) {
          setUserRequests(res.data.requests);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchRides();
    fetchUserRequests();
  }, [searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (pickup) newParams.pickup = pickup;
    if (destination) newParams.destination = destination;
    if (rideDate) newParams.date = rideDate;
    setSearchParams(newParams);
    fetchRides();
  };

  const handleResetFilters = () => {
    setPickup('');
    setDestination('');
    setRideDate('');
    setMaxFare(500);
    setSearchParams({});
  };

  const handleRequestRide = async (ride) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setRequestingRideId(ride.id);
      setFeedbackMsg(null);
      const res = await axios.post('/api/requests', { ride_id: ride.id });
      if (res.data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Ride request sent successfully to ${ride.driver_name}!`
        });
        fetchUserRequests();
      }
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to request ride.'
      });
    } finally {
      setRequestingRideId(null);
    }
  };

  const filteredRides = rides.filter(r => r.fare <= maxFare);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
              <Car className="w-7 h-7 text-emerald-400" />
              <span>Available Campus Rides</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Search and filter available ride offers created by verified student drivers.
            </p>
          </div>

          {(user?.role === 'driver' || user?.role === 'admin') && (
            <button
              onClick={() => navigate('/driver-dashboard')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center space-x-2 self-start md:self-auto shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish New Ride</span>
            </button>
          )}
        </div>

        {feedbackMsg && (
          <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="hover:underline">Dismiss</button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            
            {/* Pickup */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pickup Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Dhanmondi"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Destination</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Campus Gate"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ride Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={rideDate}
                  onChange={(e) => setRideDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Max Fare Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-400">Max Fare</label>
                <span className="text-xs font-bold text-emerald-400">৳{maxFare} BDT</span>
              </div>
              <input
                type="range"
                min="30"
                max="500"
                step="10"
                value={maxFare}
                onChange={(e) => setMaxFare(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-950 rounded-lg cursor-pointer mt-2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                title="Reset Filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>

        {/* Results Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400">
              Showing <span className="text-emerald-400 font-bold">{filteredRides.length}</span> ride offers
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-64 animate-pulse"></div>
              ))}
            </div>
          ) : filteredRides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRides.map(ride => {
                const req = userRequests.find(r => r.ride_id === ride.id && r.request_status !== 'Cancelled');
                return (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onRequestRide={handleRequestRide}
                    userRequested={!!req}
                    requestStatus={req?.request_status}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Rides Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your search locations or clearing date filters to view available rides.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-xl text-xs transition-colors"
              >
                Clear All Search Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
