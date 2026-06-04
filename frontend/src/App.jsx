import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import ChangePassword from './pages/profile/ChangePassword';
import DriverList from './pages/drivers/DriverList';
import DriverForm from './pages/drivers/DriverForm';
import DriverDetails from './pages/drivers/DriverDetails';
import DriverDocuments from './pages/drivers/DriverDocuments';
import VehicleList from './pages/vehicles/VehicleList';
import VehicleForm from './pages/vehicles/VehicleForm';
import VehicleDetails from './pages/vehicles/VehicleDetails';
import VehicleDocuments from './pages/vehicles/VehicleDocuments';
import VehicleAssignments from './pages/vehicles/VehicleAssignments';
import VehicleTypeList from './pages/vehicles/VehicleTypeList';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetails from './pages/customers/CustomerDetails';
import CustomerAddresses from './pages/customers/CustomerAddresses';
import CustomerDocuments from './pages/customers/CustomerDocuments';
import CustomerNotes from './pages/customers/CustomerNotes';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/drivers" element={<DriverList />} />
          <Route path="/drivers/new" element={<DriverForm mode="create" />} />
          <Route path="/drivers/:id" element={<DriverDetails />} />
          <Route path="/drivers/:id/edit" element={<DriverForm mode="edit" />} />
          <Route path="/drivers/:id/documents" element={<DriverDocuments />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/vehicles/new" element={<VehicleForm mode="create" />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          <Route path="/vehicles/:id/edit" element={<VehicleForm mode="edit" />} />
          <Route path="/vehicles/:id/documents" element={<VehicleDocuments />} />
          <Route path="/vehicles/types" element={<VehicleTypeList />} />
          <Route path="/vehicle-assignments" element={<VehicleAssignments />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm mode="create" />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/customers/:id/edit" element={<CustomerForm mode="edit" />} />
          <Route path="/customers/:id/addresses" element={<CustomerAddresses />} />
          <Route path="/customers/:id/documents" element={<CustomerDocuments />} />
          <Route path="/customers/:id/notes" element={<CustomerNotes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
