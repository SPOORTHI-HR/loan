import { Request, Response } from 'express';
import * as loanService from '../services/loanService';
import { prisma } from '../config/db';

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
