import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from '../../styles/AuthPages.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const ResetPassword = () => {
  const [form, setForm] = useState({ token: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setMessage('');

    try {
      const response = await axiosInstance.post('/auth/reset-password', form);
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 1200);
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
          <p>Paste the reset token and set a new password.</p>
        </div>

        <Input label="Reset Token" name="token" value={form.token} onChange={handleChange} required />
        <Input label="New Password" name="password" type="password" value={form.password} onChange={handleChange} required />

        {error ? <div className={styles.errorBox}>{error}</div> : null}
        {message ? <div className={styles.successBox}>{message}</div> : null}

        <Button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>

        <div className={styles.links}>
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
