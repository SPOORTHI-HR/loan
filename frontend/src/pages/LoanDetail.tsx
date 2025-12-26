
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { officerApi } from '../lib/api';

interface LoanDetail {
    id: string;
    amount: number;
    tenureMonths: number;
    status: string;
    monthlyEmi: number;
    user: {
        name: string;
        email: string;
        profile: {
            annualIncome: number;
            creditScore: number;
            employmentType: string;
        };
    };
    auditLogs: any[];
}

const LoanDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loan, setLoan] = useState<LoanDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) loadLoan(id);
    }, [id]);

    const loadLoan = async (loanId: string) => {
        try {
            const data = await officerApi.getLoanById(loanId);
            setLoan(data);
        } catch (err) {
            setError('Failed to load loan details');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'review' | 'approve' | 'reject') => {
        if (!loan) return;
        setActionLoading(true);
        setError(null);
        try {
            if (action === 'review') {
                await officerApi.reviewLoan(loan.id);
            } else if (action === 'approve') {
                await officerApi.approveLoan(loan.id);
            } else if (action === 'reject') {
                const reason = prompt("Enter rejection reason:");
                if (reason === null) {
                    setActionLoading(false);
                    return; // Cancelled
                }
                await officerApi.rejectLoan(loan.id, reason);
            }
            // Reload to update status
            await loadLoan(loan.id);
            alert(`Loan ${action}ed successfully!`);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || `Failed to ${action} loan`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="text-white p-8">Loading...</div>;
    if (!loan) return <div className="text-white p-8">Loan not found</div>;

    const { user, amount, monthlyEmi } = loan;
    const { profile } = user;
    const monthlyIncome = profile.annualIncome / 12;
    const debtRatio = (monthlyEmi / monthlyIncome) * 100;
    const isHighRisk = debtRatio > 30 || profile.creditScore < 600;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <button onClick={() => navigate('/officer/loans')} className="text-blue-400 mb-4 hover:underline">&larr; Back to List</button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Applicant Info */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-blue-300">Applicant Details</h2>
                    <div className="space-y-2">
                        <p><span className="text-gray-400">Name:</span> {user.name}</p>
                        <p><span className="text-gray-400">Email:</span> {user.email}</p>
                        <p><span className="text-gray-400">Employment:</span> {profile.employmentType}</p>
                        <p><span className="text-gray-400">Annual Income:</span> ${profile.annualIncome.toLocaleString()}</p>
                        <p><span className="text-gray-400">Credit Score:</span> <span className={profile.creditScore >= 600 ? 'text-green-400' : 'text-red-400'}>{profile.creditScore}</span></p>
                    </div>
                </div>

                {/* Loan Info */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-blue-300">Loan Details</h2>
                    <div className="space-y-2">
                        <p><span className="text-gray-400">Amount:</span> ${amount.toLocaleString()}</p>
                        <p><span className="text-gray-400">Tenure:</span> {loan.tenureMonths} Months</p>
                        <p><span className="text-gray-400">EMI:</span> ${monthlyEmi.toFixed(2)}</p>
                        <p><span className="text-gray-400">Debt-to-Income:</span> <span className={debtRatio > 30 ? 'text-red-400' : 'text-green-400'}>{debtRatio.toFixed(1)}%</span></p>
                        <p><span className="text-gray-400">Status:</span> <span className="font-bold">{loan.status}</span></p>
                    </div>
                </div>
            </div>

            {/* Risk Assessment */}
            <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-yellow-300">Risk Assessment</h2>
                <div className="flex gap-4 items-center">
                    <div className={`px-4 py-2 rounded font-bold ${isHighRisk ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        Risk Level: {isHighRisk ? 'HIGH' : 'LOW'}
                    </div>
                    {isHighRisk && <p className="text-red-400 text-sm">Approving this loan may be risky due to high Debt Ratio or Low Credit Score.</p>}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4 items-start">
                {error && <div className="bg-red-500 text-white px-4 py-2 rounded mb-4">{error}</div>}

                {loan.status === 'APPLIED' && (
                    <button
                        onClick={() => handleAction('review')}
                        disabled={actionLoading}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-3 rounded shadow transition font-bold"
                    >
                        Start Review
                    </button>
                )}

                {loan.status === 'UNDER_REVIEW' && (
                    <>
                        <button
                            onClick={() => handleAction('approve')}
                            disabled={actionLoading || isHighRisk}
                            className={`px-6 py-3 rounded shadow transition font-bold text-white ${isHighRisk ? 'bg-green-800 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-500'}`}
                            title={isHighRisk ? "Risk too high to approve" : "Approve Loan"}
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => handleAction('reject')}
                            disabled={actionLoading}
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded shadow transition font-bold"
                        >
                            Reject
                        </button>
                    </>
                )}
            </div>

            {/* Audit Log */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-400 mb-2">History</h3>
                <ul className="space-y-2">
                    {loan.auditLogs.map((log: any) => (
                        <li key={log.id} className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}: {log.action} ({log.oldStatus} &rarr; {log.newStatus})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LoanDetail;
