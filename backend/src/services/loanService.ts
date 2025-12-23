import { prisma } from '../config/db';
import { calculateCreditScore } from './scoringService';

export const applyForLoan = async (userId: string, amount: number, tenureMonths: number, employmentType: string, annualIncome: number, monthlyExpenses: number) => {
    // 1. Check for active loans
    const activeLoans = await prisma.loan.findFirst({
        where: { userId, status: { in: ['APPLIED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE'] } }
    });

    if (activeLoans) {
        throw new Error('User already has an active or pending loan.');
    }

    // 2. Validate Rules
    // Rule 1: Loan amount <= 40% of annual income
    if (amount > (annualIncome * 0.40)) {
        throw new Error('Loan amount exceeds 40% of annual income limit.');
    }

    // Rule 2: EMI <= 30% of monthly income
    const interestRate = 10.0; // 10%
    const monthlyRate = interestRate / 12 / 100;
    // EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const monthlyIncome = annualIncome / 12;
    if (emi > (monthlyIncome * 0.30)) {
        throw new Error(`Estimated EMI (${emi.toFixed(2)}) exceeds 30% of monthly income.`);
    }

    // 3. Update Profile & Score
    let profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
        profile = await prisma.profile.create({
            data: { userId, employmentType, annualIncome, monthlyExpenses, creditScore: 300 }
        });
    } else {
        // Update existing profile with latest info
        await prisma.profile.update({
            where: { userId },
            data: { employmentType, annualIncome, monthlyExpenses }
        });
    }

    const score = await calculateCreditScore(userId, annualIncome, monthlyExpenses);
    await prisma.profile.update({ where: { userId }, data: { creditScore: score } });

    // 4. Create Loan
    // Auto-reject if score is too low (e.g. < 500) - Optional rule check
    const status = score < 500 ? 'REJECTED' : 'APPLIED';

    const loan = await prisma.loan.create({
        data: {
            userId,
            amount,
            tenureMonths,
            interestRate,
            monthlyEmi: emi,
            remainingAmount: amount, // simplify for now, total needed to pay is technically amount * terms...
            status
        }
    });

    return loan;
};

export const updateLoanStatus = async (loanId: string, status: any, officerId: string) => {
    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new Error('Loan not found');

    // Transition logic
    // APPLIED -> UNDER_REVIEW -> APPROVED/REJECTED -> ACTIVE -> CLOSED

    await prisma.loan.update({
        where: { id: loanId },
        data: { status }
    });

    // Log audit
    await prisma.auditLog.create({
        data: {
            userId: officerId,
            action: 'LOAN_STATUS_UPDATE',
            details: `Loan ${loanId} status changed to ${status}`
        }
    });

    return loan;
};
