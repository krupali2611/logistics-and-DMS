import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from '../../styles/Profile.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const ChangePassword = () => {
  const [form, setForm] = useState({ current_password: '', new_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { clearSession } = useAuth();
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
    setMessage('');
    setError('');

    try {
      const response = await axiosInstance.put('/users/change-password', form);
      setMessage(response.data.message);
      setTimeout(() => {
        clearSession();
        navigate('/login');
      }, 1200);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit} {...getFormValidationProps()}>
      <h2>Change Password</h2>
      <Input label="Current Password" name="current_password" type="password" value={form.current_password} onChange={handleChange} required />
      <Input label="New Password" name="new_password" type="password" value={form.new_password} onChange={handleChange} required />
      {error ? <div className={styles.error}>{error}</div> : null}
      {message ? <div className={styles.success}>{message}</div> : null}
      <Button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  );
};

export default ChangePassword;
