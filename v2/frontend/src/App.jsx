import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Forbidden } from './pages/Forbidden';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDirectory } from './pages/UserDirectory';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { DispatcherDashboard } from './pages/DispatcherDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { Reports } from './pages/Reports';

// HTML Form Viewer (Renders pre-built HTML forms with Find / New modes)
import { HtmlViewer } from './components/HtmlViewer';
import { BulkOrderUpload } from './pages/forms/BulkOrderUpload';

// Table Explorers
import { OrdersExplorer } from './pages/tables/OrdersExplorer';
import { CustomersExplorer } from './pages/tables/CustomersExplorer';
import { DriversExplorer } from './pages/tables/DriversExplorer';
import { VehiclesExplorer } from './pages/tables/VehiclesExplorer';
import { TripsExplorer } from './pages/tables/TripsExplorer';

// Smart root redirect based on current authenticated role
const RoleHome = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    case 'MANAGER':
      return <Navigate to="/manager" replace />;
    case 'DISPATCHER':
      return <Navigate to="/dispatcher" replace />;
    case 'DRIVER':
      return <Navigate to="/driver" replace />;
    case 'CUSTOMER':
      return <Navigate to="/customer" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<Forbidden />} />

          {/* Protected Shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleHome />} />

            {/* Dashboards */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserDirectory />
                </ProtectedRoute>
              }
            />
            <Route
              path="manager"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="dispatcher"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DISPATCHER']}>
                  <DispatcherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="driver"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER']}>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="customer"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* HTML Forms with Find / New Mode Routing */}
            <Route
              path="forms/order"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DISPATCHER']}>
                  <HtmlViewer formFile="dispatch-order.html" />
                </ProtectedRoute>
              }
            />
            <Route
              path="forms/dispatch"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DISPATCHER']}>
                  <HtmlViewer formFile="dispatch-assignment.html" />
                </ProtectedRoute>
              }
            />
            <Route
              path="forms/customer"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <HtmlViewer formFile="customer.html" />
                </ProtectedRoute>
              }
            />
            <Route
              path="forms/driver"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <HtmlViewer formFile="driver.html" />
                </ProtectedRoute>
              }
            />
            <Route
              path="forms/vehicle"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <HtmlViewer formFile="vehicle.html" />
                </ProtectedRoute>
              }
            />
            <Route
              path="forms/bulk-orders"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DISPATCHER']}>
                  <BulkOrderUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="forms/:formName"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DISPATCHER']}>
                  <HtmlViewer />
                </ProtectedRoute>
              }
            />

            {/* Table Explorers */}
            <Route
              path="tables/orders"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DISPATCHER']}>
                  <OrdersExplorer />
                </ProtectedRoute>
              }
            />
            <Route
              path="tables/customers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <CustomersExplorer />
                </ProtectedRoute>
              }
            />
            <Route
              path="tables/drivers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DISPATCHER']}>
                  <DriversExplorer />
                </ProtectedRoute>
              }
            />
            <Route
              path="tables/vehicles"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <VehiclesExplorer />
                </ProtectedRoute>
              }
            />
            <Route
              path="tables/trips"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER']}>
                  <TripsExplorer />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
