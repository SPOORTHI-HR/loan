
import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
    getOfficerLoans,
    getLoanById,
    reviewLoan,
    approveLoan,
    rejectLoan
} from '../controllers/loanController';

const router = express.Router();

// protect: Ensures user is logged in
// authorize('LOAN_OFFICER'): Ensures user has the correct role

router.get('/loans', protect, authorize('LOAN_OFFICER'), getOfficerLoans);
router.get('/loan/:id', protect, authorize('LOAN_OFFICER'), getLoanById);
router.post('/loan/:id/review', protect, authorize('LOAN_OFFICER'), reviewLoan);
router.post('/loan/:id/approve', protect, authorize('LOAN_OFFICER'), approveLoan);
router.post('/loan/:id/reject', protect, authorize('LOAN_OFFICER'), rejectLoan);

export default router;
