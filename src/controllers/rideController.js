import { RideModel } from '../models/Ride.js';

export const createRide = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { pickup_location, destination, ride_date, ride_time, available_seats, fare, description } = req.body;

    if (!pickup_location || !destination || !ride_date || !ride_time || available_seats === undefined || fare === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required ride fields.' });
    }

    const seats = Number(available_seats);
    const fareAmount = Number(fare);

    if (isNaN(seats) || seats <= 0) {
      return res.status(400).json({ success: false, message: 'Available seats must be greater than 0.' });
    }

    if (isNaN(fareAmount) || fareAmount < 0) {
      return res.status(400).json({ success: false, message: 'Fare must be a valid positive number.' });
    }

    const newRide = await RideModel.create({
      driver_id: req.user.id,
      pickup_location,
      destination,
      ride_date,
      ride_time,
      available_seats: seats,
      fare: fareAmount,
      description
    });

    return res.status(201).json({
      success: true,
      message: 'Ride created successfully!',
      ride: newRide
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRides = async (req, res) => {
  try {
    const { pickup_location, destination, ride_date, driver_id, status } = req.query;

    const rides = await RideModel.findAll({
      pickup_location: pickup_location ? String(pickup_location) : undefined,
      destination: destination ? String(destination) : undefined,
      ride_date: ride_date ? String(ride_date) : undefined,
      driver_id: driver_id ? Number(driver_id) : undefined,
      status: status ? String(status) : undefined
    });

    return res.status(200).json({ success: true, count: rides.length, rides });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRideById = async (req, res) => {
  try {
    const rideId = Number(req.params.id);
    const ride = await RideModel.findById(rideId);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    return res.status(200).json({ success: true, ride });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRide = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const rideId = Number(req.params.id);
    const existingRide = await RideModel.findById(rideId);

    if (!existingRide) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    // Driver or Admin can update
    if (existingRide.driver_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own rides.' });
    }

    const updatedRide = await RideModel.update(rideId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Ride updated successfully!',
      ride: updatedRide
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRide = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const rideId = Number(req.params.id);
    const existingRide = await RideModel.findById(rideId);

    if (!existingRide) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    if (existingRide.driver_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own rides.' });
    }

    await RideModel.delete(rideId);

    return res.status(200).json({ success: true, message: 'Ride deleted successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
