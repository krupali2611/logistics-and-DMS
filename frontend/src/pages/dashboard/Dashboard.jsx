import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDriverDashboardStats } from '../../api/driverApi';
import { getVehicleDashboardStats } from '../../api/vehicleApi';
import { getCustomerDashboardStats } from '../../api/customerApi';
import styles from '../../styles/Dashboard.module.css';

const Dashboard = () => {
  const { user, roles, permissions } = useAuth();
  const currentTime = new Date().toLocaleString();
  const [stats, setStats] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    onlineDrivers: 0,
    pendingVerification: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    verifiedVehicles: 0,
    availableVehicles: 0,
    assignedVehicles: 0,
    totalCustomers: 0,
    verifiedCustomers: 0,
    businessCustomers: 0,
    activeCustomers: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [driverStats, vehicleStats, customerStats] = await Promise.all([
          permissions.includes('driver_view')
            ? getDriverDashboardStats()
            : Promise.resolve({
                totalDrivers: 0,
                activeDrivers: 0,
                onlineDrivers: 0,
                pendingVerification: 0
              }),
          permissions.includes('vehicle_view')
            ? getVehicleDashboardStats()
            : Promise.resolve({
                totalVehicles: 0,
                activeVehicles: 0,
                verifiedVehicles: 0,
                availableVehicles: 0,
                assignedVehicles: 0
              }),
          permissions.includes('customer_view')
            ? getCustomerDashboardStats()
            : Promise.resolve({
                totalCustomers: 0,
                verifiedCustomers: 0,
                businessCustomers: 0,
                activeCustomers: 0
              })
        ]);
        setStats({
          ...driverStats,
          ...vehicleStats,
          ...customerStats
        });
      } catch (error) {
        setStats({
          totalDrivers: 0,
          activeDrivers: 0,
          onlineDrivers: 0,
          pendingVerification: 0,
          totalVehicles: 0,
          activeVehicles: 0,
          verifiedVehicles: 0,
          availableVehicles: 0,
          assignedVehicles: 0,
          totalCustomers: 0,
          verifiedCustomers: 0,
          businessCustomers: 0,
          activeCustomers: 0
        });
      }
    };

    loadStats();
  }, [permissions]);

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
        <h3>Total Drivers</h3>
        <p>{stats.totalDrivers}</p>
      </section>

      <section className={styles.card}>
        <h3>Active Drivers</h3>
        <p>{stats.activeDrivers}</p>
      </section>

      <section className={styles.card}>
        <h3>Online Drivers</h3>
        <p>{stats.onlineDrivers}</p>
      </section>

      <section className={styles.card}>
        <h3>Pending Verification</h3>
        <p>{stats.pendingVerification}</p>
      </section>

      <section className={styles.card}>
        <h3>Total Vehicles</h3>
        <p>{stats.totalVehicles}</p>
      </section>

      <section className={styles.card}>
        <h3>Active Vehicles</h3>
        <p>{stats.activeVehicles}</p>
      </section>

      <section className={styles.card}>
        <h3>Verified Vehicles</h3>
        <p>{stats.verifiedVehicles}</p>
      </section>

      <section className={styles.card}>
        <h3>Available Vehicles</h3>
        <p>{stats.availableVehicles}</p>
      </section>

      <section className={styles.card}>
        <h3>Assigned Vehicles</h3>
        <p>{stats.assignedVehicles}</p>
      </section>

      <section className={styles.card}>
        <h3>Total Customers</h3>
        <p>{stats.totalCustomers}</p>
      </section>

      <section className={styles.card}>
        <h3>Verified Customers</h3>
        <p>{stats.verifiedCustomers}</p>
      </section>

      <section className={styles.card}>
        <h3>Business Customers</h3>
        <p>{stats.businessCustomers}</p>
      </section>

      <section className={styles.card}>
        <h3>Active Customers</h3>
        <p>{stats.activeCustomers}</p>
      </section>
    </div>
  );
};

export default Dashboard;
