import { NavLink, Outlet } from 'react-router-dom';
import Button from '../components/Button/Button';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import styles from '../styles/CustomerPortal.module.css';

const CustomerPortalLayout = () => {
  const { customer, user, logout } = useCustomerAuth();

  return (
    <div className={styles.portalShell}>
      <header className={styles.portalHeader}>
        <div>
          <span className={styles.kicker}>Customer Portal</span>
          <h1>{customer?.company_name || 'Logistics Account'}</h1>
          <p>
            Manage your booking profile and stay ready for shipment creation and live tracking.
          </p>
        </div>

        <div className={styles.profileBadge}>
          <strong>{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Customer User'}</strong>
          <span>{user?.email}</span>
          <Button onClick={logout}>Logout</Button>
        </div>
      </header>

      <nav className={styles.portalNav}>
        <NavLink
          to="/customer/profile"
          className={({ isActive }) => (isActive ? styles.activeNavLink : styles.navLink)}
        >
          Profile
        </NavLink>
      </nav>

      <main className={styles.portalMain}>
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerPortalLayout;
