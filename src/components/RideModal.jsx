import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Edit3, MapPin, Calendar, Clock, Users } from 'lucide-react';

export const RideModal = ({ isOpen, onClose, onSubmit, initialRide }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [rideDate, setRideDate] = useState('');
  const [rideTime, setRideTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState(3);
  const [fare, setFare] = useState(100);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialRide) {
      setPickup(initialRide.pickup_location);
      setDestination(initialRide.destination);
      setRideDate(initialRide.ride_date);
      setRideTime(initialRide.ride_time);
      setAvailableSeats(initialRide.available_seats);
      setFare(initialRide.fare);
      setDescription(initialRide.description || '');
    } else {
      // Defaults
      setPickup('');
      setDestination('');
      const today = new Date().toISOString().split('T')[0];
      setRideDate(today);
      setRideTime('08:30');
      setAvailableSeats(3);
      setFare(100);
      setDescription('');
    }
    setError('');
  }, [initialRide, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickup.trim() || !destination.trim() || !rideDate || !rideTime) {
      setError('Please fill in pickup location, destination, date, and time.');
      return;
    }

    if (availableSeats <= 0) {
      setError('Available seats must be at least 1.');
      return;
    }

    if (fare < 0) {
      setError('Fare cannot be negative.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        pickup_location: pickup,
        destination,
        ride_date: rideDate,
        ride_time: rideTime,
        available_seats: Number(availableSeats),
        fare: Number(fare),
        description
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save ride offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {initialRide ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <h3 className="text-lg font-bold text-white">
              {initialRide ? 'Edit Ride Offer' : 'Post New Ride Offer'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Pickup */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pickup Location <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhanmondi 27"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Destination <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Campus Main Gate"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ride Date <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={rideDate}
                  onChange={(e) => setRideDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Departure Time <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="time"
                  required
                  value={rideTime}
                  onChange={(e) => setRideTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Seats */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Available Seats <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={availableSeats}
                  onChange={(e) => setAvailableSeats(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Fare */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fare per Seat (৳ BDT) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="text-emerald-400 text-sm font-bold absolute left-3.5 top-2">৳</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  required
                  value={fare}
                  onChange={(e) => setFare(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ride Notes / Remarks (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Non-smoking, leaving on time, luggage room available..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialRide ? 'Update Offer' : 'Publish Offer'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
