import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { permissions } = useAuth();
  const navItems = [
    { to: '/', label: 'Dashboard' },
    ...(permissions.includes('driver_view') ? [{ to: '/drivers', label: 'Drivers' }] : []),
    ...(permissions.includes('vehicle_view') ? [{ to: '/vehicles', label: 'Vehicles' }] : []),
    ...(permissions.includes('customer_view') ? [{ to: '/customers', label: 'Customers' }] : []),
    ...(permissions.includes('vehicle_assign')
      ? [{ to: '/vehicle-assignments', label: 'Assignments' }]
      : []),
    { to: '/profile', label: 'Profile' },
    { to: '/change-password', label: 'Change Password' }
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>LD</div>
        <div>
          <h2>Logistics DMS</h2>
          <p>Admin Control Tower</p>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footerCard}>
        <span>Phase 4 Active</span>
        <p>Customer master records now sit alongside fleet operations to prepare bookings, pricing, billing, and reporting.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
