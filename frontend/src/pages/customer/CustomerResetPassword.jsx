import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { resetCustomerPassword } from '../../api/customerAuthApi';
import styles from '../../styles/CustomerAuthPortal.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const CustomerResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    identifier: location.state?.identifier || '',
    otp: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    setSuccess('');

    try {
      await resetCustomerPassword(form);
      setSuccess('Password updated successfully. Redirecting to login...');
      window.setTimeout(() => navigate('/customer/login', { replace: true }), 1200);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.centeredShell}>
      <form className={styles.formCard} onSubmit={handleSubmit} {...getFormValidationProps()}>
        <div>
          <h2>Reset Password</h2>
          <p>Use the OTP from the previous step and set a new strong password.</p>
        </div>

        <Input label="Email or Phone" name="identifier" value={form.identifier} onChange={handleChange} required />
        <Input label="OTP" name="otp" value={form.otp} onChange={handleChange} required />
        <Input
          label="New Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$"
        />
        <Input
          label="Confirm Password"
          name="confirm_password"
          type="password"
          value={form.confirm_password}
          onChange={handleChange}
          required
        />

        {location.state?.otpPreview ? (
          <div className={styles.tokenBox}>Development OTP: {location.state.otpPreview}</div>
        ) : null}
        {error ? <div className={styles.errorBox}>{error}</div> : null}
        {success ? <div className={styles.successBox}>{success}</div> : null}

        <Button type="submit" disabled={loading}>
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </Button>

        <div className={styles.linkRow}>
          <Link to="/customer/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
};

export default CustomerResetPassword;
