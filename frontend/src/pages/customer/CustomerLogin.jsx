import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import styles from '../../styles/CustomerAuthPortal.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const CustomerLogin = () => {
  const { isAuthenticated, login } = useCustomerAuth();
  const [form, setForm] = useState({
    identifier: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/customer/profile" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
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
      navigate(location.state?.from?.pathname || '/customer/profile', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authShell}>
      <section className={styles.heroPanel}>
        <span>Logistics DMS</span>
        <h1>Customer booking and tracking access built for fast-moving operations.</h1>
        <p>
          Sign in with your email or phone number to manage your account, prepare shipments,
          and follow delivery progress from one responsive workspace.
        </p>
      </section>

      <section className={styles.formPanel}>
        <form className={styles.formCard} onSubmit={handleSubmit} {...getFormValidationProps()}>
          <div>
            <h2>Customer Login</h2>
            <p>Use your registered email or phone number and password.</p>
          </div>

          <Input
            label="Email or Phone"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error ? <div className={styles.errorBox}>{error}</div> : null}

          <Button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className={styles.linkRow}>
            <Link to="/customer/forgot-password">Forgot password?</Link>
            <Link to="/customer/register">Create account</Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CustomerLogin;
