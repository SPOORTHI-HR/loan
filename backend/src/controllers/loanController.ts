import { Request, Response } from 'express';
import * as loanService from '../services/loanService';
import { prisma } from '../config/db';

interface AuthRequest extends Request {
    user?: any;
}

// Applicant Actions
export const apply = async (req: any, res: Response) => {
    try {
        const { amount, tenureMonths, employmentType, annualIncome, monthlyExpenses } = req.body;
        const loan = await loanService.applyForLoan(req.user.id, amount, tenureMonths, employmentType, annualIncome, monthlyExpenses);
        res.status(201).json(loan);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllLoans = async (req: Request, res: Response) => {
    try {
        const loans = await prisma.loan.findMany({ include: { user: { select: { name: true, email: true, profile: true } } } });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyLoans = async (req: any, res: Response) => {
    try {
        const loans = await prisma.loan.findMany({ where: { userId: req.user.id } });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateStatus = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const loan = await loanService.updateLoanStatus(id, status, req.user.id);
        res.json(loan);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// --- Officer Actions ---

// Helper for audit logs
const createAuditLog = async (loanId: string, officerId: string, action: string, oldStatus: string, newStatus: string, details?: string) => {
    await prisma.auditLog.create({
        data: {
            loanId,
            userId: officerId,
            action,
            oldStatus,
            newStatus,
            details
        }
    });
};

// Get all loans for officer (Applied & Under Review)
export const getOfficerLoans = async (req: AuthRequest, res: Response) => {
    try { // @ts-ignore
        const loans = await prisma.loan.findMany({
            where: {
                status: {
                    in: ['APPLIED', 'UNDER_REVIEW']
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        profile: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Get single loan details
export const getLoanById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const loan = await prisma.loan.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                auditLogs: {
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        res.json(loan);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Review Loan (Applied -> Under Review)
export const reviewLoan = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const officerId = req.user.id;

    try {
        const loan = await prisma.loan.findUnique({ where: { id } });

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        if (loan.status !== 'APPLIED') {
            return res.status(400).json({ message: 'Loan must be APPLIED to move to UNDER REVIEW' });
        }

        const updatedLoan = await prisma.loan.update({
            where: { id },
            data: { status: 'UNDER_REVIEW' }
        });

        await createAuditLog(id, officerId, 'REVIEW_STARTED', 'APPLIED', 'UNDER_REVIEW');

        res.json(updatedLoan);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Approve Loan (Under Review -> Approved)
export const approveLoan = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const officerId = req.user.id;

    try {
        const loan = await prisma.loan.findUnique({
            where: { id },
            include: { user: { include: { profile: true } } }
        });

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        if (loan.status !== 'UNDER_REVIEW') {
            return res.status(400).json({ message: 'Loan must be UNDER REVIEW to be APPROVED' });
        }

        // Validation Logic
        const profile = loan.user.profile;
        if (!profile) {
            return res.status(400).json({ message: 'User profile incomplete' });
        }

        // 1. Credit Score >= 600
        if (profile.creditScore < 600) {
            return res.status(400).json({ message: 'Credit Score too low (< 600)' });
        }

        // 2. EMI <= 30% of Monthly Income (using annualIncome / 12)
        const monthlyIncome = profile.annualIncome / 12;
        const maxEmi = 0.30 * monthlyIncome;

        if (loan.monthlyEmi > maxEmi) {
            return res.status(400).json({
                message: `EMI (${loan.monthlyEmi}) exceeds 30% of monthly income (${maxEmi.toFixed(2)})`
            });
        }

        const updatedLoan = await prisma.loan.update({
            where: { id },
            data: {
                status: 'APPROVED',
                startDate: new Date()
            }
        });

        await createAuditLog(id, officerId, 'LOAN_APPROVED', 'UNDER_REVIEW', 'APPROVED');

        res.json(updatedLoan);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Reject Loan (Under Review -> Rejected)
export const rejectLoan = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const officerId = req.user.id;
    const { reason } = req.body;

    try {
        const loan = await prisma.loan.findUnique({ where: { id } });

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        if (loan.status !== 'UNDER_REVIEW') {
            return res.status(400).json({ message: 'Loan must be UNDER REVIEW to be REJECTED' });
        }

        const updatedLoan = await prisma.loan.update({
            where: { id },
            data: { status: 'REJECTED' }
        });

        await createAuditLog(id, officerId, 'LOAN_REJECTED', 'UNDER_REVIEW', 'REJECTED', reason || 'No reason provided');

        res.json(updatedLoan);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
