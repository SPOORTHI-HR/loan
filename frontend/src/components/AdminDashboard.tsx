import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AnalyticsData, Loan } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

export default function AdminDashboard({ role }: { role: string }) {
    const [stats, setStats] = useState<AnalyticsData | null>(null);
    const [loans, setLoans] = useState<Loan[]>([]);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, loansRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/analytics', { headers }),
                    axios.get('http://localhost:3000/api/loans', { headers })
                ]);
                setStats(statsRes.data);
                setLoans(loansRes.data);
            } catch (e) { console.error(e); }
        };
        fetchData();
    }, []);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await axios.put(`http://localhost:3000/api/loans/${id}/status`, { status }, { headers });
            // Refresh
            const { data } = await axios.get('http://localhost:3000/api/loans', { headers });
            setLoans(data);
        } catch (e) { alert('Update failed'); }
    };

    const chartData = stats ? [
        { name: 'Approved', value: stats.breakdown.approved },
        { name: 'Rejected', value: stats.breakdown.rejected },
        { name: 'Active', value: stats.breakdown.active },
        { name: 'Defaulted', value: stats.breakdown.defaulted },
    ] : [];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>

            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card><CardHeader><CardTitle className="text-sm font-medium">Total Loans</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalLoans}</div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm font-medium">Approval Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm font-medium">Avg Credit Score</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Math.round(stats.avgCreditScore)}</div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm font-medium">Outstanding</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${stats.totalOutstanding.toLocaleString()}</div></CardContent></Card>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Loan Status Distribution</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 overflow-auto h-[400px]">
                    <CardHeader><CardTitle>Recent Applications</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loans.map(loan => (
                                <div key={loan.id} className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="font-medium">{loan.user?.name} (${loan.amount})</p>
                                        <p className="text-sm text-muted-foreground">{loan.status} - Score: {loan.user?.profile?.creditScore || 'N/A'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {loan.status === 'APPLIED' || loan.status === 'UNDER_REVIEW' ? (
                                            <>
                                                <Button size="sm" onClick={() => handleStatusUpdate(loan.id, 'APPROVED')}>Approve</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(loan.id, 'REJECTED')}>Reject</Button>
                                            </>
                                        ) : (
                                            <span className="text-sm font-bold">{loan.status}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
