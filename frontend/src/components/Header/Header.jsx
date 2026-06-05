import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div>
        <span className={styles.label}>Operations Panel</span>
        <h2>Logistics & Delivery Management System</h2>
      </div>
    </header>
  );
};

export default Header;
