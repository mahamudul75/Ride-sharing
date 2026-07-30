import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  Bike, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Send
} from 'lucide-react';

export const RideCard = ({
  ride,
  onRequestRide,
  onEditRide,
  onDeleteRide,
  userRequested,
  requestStatus
}) => {
  const { user } = useAuth();
  const isDriver = user?.id === ride.driver_id;
  const isAdmin = user?.role === 'admin';

  const getVehicleIcon = (type) => {
    if (type?.toLowerCase() === 'bike' || type?.toLowerCase() === 'motorcycle') {
      return <Bike className="w-4 h-4 text-amber-400" />;
    }
    return <Car className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-lg hover:shadow-emerald-500/5 flex flex-col justify-between group">
      <div>
        {/* Top Header: Vehicle & Status */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              {getVehicleIcon(ride.vehicle_type)}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-300 block">
                {ride.vehicle_name || 'Campus Vehicle'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {ride.vehicle_number || ride.vehicle_type || 'Vehicle'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
              ride.available_seats > 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              <Users className="w-3 h-3" />
              <span>{ride.available_seats > 0 ? `${ride.available_seats} seat${ride.available_seats > 1 ? 's' : ''} left` : 'Full'}</span>
            </span>

            <span className="text-base font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-800/50">
              ৳{ride.fare}
            </span>
          </div>
        </div>

        {/* Driver Info */}
        <div className="flex items-center space-x-3 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <img
            src={ride.profile_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
            alt={ride.driver_name}
            className="w-9 h-9 rounded-full object-cover border border-slate-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{ride.driver_name}</p>
            <p className="text-[11px] text-slate-400 truncate">{ride.driver_department || 'University Student'}</p>
          </div>
        </div>

        {/* Route Details */}
        <div className="space-y-2 mb-4 bg-slate-950/30 p-3 rounded-xl border border-slate-800/50">
          <div className="flex items-start space-x-2.5">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pickup</span>
              <p className="text-xs font-semibold text-slate-200 truncate">{ride.pickup_location}</p>
            </div>
          </div>

          <div className="ml-2 border-l-2 border-dashed border-slate-800 h-3 my-0.5"></div>

          <div className="flex items-start space-x-2.5">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Destination</span>
              <p className="text-xs font-semibold text-slate-200 truncate">{ride.destination}</p>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="flex items-center space-x-1.5 text-slate-300 bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{ride.ride_date}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300 bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{ride.ride_time}</span>
          </div>
        </div>

        {ride.description && (
          <p className="text-xs text-slate-400 italic mb-4 line-clamp-2">
            "{ride.description}"
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <Link
          to={`/rides/${ride.id}`}
          className="text-xs font-medium text-slate-400 hover:text-white flex items-center space-x-1 py-1.5 px-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {/* Controls based on role / ownership */}
        {isDriver || isAdmin ? (
          <div className="flex items-center space-x-1.5">
            {onEditRide && (
              <button
                onClick={() => onEditRide(ride)}
                className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                title="Edit Ride"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDeleteRide && (
              <button
                onClick={() => onDeleteRide(ride.id)}
                className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete Ride"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div>
            {userRequested ? (
              <span className={`text-xs px-3 py-1.5 rounded-xl font-medium inline-flex items-center space-x-1 ${
                requestStatus === 'Accepted'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : requestStatus === 'Rejected'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Request {requestStatus || 'Sent'}</span>
              </span>
            ) : ride.available_seats > 0 ? (
              <button
                onClick={() => onRequestRide && onRequestRide(ride)}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Ride</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">No Seats</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
