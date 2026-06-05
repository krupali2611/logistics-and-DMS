import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { permissions, user, roles, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Dashboard' },
    ...(permissions.includes('driver_view') ? [{ to: '/drivers', label: 'Drivers' }] : []),
    ...(permissions.includes('vehicle_view') ? [{ to: '/vehicles', label: 'Vehicles' }] : []),
    ...(permissions.includes('customer_view') ? [{ to: '/customers', label: 'Customers' }] : []),
    ...(permissions.includes('vehicle_assign') ? [{ to: '/vehicle-assignments', label: 'Assignments' }] : [])
  ];

  const getShortLabel = (label) => {
    const abbreviations = {
      Dashboard: 'Dash',
      Drivers: 'Drvs',
      Vehicles: 'Veh',
      Customers: 'Cust',
      Assignments: 'Asgn'
    };

    return abbreviations[label] || label;
  };

  const getUserName = () => {
    if (!user) {
      return 'Admin User';
    }

    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Admin User';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.topSection}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>LD</div>
          <div className={styles.brandCopy}>
            <h2>Logistics DMS</h2>
            <p>Admin Control Tower</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '>' : '<'}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            title={item.label}
          >
            <span className={styles.linkLabel}>{collapsed ? getShortLabel(item.label) : item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.userPanel}>
        <div className={styles.userMeta}>
          <div className={styles.userAvatar}>{getUserName().slice(0, 2).toUpperCase()}</div>
          <div className={styles.userText}>
            <strong>{getUserName()}</strong>
            <span>{roles[0] || 'Role Pending'}</span>
          </div>
        </div>

        <div className={styles.userActions}>
          <button type="button" onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
