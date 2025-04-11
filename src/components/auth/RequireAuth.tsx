
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RequireAuth: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // You could return a loading spinner here
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // Redirect to the auth page if user is not logged in
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated, render the protected outlet
  return <Outlet />;
};

export default RequireAuth;
