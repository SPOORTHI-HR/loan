import { useAuth } from '@/context/AuthContext';
import ApplicantDashboard from '@/components/ApplicantDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import LoanList from './LoanList';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
    const { user, logout } = useAuth();

    if (!user) return <div>Loading...</div>;

    const isLoanOfficer = user.role === 'LOAN_OFFICER';

    return (
        <div className={`min-h-screen ${isLoanOfficer ? 'bg-gray-900 text-white' : 'bg-background'}`}>
            <header className={`border-b ${isLoanOfficer ? 'border-gray-700 bg-gray-800' : ''}`}>
                <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                    <h1 className={`text-xl font-bold ${isLoanOfficer ? 'text-blue-400' : ''}`}>FinTech Platform</h1>
                    <div className="flex items-center gap-4">
                        <span className={`text-sm ${isLoanOfficer ? 'text-gray-300' : 'text-muted-foreground'}`}>
                            Logged in as {user.name} ({user.role})
                        </span>
                        <Button
                            variant={isLoanOfficer ? "secondary" : "outline"}
                            onClick={logout}
                            className={isLoanOfficer ? "bg-gray-700 text-white hover:bg-gray-600 border-gray-600" : ""}
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto py-6 px-4">
                {user.role === 'APPLICANT' ? (
                    <ApplicantDashboard />
                ) : isLoanOfficer ? (
                    <LoanList />
                ) : (
                    <AdminDashboard role={user.role} />
                )}
            </main>
        </div>
    );
}
