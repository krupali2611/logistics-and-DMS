import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import styles from '../styles/AdminLayout.module.css';

const getBreadcrumb = (pathname) => {
  if (pathname === '/') {
    return 'Dashboard';
  }

  const parts = pathname.split('/').filter(Boolean);
  return parts
    .map((part) =>
      part
        .split('-')
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(' ')
    )
    .join(' / ');
};

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <div className={styles.contentWrap}>
          <div className={styles.breadcrumbCard}>
            <span className={styles.breadcrumbLabel}>Breadcrumb</span>
            <h1>{getBreadcrumb(location.pathname)}</h1>
          </div>
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
