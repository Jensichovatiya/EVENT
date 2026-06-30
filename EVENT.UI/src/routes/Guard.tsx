import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ROUTES } from '../constants/appConstants';

interface GuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const Guard: React.FC<GuardProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

export default Guard;
