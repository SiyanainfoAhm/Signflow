import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Redirects trainer/office users to dashboard. Use for admin-only pages (forms, students, batches, trainers, assessments). */
export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isTrainerOrOffice = user?.role === 'trainer' || user?.role === 'office';
  if (isTrainerOrOffice) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}
