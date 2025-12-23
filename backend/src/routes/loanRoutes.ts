import express from 'express';
import { apply, getAllLoans, getMyLoans, updateStatus } from '../controllers/loanController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/apply', protect, authorize('APPLICANT'), apply);
router.get('/', protect, authorize('ADMIN', 'LOAN_OFFICER', 'RISK_ANALYST'), getAllLoans);
router.get('/my', protect, authorize('APPLICANT'), getMyLoans);
router.put('/:id/status', protect, authorize('LOAN_OFFICER', 'ADMIN'), updateStatus);

export default router;
