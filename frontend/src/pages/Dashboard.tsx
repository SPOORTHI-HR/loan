import React from 'react';
import { useAuth } from '@/context/AuthContext';
import ApplicantDashboard from '@/components/ApplicantDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
    const { user, logout } = useAuth();

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                    <h1 className="text-xl font-bold">FinTech Platform</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Logged in as {user.name} ({user.role})</span>
                        <Button variant="outline" onClick={logout}>Logout</Button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto py-6 px-4">
                {user.role === 'APPLICANT' ? (
                    <ApplicantDashboard />
                ) : (
                    <AdminDashboard role={user.role} />
                )}
            </main>
        </div>
    );
}
