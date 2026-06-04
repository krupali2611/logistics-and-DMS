import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Dashboard.module.css';

const Dashboard = () => {
  const { user, roles } = useAuth();
  const currentTime = new Date().toLocaleString();

  return (
    <div className={styles.grid}>
      <section className={styles.heroCard}>
        <span>Welcome Back</span>
        <h2>{user ? `${user.first_name} ${user.last_name}` : 'Operations User'}</h2>
        <p>Role: {roles[0] || 'No role assigned'}</p>
      </section>

      <section className={styles.card}>
        <h3>Current Login Time</h3>
        <p>{user?.last_login ? new Date(user.last_login).toLocaleString() : currentTime}</p>
      </section>

      <section className={styles.card}>
        <h3>System Status</h3>
        <p>Backend auth, RBAC, and admin foundation are active.</p>
      </section>

      <section className={styles.card}>
        <h3>Phase Readiness</h3>
        <p>Ready to extend into Driver Management, Vehicle Management, and shipment operations.</p>
      </section>
    </div>
  );
};

export default Dashboard;
