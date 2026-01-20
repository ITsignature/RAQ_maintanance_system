import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/app/components/ui/sonner';
import { Login } from '@/app/pages/Login';
import { Layout } from '@/app/components/Layout';
import { Dashboard } from '@/app/pages/Dashboard';
import { CalendarPage } from '@/app/pages/CalendarPage';
import { BookingsList } from '@/app/pages/BookingsList';
import { BookingDetails } from '@/app/pages/BookingDetails';
import { BookingForm } from '@/app/pages/BookingForm';
import { EditBooking } from '@/app/pages/EditBooking';
import { CustomersPage } from '@/app/pages/CustomersPage';
import { CustomerForm } from '@/app/pages/CustomerForm';
import { CustomerDetails } from '@/app/pages/CustomerDetails';
import { EditCustomer } from '@/app/pages/EditCustomer';
import { PaymentsPage } from '@/app/pages/PaymentsPage';
import { ReportsPage } from '@/app/pages/ReportsPage';
import { SMSLogsPage } from '@/app/pages/SMSLogsPage';
import { SettingsPage } from '@/app/pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="bookings" element={<BookingsList />} />
        <Route path="bookings/new" element={<BookingForm />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
        <Route path="bookings/:id/edit" element={<EditBooking />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id/details" element={<CustomerDetails />} />
        <Route path="customers/:id/edit" element={<EditCustomer />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="sms-logs" element={<SMSLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
            <Toaster position="top-right" />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}