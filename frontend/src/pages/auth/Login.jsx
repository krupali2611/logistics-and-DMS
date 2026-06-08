import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from '../../styles/AuthPages.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const Login = () => {
  const [form, setForm] = useState({ email: 'admin@logistics.com', password: 'Admin@123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm(event.currentTarget)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authShell}>
      <section className={styles.heroPanel}>
        <span>Logistics DMS</span>
        <h1>Control dispatch, operations, and admin security from one clean command center.</h1>
        <p>Phase 1 includes enterprise-ready authentication, JWT refresh flow, RBAC, and a scalable admin foundation.</p>
      </section>

      <section className={styles.formPanel}>
        <form className={styles.formCard} onSubmit={handleSubmit} {...getFormValidationProps()}>
          <div>
            <h2>Admin Login</h2>
            <p>Use the seeded Super Admin credentials to access the dashboard.</p>
          </div>

          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />

          {error ? <div className={styles.errorBox}>{error}</div> : null}

          <Button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className={styles.links}>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Login;
