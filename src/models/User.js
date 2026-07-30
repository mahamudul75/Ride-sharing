import { queryAll, queryOne, executeRun } from '../config/database.js';

export class UserModel {
  static async findByEmail(email) {
    if (!email) return null;
    return await queryOne(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
  }

  static async findById(idParam) {
    const id = Number(idParam);
    if (!id || isNaN(id)) return null;

    const user = await queryOne(`
      SELECT u.id, u.name, u.email, u.phone, u.department, u.role, u.created_at,
             p.profile_image, p.vehicle_name, p.vehicle_number, p.vehicle_type
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `, [id]);

    return user;
  }

  static async create(userData) {
    const result = await executeRun(
      `INSERT INTO users (name, email, password, phone, department, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userData.name.trim(),
        userData.email.toLowerCase().trim(),
        userData.passwordHash,
        userData.phone || '',
        userData.department || '',
        userData.role || 'student'
      ]
    );

    let userId = Number(result.lastInsertRowid);
    if (!userId || isNaN(userId)) {
      const inserted = await this.findByEmail(userData.email);
      if (inserted) userId = inserted.id;
    }

    if (userId) {
      try {
        await executeRun(
          `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES (?, ?, ?, ?, ?)`,
          [
            userId,
            `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
            userData.vehicle_name || '',
            userData.vehicle_number || '',
            userData.vehicle_type || ''
          ]
        );
      } catch (err) {
        await executeRun(
          `UPDATE profiles SET profile_image = ?, vehicle_name = ?, vehicle_number = ?, vehicle_type = ? WHERE user_id = ?`,
          [
            `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
            userData.vehicle_name || '',
            userData.vehicle_number || '',
            userData.vehicle_type || '',
            userId
          ]
        );
      }
    }

    const createdUser = await this.findById(userId);
    if (!createdUser) {
      return await this.findByEmail(userData.email);
    }
    return createdUser;
  }

  static async updateProfile(userIdParam, data) {
    const userId = Number(userIdParam);
    if (!userId || isNaN(userId)) return null;

    if (data.name !== undefined || data.phone !== undefined || data.department !== undefined) {
      const user = await queryOne(`SELECT * FROM users WHERE id = ?`, [userId]);
      if (user) {
        await executeRun(
          `UPDATE users SET name = ?, phone = ?, department = ? WHERE id = ?`,
          [
            data.name !== undefined ? data.name : user.name,
            data.phone !== undefined ? data.phone : user.phone,
            data.department !== undefined ? data.department : user.department,
            userId
          ]
        );
      }
    }

    const profile = await queryOne(`SELECT * FROM profiles WHERE user_id = ?`, [userId]);
    if (profile) {
      await executeRun(
        `UPDATE profiles SET profile_image = ?, vehicle_name = ?, vehicle_number = ?, vehicle_type = ? WHERE user_id = ?`,
        [
          data.profile_image !== undefined ? data.profile_image : profile.profile_image,
          data.vehicle_name !== undefined ? data.vehicle_name : profile.vehicle_name,
          data.vehicle_number !== undefined ? data.vehicle_number : profile.vehicle_number,
          data.vehicle_type !== undefined ? data.vehicle_type : profile.vehicle_type,
          userId
        ]
      );
    } else {
      try {
        await executeRun(
          `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES (?, ?, ?, ?, ?)`,
          [
            userId,
            data.profile_image || '',
            data.vehicle_name || '',
            data.vehicle_number || '',
            data.vehicle_type || ''
          ]
        );
      } catch (err) {
        await executeRun(
          `UPDATE profiles SET profile_image = ?, vehicle_name = ?, vehicle_number = ?, vehicle_type = ? WHERE user_id = ?`,
          [
            data.profile_image !== undefined ? data.profile_image : '',
            data.vehicle_name !== undefined ? data.vehicle_name : '',
            data.vehicle_number !== undefined ? data.vehicle_number : '',
            data.vehicle_type !== undefined ? data.vehicle_type : '',
            userId
          ]
        );
      }
    }

    return await this.findById(userId);
  }

  static async getAllUsers() {
    return await queryAll(`
      SELECT u.id, u.name, u.email, u.phone, u.department, u.role, u.created_at,
             p.profile_image, p.vehicle_name, p.vehicle_number, p.vehicle_type
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `);
  }

  static async deleteUser(id) {
    const userId = Number(id);
    await executeRun(`DELETE FROM profiles WHERE user_id = ?`, [userId]);
    await executeRun(`DELETE FROM ride_requests WHERE passenger_id = ?`, [userId]);
    await executeRun(`DELETE FROM rides WHERE driver_id = ?`, [userId]);
    return await executeRun(`DELETE FROM users WHERE id = ?`, [userId]);
  }
}
