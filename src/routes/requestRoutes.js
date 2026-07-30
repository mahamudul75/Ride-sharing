import { Router } from 'express';
import { createRequest, getRequests, updateRequestStatus } from '../controllers/requestController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken, createRequest);
router.get('/', authenticateToken, getRequests);
router.put('/:id', authenticateToken, updateRequestStatus);

export default router;
