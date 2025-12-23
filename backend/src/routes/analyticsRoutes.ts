import express from 'express';
import { getDashboardStats } from '../controllers/analyticsController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, authorize('ADMIN', 'RISK_ANALYST'), getDashboardStats);

export default router;
