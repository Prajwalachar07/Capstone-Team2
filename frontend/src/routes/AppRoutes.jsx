import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/main/Home';
import Login from '../pages/main/Login';
import Register from '../pages/main/Register';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import CompleteProfile from '../pages/patient/CompleteProfile';
import ShareProfile from '../pages/patient/ShareProfile';
import ViewProfile from '../pages/patient/ViewProfile';
import ViewSharedProfile from '../pages/patient/ViewSharedProfile';

// Practitioner Pages
import PractitionerDashboard from '../pages/practitioner/PractitionerDashboard';
import PractitionerPatientView from '../pages/practitioner/PatientProfileView';

// Organisation Pages
import OrganisationDashboard from '../pages/organisation/OrganisationDashboard';
import OrganisationPatientView from '../pages/organisation/PatientProfileView';

// Loan Pages
import PatientLoanDashboard from '../pages/loan/patientloandashboard';
import LoanApplyForm from '../pages/loan/LoanApplyForm';
import LoanAdminDashboard from '../pages/loan/LoanAdminDashboard';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Patient Routes */}
                <Route
                    path="/patient/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/complete-profile"
                    element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <CompleteProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/share-profile"
                    element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <ShareProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/view-profile"
                    element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <ViewProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/loan-dashboard/:loanId"
                    element={
                        <ProtectedRoute allowedRoles={['patient', 'loan_provider']}>
                            <PatientLoanDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/apply-loan"
                    element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <LoanApplyForm />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Doctor Routes */}
                <Route
                    path="/doctor/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <PractitionerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/doctor/patient/:id"
                    element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <PractitionerPatientView />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Hospital Routes */}
                <Route
                    path="/hospital/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['hospital']}>
                            <OrganisationDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hospital/patient/:id"
                    element={
                        <ProtectedRoute allowedRoles={['hospital']}>
                            <OrganisationPatientView />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/patient/shared/:id"
                    element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <ViewSharedProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/loan/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['loan_provider']}>
                            <LoanAdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Catch all - 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
