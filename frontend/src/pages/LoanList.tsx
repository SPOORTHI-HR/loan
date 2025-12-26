
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { officerApi } from '../lib/api';

interface Loan {
    id: string;
    amount: number;
    status: string;
    user: {
        name: string;
        email: string;
        profile: {
            creditScore: number;
        } | null;
    };
    createdAt: string;
}

const LoanList: React.FC = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            const data = await officerApi.getLoans();
            setLoans(data);
        } catch (error) {
            console.error('Failed to load loans', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <span className="px-2 py-1 rounded text-xs bg-green-500 text-white">Approved</span>;
            case 'REJECTED': return <span className="px-2 py-1 rounded text-xs bg-red-500 text-white">Rejected</span>;
            case 'UNDER_REVIEW': return <span className="px-2 py-1 rounded text-xs bg-yellow-500 text-white">Under Review</span>;
            default: return <span className="px-2 py-1 rounded text-xs bg-gray-500 text-white">{status}</span>;
        }
    };

    if (loading) return <div className="text-white p-8">Loading...</div>;

    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold mb-6 text-blue-400">Loan Applications</h1>
            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-700 text-gray-300 border-b border-gray-600">
                            <th className="p-4">Applicant</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Credit Score</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.map(loan => (
                            <tr key={loan.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                                <td className="p-4">
                                    <div className="font-semibold">{loan.user.name}</div>
                                    <div className="text-sm text-gray-400">{loan.user.email}</div>
                                </td>
                                <td className="p-4">${loan.amount.toFixed(2)}</td>
                                <td className="p-4">
                                    {loan.user.profile ? (
                                        <span className={loan.user.profile.creditScore >= 600 ? 'text-green-400' : 'text-red-400'}>
                                            {loan.user.profile.creditScore}
                                        </span>
                                    ) : 'N/A'}
                                </td>
                                <td className="p-4">{getStatusBadge(loan.status)}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => navigate(`/officer/loan/${loan.id}`)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow transition"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {loans.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">No applications found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoanList;
