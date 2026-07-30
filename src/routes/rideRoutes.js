import { Router } from 'express';
import { createRide, getRides, getRideById, updateRide, deleteRide } from '../controllers/rideController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Public / Authenticated read rides
router.get('/', getRides);
router.get('/:id', getRideById);

// Driver & Admin ride management
router.post('/', authenticateToken, authorizeRoles('driver', 'admin'), createRide);
router.put('/:id', authenticateToken, authorizeRoles('driver', 'admin'), updateRide);
router.delete('/:id', authenticateToken, authorizeRoles('driver', 'admin'), deleteRide);

export default router;
