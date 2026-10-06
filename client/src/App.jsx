import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RescueMapPage from './pages/RescueMapPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/map" element={<RescueMapPage />} />

          {/* Donor Protected Routes */}
          <Route
            path="/donor"
            element={
              <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/donor/dashboard" element={<Navigate to="/donor" replace />} />

          {/* NGO Protected Routes */}
          <Route
            path="/ngo"
            element={
              <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                <NGODashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/ngo/dashboard" element={<Navigate to="/ngo" replace />} />

          {/* Volunteer Protected Routes */}
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/volunteer/dashboard" element={<Navigate to="/volunteer" replace />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;