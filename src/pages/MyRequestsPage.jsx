import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Send, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Car, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  Trash2,
  ChevronRight
} from 'lucide-react';

export const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/requests');
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this ride request?')) return;

    try {
      const res = await axios.put(`/api/requests/${requestId}`, { status: 'Cancelled' });
      if (res.data.success) {
        setFeedback('Request cancelled successfully.');
        fetchRequests();
      }
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold inline-flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Accepted</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold inline-flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-xs font-semibold">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold inline-flex items-center space-x-1">
            <Clock3 className="w-3.5 h-3.5" />
            <span>Pending Driver Approval</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
              <Send className="w-7 h-7 text-emerald-400" />
              <span>My Ride Requests</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Track ride requests you submitted to student drivers and view driver contact info when accepted.
            </p>
          </div>
          <Link
            to="/rides"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors self-start sm:self-auto"
          >
            Find More Rides
          </Link>
        </div>

        {feedback && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-emerald-400 font-semibold flex items-center justify-between">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="hover:underline text-slate-400">Dismiss</button>
          </div>
        )}

        {/* Requests Table / Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-28 animate-pulse"></div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map(req => (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                
                {/* Route & Driver */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-white">
                      {req.pickup_location} → {req.destination}
                    </span>
                    {getStatusBadge(req.request_status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{req.ride_date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{req.ride_time}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <span>Fare: ৳{req.fare} BDT</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 pt-1 flex items-center space-x-2">
                    <span className="text-slate-500">Driver:</span>
                    <span className="font-semibold text-white">{req.driver_name}</span>
                    {req.vehicle_name && (
                      <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {req.vehicle_name} ({req.vehicle_type})
                      </span>
                    )}
                  </div>

                  {req.request_status === 'Accepted' && req.driver_phone && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 mt-2">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Driver Phone: <strong className="text-white font-mono">{req.driver_phone}</strong></span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                  <Link
                    to={`/rides/${req.ride_id}`}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1"
                  >
                    <span>View Ride</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {req.request_status === 'Pending' && (
                    <button
                      onClick={() => handleCancelRequest(req.id)}
                      className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Send className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Ride Requests Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't requested any rides. Browse available student ride offers and send a request!
            </p>
            <Link
              to="/rides"
              className="inline-block px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              Browse Rides
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
