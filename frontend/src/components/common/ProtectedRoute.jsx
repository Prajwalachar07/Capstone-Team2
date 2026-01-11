import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loader />;
    }

    if (!user) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Role not authorized, redirect to home or unauthorized page
        // Or redirect to their own dashboard
        const dashboardPath = user.role === 'loan_provider' ? '/loan/dashboard' : `/${user.role}/dashboard`;
        return <Navigate to={dashboardPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
