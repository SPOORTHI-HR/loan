import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ApplicantDashboard() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [showApply, setShowApply] = useState(false);

    // Form State
    const [amount, setAmount] = useState(1000);
    const [tenure, setTenure] = useState(12);
    const [income, setIncome] = useState(30000);
    const [expenses, setExpenses] = useState(1000);
    const [empType, setEmpType] = useState('Salaried');
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchLoans = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/loans/my', { headers });
            setLoans(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:3000/api/loans/apply', {
                amount: Number(amount),
                tenureMonths: Number(tenure),
                employmentType: empType,
                annualIncome: Number(income),
                monthlyExpenses: Number(expenses)
            }, { headers });
            setShowApply(false);
            fetchLoans();
            alert('Application Submitted!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error applying');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">My Loans</h2>
                <Button onClick={() => setShowApply(!showApply)}>{showApply ? 'Cancel' : 'Apply for Loan'}</Button>
            </div>

            {showApply && (
                <Card>
                    <CardHeader><CardTitle>New Application</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleApply} className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Amount</Label><Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} /></div>
                                <div className="space-y-2"><Label>Tenure (Months)</Label><Input type="number" value={tenure} onChange={e => setTenure(Number(e.target.value))} /></div>
                                <div className="space-y-2"><Label>Annual Income</Label><Input type="number" value={income} onChange={e => setIncome(Number(e.target.value))} /></div>
                                <div className="space-y-2"><Label>Monthly Expenses</Label><Input type="number" value={expenses} onChange={e => setExpenses(Number(e.target.value))} /></div>
                                <div className="space-y-2"><Label>Employment</Label><Input value={empType} onChange={e => setEmpType(e.target.value)} /></div>
                            </div>
                            <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loans.map(loan => (
                    <Card key={loan.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                            <CardTitle>${loan.amount}</CardTitle>
                            <p className="text-sm text-muted-foreground">{loan.status}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-1">
                                <p>Tenure: {loan.tenureMonths} months</p>
                                <p>EMI: ${loan.monthlyEmi.toFixed(2)}</p>
                                <p>Missed EMIs: {loan.missedEmis}</p>
                                <p>Remaining: ${loan.remainingAmount.toFixed(2)}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
