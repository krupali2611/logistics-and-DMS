import { useEffect, useState } from 'react';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import {
  changeCustomerPassword,
  getCustomerShipmentStats,
  updateCustomerProfile
} from '../../api/customerAuthApi';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import styles from '../../styles/CustomerProfilePortal.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const CustomerProfile = () => {
  const { customer, refreshProfile, user } = useCustomerAuth();
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    profile_image: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [stats, setStats] = useState(null);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setProfileForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      profile_image: user?.profile_image || ''
    });
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const nextStats = await getCustomerShipmentStats();
        if (isMounted) {
          setStats(nextStats);
        }
      } catch (error) {
        if (isMounted) {
          setStats(null);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm(event.currentTarget)) {
      return;
    }

    setSavingProfile(true);
    setProfileMessage('');
    setProfileError('');

    try {
      await updateCustomerProfile(profileForm);
      await refreshProfile();
      setProfileMessage('Profile saved successfully.');
    } catch (requestError) {
      setProfileError(requestError.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm(event.currentTarget)) {
      return;
    }

    setSavingPassword(true);
    setPasswordMessage('');
    setPasswordError('');

    try {
      await changeCustomerPassword(passwordForm);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setPasswordMessage('Password changed successfully. Please use the new password next time you sign in.');
    } catch (requestError) {
      setPasswordError(requestError.response?.data?.message || 'Unable to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className={styles.profileGrid}>
      <section className={styles.summaryCard}>
        <div>
          <span className={styles.kicker}>Account Status</span>
          <h2>{customer?.company_name || 'Customer Account'}</h2>
          <p>{customer?.customer_code || 'Customer profile loaded'}</p>
        </div>
        <div className={styles.summaryMeta}>
          <span>{user?.status}</span>
          <span>{user?.email}</span>
          <span>{user?.phone}</span>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <strong>{stats?.totalShipments ?? '--'}</strong>
          <span>Total Shipments</span>
        </article>
        <article className={styles.statCard}>
          <strong>{stats?.pendingAssignment ?? '--'}</strong>
          <span>Pending Assignment</span>
        </article>
        <article className={styles.statCard}>
          <strong>{stats?.inTransit ?? '--'}</strong>
          <span>In Transit</span>
        </article>
        <article className={styles.statCard}>
          <strong>{stats?.delivered ?? '--'}</strong>
          <span>Delivered</span>
        </article>
      </section>

      <form className={styles.card} onSubmit={handleProfileSubmit} {...getFormValidationProps()}>
        <h3>Profile Information</h3>
        <div className={styles.twoColumn}>
          <Input label="First Name" name="first_name" value={profileForm.first_name} onChange={(event) => setProfileForm((current) => ({ ...current, first_name: event.target.value }))} required minLength={2} />
          <Input label="Last Name" name="last_name" value={profileForm.last_name} onChange={(event) => setProfileForm((current) => ({ ...current, last_name: event.target.value }))} required minLength={2} />
        </div>
        <Input label="Email" name="email" type="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} required />
        <Input label="Phone" name="phone" value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} required pattern="^[0-9+\-\s]{7,20}$" />
        <Input label="Profile Image URL" name="profile_image" value={profileForm.profile_image} onChange={(event) => setProfileForm((current) => ({ ...current, profile_image: event.target.value }))} />

        {profileError ? <div className={styles.errorBox}>{profileError}</div> : null}
        {profileMessage ? <div className={styles.successBox}>{profileMessage}</div> : null}

        <Button type="submit" disabled={savingProfile}>
          {savingProfile ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>

      <form className={styles.card} onSubmit={handlePasswordSubmit} {...getFormValidationProps()}>
        <h3>Change Password</h3>
        <Input
          label="Current Password"
          name="current_password"
          type="password"
          value={passwordForm.current_password}
          onChange={(event) =>
            setPasswordForm((current) => ({ ...current, current_password: event.target.value }))
          }
          required
        />
        <Input
          label="New Password"
          name="new_password"
          type="password"
          value={passwordForm.new_password}
          onChange={(event) =>
            setPasswordForm((current) => ({ ...current, new_password: event.target.value }))
          }
          required
          minLength={8}
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$"
        />
        <Input
          label="Confirm Password"
          name="confirm_password"
          type="password"
          value={passwordForm.confirm_password}
          onChange={(event) =>
            setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))
          }
          required
        />

        {passwordError ? <div className={styles.errorBox}>{passwordError}</div> : null}
        {passwordMessage ? <div className={styles.successBox}>{passwordMessage}</div> : null}

        <Button type="submit" disabled={savingPassword}>
          {savingPassword ? 'Updating...' : 'Change Password'}
        </Button>
      </form>
    </div>
  );
};

export default CustomerProfile;
