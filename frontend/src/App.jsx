import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ScrollToTop from './components/common/ScrollToTop';

import Home from './pages/Home';
import Cars from './pages/Cars';
import CarDetail from './pages/CarDetail';
import BookingFlow from './pages/BookingFlow';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import RentalPolicy from './pages/RentalPolicy';
import CategoryDetail from './pages/CategoryDetail';
import LocationDetail from './pages/LocationDetail';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';

import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyBookings from './pages/customer/MyBookings';
import BookingDetail from './pages/customer/BookingDetail';
import ContractSign from './pages/customer/ContractSign';
import CustomerDocuments from './pages/customer/CustomerDocuments';

import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center text-slate-500 font-semibold">Verifying session...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role?.name || user.role || user.roleName || 'CUSTOMER';

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <NotificationProvider>
          <Routes>
                {/* Public Marketplace Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/cars" element={<Cars />} />
                <Route path="/cars/:id" element={<CarDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/rental-policy" element={<RentalPolicy />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />

                {/* Reservation Stepper */}
                <Route path="/booking" element={<BookingFlow />} />

                {/* Customer Portal */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/bookings"
                  element={
                    <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/bookings/:id"
                  element={
                    <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                      <BookingDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/contracts/:id"
                  element={
                    <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                      <ContractSign />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/documents"
                  element={
                    <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                      <CustomerDocuments />
                    </ProtectedRoute>
                  }
                />

                {/* Operational Staff Portal */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Management Portal */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register" element={<AdminRegister />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="/categories/:slug" element={<CategoryDetail />} />
                <Route path="/locations/:slug" element={<LocationDetail />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
