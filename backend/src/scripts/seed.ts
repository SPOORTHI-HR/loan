import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Clean up
    await prisma.repayment.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Users
    const users = [
        { name: 'Admin User', email: 'admin@fintech.com', role: 'ADMIN' },
        { name: 'Loan Officer', email: 'officer@fintech.com', role: 'LOAN_OFFICER' },
        { name: 'Risk Analyst', email: 'analyst@fintech.com', role: 'RISK_ANALYST' },
        { name: 'Alice Applicant', email: 'alice@test.com', role: 'APPLICANT' },
        { name: 'Bob Applicant', email: 'bob@test.com', role: 'APPLICANT' },
        { name: 'Charlie Applicant', email: 'charlie@test.com', role: 'APPLICANT' },
    ];

    for (const u of users) {
        await prisma.user.create({
            data: {
                name: u.name,
                email: u.email,
                password,
                role: u.role
            }
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
