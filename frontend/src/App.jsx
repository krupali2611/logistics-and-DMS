import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import CustomerProtectedRoute from './routes/CustomerProtectedRoute';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import DriverList from './pages/drivers/DriverList';
import DriverForm from './pages/drivers/DriverForm';
import DriverDetails from './pages/drivers/DriverDetails';
import DriverDocuments from './pages/drivers/DriverDocuments';
import VehicleList from './pages/vehicles/VehicleList';
import VehicleForm from './pages/vehicles/VehicleForm';
import VehicleDetails from './pages/vehicles/VehicleDetails';
import VehicleDocuments from './pages/vehicles/VehicleDocuments';
import VehicleTypeList from './pages/vehicles/VehicleTypeList';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetails from './pages/customers/CustomerDetails';
import CustomerAddresses from './pages/customers/CustomerAddresses';
import CustomerDocuments from './pages/customers/CustomerDocuments';
import CustomerNotes from './pages/customers/CustomerNotes';
import ShipmentList from './pages/shipments/ShipmentList';
import ShipmentForm from './pages/shipments/ShipmentForm';
import ShipmentDetails from './pages/shipments/ShipmentDetails';
import ShipmentTimelinePage from './pages/shipments/ShipmentTimelinePage';
import ShipmentAttachments from './pages/shipments/ShipmentAttachments';
import PricingRules from './pages/pricing/PricingRules';
import CustomerPortalLayout from './layouts/CustomerPortalLayout';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerForgotPassword from './pages/customer/CustomerForgotPassword';
import CustomerResetPassword from './pages/customer/CustomerResetPassword';
import CustomerOtpVerification from './pages/customer/CustomerOtpVerification';
import CustomerProfile from './pages/customer/CustomerProfile';
import { useCustomerAuth } from './context/CustomerAuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const CustomerPublicRoute = ({ children }) => {
  const { isAuthenticated } = useCustomerAuth();
  return isAuthenticated ? <Navigate to="/customer/profile" replace /> : children;
};

const CustomerEntryRoute = () => {
  const { isAuthenticated } = useCustomerAuth();
  return <Navigate to={isAuthenticated ? '/customer/profile' : '/customer/login'} replace />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/customer" element={<CustomerEntryRoute />} />
      <Route
        path="/customer/login"
        element={
          <CustomerPublicRoute>
            <CustomerLogin />
          </CustomerPublicRoute>
        }
      />
      <Route
        path="/customer/register"
        element={
          <CustomerPublicRoute>
            <CustomerRegister />
          </CustomerPublicRoute>
        }
      />
      <Route
        path="/customer/forgot-password"
        element={
          <CustomerPublicRoute>
            <CustomerForgotPassword />
          </CustomerPublicRoute>
        }
      />
      <Route
        path="/customer/reset-password"
        element={
          <CustomerPublicRoute>
            <CustomerResetPassword />
          </CustomerPublicRoute>
        }
      />
      <Route
        path="/customer/verify-otp"
        element={
          <CustomerPublicRoute>
            <CustomerOtpVerification />
          </CustomerPublicRoute>
        }
      />

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
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm mode="create" />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/customers/:id/edit" element={<CustomerForm mode="edit" />} />
          <Route path="/customers/:id/addresses" element={<CustomerAddresses />} />
          <Route path="/customers/:id/documents" element={<CustomerDocuments />} />
          <Route path="/customers/:id/notes" element={<CustomerNotes />} />
          <Route path="/shipments" element={<ShipmentList />} />
          <Route path="/shipments/new" element={<ShipmentForm mode="create" />} />
          <Route path="/shipments/:id" element={<ShipmentDetails />} />
          <Route path="/shipments/:id/edit" element={<ShipmentForm mode="edit" />} />
          <Route path="/shipments/:id/timeline" element={<ShipmentTimelinePage />} />
          <Route path="/shipments/:id/attachments" element={<ShipmentAttachments />} />
          <Route path="/pricing" element={<PricingRules />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<Navigate to="/profile" replace />} />
        </Route>
      </Route>

      <Route element={<CustomerProtectedRoute />}>
        <Route element={<CustomerPortalLayout />}>
          <Route path="/customer/profile" element={<CustomerProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
