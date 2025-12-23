import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalLoans = await prisma.loan.count();
        const approved = await prisma.loan.count({ where: { status: 'APPROVED' } });
        const rejected = await prisma.loan.count({ where: { status: 'REJECTED' } });
        const defaulted = await prisma.loan.count({ where: { status: 'DEFAULTED' } });
        const active = await prisma.loan.count({ where: { status: 'ACTIVE' } });

        const avgScore = await prisma.profile.aggregate({
            _avg: { creditScore: true }
        });

        const outstanding = await prisma.loan.aggregate({
            where: { status: 'ACTIVE' },
            _sum: { remainingAmount: true }
        });

        res.json({
            totalLoans,
            approvalRate: totalLoans > 0 ? (approved / totalLoans) * 100 : 0,
            rejectionRate: totalLoans > 0 ? (rejected / totalLoans) * 100 : 0,
            defaultRate: totalLoans > 0 ? (defaulted / totalLoans) * 100 : 0,
            avgCreditScore: avgScore._avg.creditScore || 0,
            totalOutstanding: outstanding._sum.remainingAmount || 0,
            breakdown: {
                active, approved, rejected, defaulted
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
