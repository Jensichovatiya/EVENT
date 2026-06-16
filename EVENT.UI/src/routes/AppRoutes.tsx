import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import VerifyOtpPage from '../pages/VerifyOtpPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import EventListPage from '../pages/EventListPage';
import CreateEventPage from '../pages/CreateEventPage';
import EventDetailsPage from '../pages/EventDetailsPage';
import BookingListPage from '../pages/BookingListPage';
import InvoiceListPage from '../pages/InvoiceListPage';
import PaymentListPage from '../pages/PaymentListPage';
import ScannerPage from '../pages/ScannerPage';
import ReportPage from '../pages/ReportPage';
import CategoriesPage from '../pages/CategoriesPage';
import AssetsPage from '../pages/AssetsPage';
import SettingsPage from '../pages/SettingsPage';
import LogsPage from '../pages/LogsPage';
import ProfilePage from '../pages/ProfilePage';
import PassesPage from '../pages/PassesPage';
import BookingPassesPage from '../pages/BookingPassesPage';
import AttendancePage from '../pages/AttendancePage';
import Guard from './Guard';
import { ROUTES, ROLES } from '../constants/appConstants';
import AssetTypesPage from '../pages/AssetTypesPage';
import ScannerLogsPage from '../pages/ScannerLogsPage';
import EventApprovalPage from '../pages/EventApprovalPage';
import EmployeesPage from '../pages/EmployeesPage';
import EventSlotsPage from '../pages/EventSlotsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<SignUpPage />} />
      <Route path={ROUTES.VERIFY_OTP} element={<VerifyOtpPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <Guard>
            <DashboardPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.EVENTS}
        element={
          <Guard>
            <EventListPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.EVENT_CREATE}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ORGANIZER]}>
            <CreateEventPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.EVENT_EDIT}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ORGANIZER]}>
            <CreateEventPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.EVENT_DETAILS}
        element={
          <Guard>
            <EventDetailsPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.EVENT_SLOTS}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ORGANIZER]}>
            <EventSlotsPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.BOOKINGS}
        element={
          <Guard>
            <BookingListPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.PASSES}
        element={
          <Guard>
            <PassesPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.BOOKING_PASSES}
        element={
          <Guard>
            <BookingPassesPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.INVOICES}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ORGANIZER]}>
            <InvoiceListPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.PAYMENTS}
        element={
          <Guard>
            <PaymentListPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.SCANNER}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.EMPLOYEE, ROLES.SCANNER]} >
            <ScannerPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.ATTENDANCE}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.EMPLOYEE, ROLES.SCANNER]}>
            <AttendancePage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.REPORTS}
        element={
          <Guard>
            <ReportPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.CATEGORIES}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ORGANIZER]}>
            <CategoriesPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.ASSETS}
        element={
          <Guard>
            <AssetsPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <Guard>
            <SettingsPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.LOGS}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN]}>
            <LogsPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.PROFILE}
        element={
          <Guard>
            <ProfilePage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.EVENT_APPROVAL}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN]}>
            <EventApprovalPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.ASSET_TYPES}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN]}>
            <AssetTypesPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.SCANNER_LOGS}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN]}>
            <ScannerLogsPage />
          </Guard>
        }
      />
      <Route
        path={ROUTES.EMPLOYEES}
        element={
          <Guard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ORGANIZER]}>
            <EmployeesPage />
          </Guard>
        }
      />

      {/* Default Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

export default AppRoutes;
