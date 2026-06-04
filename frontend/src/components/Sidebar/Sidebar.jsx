import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/profile', label: 'Profile' },
  { to: '/change-password', label: 'Change Password' }
];

const Sidebar = () => {
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
        <span>Phase 1 Ready</span>
        <p>Authentication, RBAC, and admin foundation completed for future delivery modules.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
