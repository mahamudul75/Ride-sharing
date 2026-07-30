import { RequestModel } from '../models/Request.js';
import { RideModel } from '../models/Ride.js';

export const createRequest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { ride_id } = req.body;
    if (!ride_id) {
      return res.status(400).json({ success: false, message: 'Ride ID is required.' });
    }

    const ride = await RideModel.findById(Number(ride_id));
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    if (ride.driver_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot request your own ride.' });
    }

    if (ride.available_seats <= 0) {
      return res.status(400).json({ success: false, message: 'No seats available for this ride.' });
    }

    const rideRequest = await RequestModel.create(Number(ride_id), req.user.id);

    return res.status(201).json({
      success: true,
      message: 'Ride request submitted successfully!',
      request: rideRequest
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let requests = [];

    if (req.user.role === 'admin') {
      requests = await RequestModel.findAll();
    } else if (req.user.role === 'driver') {
      // Drivers see incoming requests for their rides, or requests they made as passenger
      const driverRequests = await RequestModel.findByDriver(req.user.id);
      const passengerRequests = await RequestModel.findByPassenger(req.user.id);
      requests = [...driverRequests, ...passengerRequests];
    } else {
      // Students see requests they made
      requests = await RequestModel.findByPassenger(req.user.id);
    }

    return res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const requestId = Number(req.params.id);
    const { status } = req.body;

    if (!['Pending', 'Accepted', 'Rejected', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    const existingReq = await RequestModel.findById(requestId);
    if (!existingReq) {
      return res.status(404).json({ success: false, message: 'Ride request not found.' });
    }

    // Permission check: Driver of ride can Accept/Reject; Passenger can Cancel; Admin can do any
    if (req.user.role === 'admin') {
      // Admin allowed
    } else if (status === 'Cancelled') {
      if (existingReq.passenger_id !== req.user.id && existingReq.driver_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this request.' });
      }
    } else {
      // Accept / Reject
      if (existingReq.driver_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Only the ride driver can change request status.' });
      }
    }

    const updated = await RequestModel.updateStatus(requestId, status);

    return res.status(200).json({
      success: true,
      message: `Request status updated to ${status}.`,
      request: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
