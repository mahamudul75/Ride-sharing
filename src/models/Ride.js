import { queryAll, queryOne, executeRun } from '../config/database.js';

export class RideModel {
  static async create(rideData) {
    const driverId = Number(rideData.driver_id);
    const seats = Number(rideData.available_seats);
    const fare = Number(rideData.fare);

    const result = await executeRun(
      `INSERT INTO rides (driver_id, pickup_location, destination, ride_date, ride_time, available_seats, fare, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
      [
        driverId,
        rideData.pickup_location.trim(),
        rideData.destination.trim(),
        rideData.ride_date,
        rideData.ride_time,
        seats,
        fare,
        rideData.description || ''
      ]
    );

    let rideId = Number(result.lastInsertRowid);
    if (!rideId || isNaN(rideId)) {
      const inserted = await queryOne(`
        SELECT id FROM rides WHERE driver_id = ? ORDER BY id DESC LIMIT 1
      `, [driverId]);
      if (inserted) rideId = Number(inserted.id);
    }

    return await this.findById(rideId);
  }

  static async findById(idParam) {
    const id = Number(idParam);
    if (!id || isNaN(id)) return null;

    return await queryOne(`
      SELECT r.*,
             u.name as driver_name, u.phone as driver_phone, u.email as driver_email, u.department as driver_department,
             p.vehicle_name, p.vehicle_number, p.vehicle_type, p.profile_image
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE r.id = ?
    `, [id]);
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT r.*,
             u.name as driver_name, u.phone as driver_phone, u.email as driver_email, u.department as driver_department,
             p.vehicle_name, p.vehicle_number, p.vehicle_type, p.profile_image
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.pickup_location) {
      sql += ` AND LOWER(r.pickup_location) LIKE ?`;
      params.push(`%${filters.pickup_location.toLowerCase().trim()}%`);
    }

    if (filters.destination) {
      sql += ` AND LOWER(r.destination) LIKE ?`;
      params.push(`%${filters.destination.toLowerCase().trim()}%`);
    }

    if (filters.ride_date) {
      sql += ` AND r.ride_date = ?`;
      params.push(filters.ride_date);
    }

    if (filters.status) {
      sql += ` AND r.status = ?`;
      params.push(filters.status);
    }

    if (filters.driver_id) {
      sql += ` AND r.driver_id = ?`;
      params.push(Number(filters.driver_id));
    }

    sql += ` ORDER BY r.ride_date ASC, r.ride_time ASC`;

    return await queryAll(sql, params);
  }

  static async update(idParam, data) {
    const id = Number(idParam);
    if (!id || isNaN(id)) return null;

    const ride = await this.findById(id);
    if (!ride) return null;

    await executeRun(
      `UPDATE rides SET
        pickup_location = ?,
        destination = ?,
        ride_date = ?,
        ride_time = ?,
        available_seats = ?,
        fare = ?,
        description = ?,
        status = ?
       WHERE id = ?`,
      [
        data.pickup_location !== undefined ? data.pickup_location.trim() : ride.pickup_location,
        data.destination !== undefined ? data.destination.trim() : ride.destination,
        data.ride_date !== undefined ? data.ride_date : ride.ride_date,
        data.ride_time !== undefined ? data.ride_time : ride.ride_time,
        data.available_seats !== undefined ? Number(data.available_seats) : ride.available_seats,
        data.fare !== undefined ? Number(data.fare) : ride.fare,
        data.description !== undefined ? data.description : ride.description,
        data.status !== undefined ? data.status : ride.status,
        id
      ]
    );

    return await this.findById(id);
  }

  static async delete(idParam) {
    const id = Number(idParam);
    if (!id || isNaN(id)) return { changes: 0 };

    await executeRun(`DELETE FROM ride_requests WHERE ride_id = ?`, [id]);
    return await executeRun(`DELETE FROM rides WHERE id = ?`, [id]);
  }
}
