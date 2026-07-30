import { queryAll, queryOne, executeRun } from '../config/database.js';
import { RideModel } from './Ride.js';

export class RequestModel {
  static async create(rideId, passengerId) {
    const numRideId = Number(rideId);
    const numPassengerId = Number(passengerId);

    if (isNaN(numRideId) || isNaN(numPassengerId)) {
      throw new Error('Invalid Ride or Passenger ID.');
    }

    // Check if request already exists
    const existing = await queryOne(`
      SELECT * FROM ride_requests WHERE ride_id = ? AND passenger_id = ? AND request_status != 'Cancelled'
    `, [numRideId, numPassengerId]);

    if (existing) {
      throw new Error('You have already requested this ride.');
    }

    const result = await executeRun(
      `INSERT INTO ride_requests (ride_id, passenger_id, request_status) VALUES (?, ?, 'Pending')`,
      [numRideId, numPassengerId]
    );

    let reqId = Number(result.lastInsertRowid);
    if (!reqId || isNaN(reqId)) {
      const inserted = await queryOne(`
        SELECT id FROM ride_requests WHERE ride_id = ? AND passenger_id = ? ORDER BY id DESC LIMIT 1
      `, [numRideId, numPassengerId]);
      if (inserted) reqId = Number(inserted.id);
    }

    return await this.findById(reqId);
  }

  static async findById(idParam) {
    const id = Number(idParam);
    if (!id || isNaN(id)) return null;

    return await queryOne(`
      SELECT req.*,
             u.name as passenger_name, u.phone as passenger_phone, u.email as passenger_email, u.department as passenger_department,
             p.profile_image as passenger_profile_image,
             r.pickup_location, r.destination, r.ride_date, r.ride_time, r.fare, r.driver_id, r.available_seats,
             driver.name as driver_name
      FROM ride_requests req
      JOIN users u ON req.passenger_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      JOIN rides r ON req.ride_id = r.id
      JOIN users driver ON r.driver_id = driver.id
      WHERE req.id = ?
    `, [id]);
  }

  static async findByPassenger(passengerIdParam) {
    const passengerId = Number(passengerIdParam);
    if (!passengerId || isNaN(passengerId)) return [];

    return await queryAll(`
      SELECT req.*,
             r.pickup_location, r.destination, r.ride_date, r.ride_time, r.fare, r.driver_id, r.status as ride_status,
             driver.name as driver_name, driver.phone as driver_phone,
             prof.vehicle_name, prof.vehicle_number, prof.vehicle_type
      FROM ride_requests req
      JOIN rides r ON req.ride_id = r.id
      JOIN users driver ON r.driver_id = driver.id
      LEFT JOIN profiles prof ON driver.id = prof.user_id
      WHERE req.passenger_id = ?
      ORDER BY req.request_date DESC
    `, [passengerId]);
  }

  static async findByDriver(driverIdParam) {
    const driverId = Number(driverIdParam);
    if (!driverId || isNaN(driverId)) return [];

    return await queryAll(`
      SELECT req.*,
             u.name as passenger_name, u.phone as passenger_phone, u.email as passenger_email, u.department as passenger_department,
             p.profile_image as passenger_profile_image,
             r.pickup_location, r.destination, r.ride_date, r.ride_time, r.fare, r.available_seats
      FROM ride_requests req
      JOIN rides r ON req.ride_id = r.id
      JOIN users u ON req.passenger_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE r.driver_id = ?
      ORDER BY req.request_date DESC
    `, [driverId]);
  }

  static async findAll() {
    return await queryAll(`
      SELECT req.*,
             u.name as passenger_name, u.email as passenger_email,
             r.pickup_location, r.destination, r.ride_date, r.ride_time,
             driver.name as driver_name
      FROM ride_requests req
      JOIN users u ON req.passenger_id = u.id
      JOIN rides r ON req.ride_id = r.id
      JOIN users driver ON r.driver_id = driver.id
      ORDER BY req.request_date DESC
    `);
  }

  static async updateStatus(idParam, status) {
    const id = Number(idParam);
    if (!id || isNaN(id)) return null;

    const req = await this.findById(id);
    if (!req) return null;

    await executeRun(`UPDATE ride_requests SET request_status = ? WHERE id = ?`, [status, id]);

    // If request was accepted, decrement available seats in the ride
    if (status === 'Accepted') {
      const ride = await RideModel.findById(req.ride_id);
      if (ride && ride.available_seats > 0) {
        const newSeats = ride.available_seats - 1;
        await RideModel.update(req.ride_id, {
          available_seats: newSeats,
          status: newSeats === 0 ? 'full' : ride.status
        });
      }
    } else if (status === 'Cancelled' && req.request_status === 'Accepted') {
      // If an accepted request gets cancelled, increment seats back
      const ride = await RideModel.findById(req.ride_id);
      if (ride) {
        const newSeats = ride.available_seats + 1;
        await RideModel.update(req.ride_id, {
          available_seats: newSeats,
          status: 'available'
        });
      }
    }

    return await this.findById(id);
  }
}
