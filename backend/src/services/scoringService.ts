import { prisma } from '../config/db';

export const calculateCreditScore = async (userId: string, annualIncome: number, monthlyExpenses: number): Promise<number> => {
    let score = 300; // Base score

    // 1. Income Factor
    // e.g. 1 point for every 1000 units, max 200
    const incomePoints = Math.min((annualIncome / 1000), 200);
    score += incomePoints;

    // 2. DTI Ratio
    const monthlyIncome = annualIncome / 12;
    // avoid division by zero
    const dti = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) : 1;

    if (dti < 0.30) score += 150;
    else if (dti < 0.50) score += 100;
    else score += 50;

    // 3. Credit History (Simulated by checking previous loans in system)
    const previousLoans = await prisma.loan.findMany({
        where: { userId, status: { in: ['CLOSED', 'ACTIVE'] } }
    });

    if (previousLoans.length > 0) {
        score += 50; // Bonus for having history
        const totalMissed = previousLoans.reduce((acc, loan) => acc + loan.missedEmis, 0);
        score -= (totalMissed * 50);
    } else {
        // New borrower, neutral/slight penalty or just no bonus
        score += 20;
    }

    // Cap score 300-900
    if (score > 900) score = 900;
    if (score < 300) score = 300;

    return Math.floor(score);
};
