import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const isAuthenticated = localStorage.getItem('admin_auth') === 'true';

    useEffect(() => {
        // Optional: You can add additional security checks here
        // For example, verify token expiration, validate with backend, etc.
    }, []);

    if (!isAuthenticated) {
        // Redirect to admin login if not authenticated
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};
