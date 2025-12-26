import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div>Loading...</div>;
    return user ? <>{children}</> : <Navigate to="/login" />;
}

import LoanList from './pages/LoanList';
import LoanDetail from './pages/LoanDetail';

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/officer/loans" element={
                        <PrivateRoute>
                            <LoanList />
                        </PrivateRoute>
                    } />
                    <Route path="/officer/loan/:id" element={
                        <PrivateRoute>
                            <LoanDetail />
                        </PrivateRoute>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
}
