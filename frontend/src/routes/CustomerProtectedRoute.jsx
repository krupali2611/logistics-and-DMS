import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../components/Loader/Loader';
import { useCustomerAuth } from '../context/CustomerAuthContext';

const CustomerProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen label="Loading customer session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/customer/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default CustomerProtectedRoute;
