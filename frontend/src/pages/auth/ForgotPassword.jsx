import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from '../../styles/AuthPages.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('admin@logistics.com');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm(event.currentTarget)) {
      return;
    }

    setLoading(true);
    setMessage('');
    setResetToken('');

    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      setResetToken(response.data.data?.resetToken || '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.centeredShell}>
      <form className={styles.formCard} onSubmit={handleSubmit} {...getFormValidationProps()}>
        <div>
          <h2>Forgot Password</h2>
          <p>Generate a reset token for the selected account.</p>
        </div>

        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

        {message ? <div className={styles.successBox}>{message}</div> : null}
        {resetToken ? <div className={styles.tokenBox}>Reset Token: {resetToken}</div> : null}

        <Button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Reset Token'}
        </Button>

        <div className={styles.links}>
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
