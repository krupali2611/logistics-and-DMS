import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import ChangePassword from './ChangePassword';
import Loader from '../../components/Loader/Loader';
import styles from '../../styles/Profile.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const Profile = () => {
  const { user, roles, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || ''
    });
  }, [user]);

  if (!user) {
    return <Loader label="Loading profile..." />;
  }

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

    try {
      await axiosInstance.put('/users/profile', form);
      await refreshProfile();
      setMessage('Profile updated successfully.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profileGrid}>
      <form className={styles.card} onSubmit={handleSubmit} {...getFormValidationProps()}>
        <h2>Profile Information</h2>
        <Input label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required />
        <Input label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        {message ? <div className={styles.success}>{message}</div> : null}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>

      <div className={styles.card}>
        <h2>Account Snapshot</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {roles[0] || 'Unassigned'}</p>
        <p><strong>Status:</strong> {user.status ? 'Active' : 'Inactive'}</p>
        <p><strong>Last Login:</strong> {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</p>
      </div>

      <div className={styles.spanFull}>
        <ChangePassword />
      </div>
    </div>
  );
};

export default Profile;
