import { UserModel } from '../models/User.js';
import { queryOne } from '../config/database.js';

export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (req.user && req.user.id === userId) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own account.' });
    }

    await UserModel.deleteUser(userId);
    return res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const uRes = await queryOne(`SELECT COUNT(*) as total FROM users`);
    const dRes = await queryOne(`SELECT COUNT(*) as total FROM users WHERE role = 'driver'`);
    const rRes = await queryOne(`SELECT COUNT(*) as total FROM rides`);
    const reqRes = await queryOne(`SELECT COUNT(*) as total FROM ride_requests`);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: uRes ? parseInt(uRes.total, 10) : 0,
        totalDrivers: dRes ? parseInt(dRes.total, 10) : 0,
        totalRides: rRes ? parseInt(rRes.total, 10) : 0,
        totalRequests: reqRes ? parseInt(reqRes.total, 10) : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
