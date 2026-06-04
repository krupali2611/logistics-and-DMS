import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const [open, setOpen] = useState(false);
  const { user, roles, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div>
        <span className={styles.label}>Operations Panel</span>
        <h2>Logistics & Delivery Management System</h2>
      </div>

      <div className={styles.profileWrap}>
        <button type="button" className={styles.profileButton} onClick={() => setOpen((value) => !value)}>
          <div>
            <strong>{user ? `${user.first_name} ${user.last_name}` : 'Admin User'}</strong>
            <span>{roles[0] || 'Role Pending'}</span>
          </div>
        </button>

        {open && (
          <div className={styles.dropdown}>
            <button type="button" onClick={() => navigate('/profile')}>
              Profile
            </button>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
