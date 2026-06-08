import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { requestCustomerPasswordReset } from '../../api/customerAuthApi';
import styles from '../../styles/CustomerAuthPortal.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const CustomerForgotPassword = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm(event.currentTarget)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await requestCustomerPasswordReset(identifier);
      navigate('/customer/reset-password', {
        replace: true,
        state: {
          identifier,
          otpPreview: data.otp || null
        }
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to generate reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.centeredShell}>
      <form className={styles.formCard} onSubmit={handleSubmit} {...getFormValidationProps()}>
        <div>
          <h2>Forgot Password</h2>
          <p>Enter your email or phone number to receive a password reset OTP.</p>
        </div>

        <Input
          label="Email or Phone"
          name="identifier"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
        />

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        <Button type="submit" disabled={loading}>
          {loading ? 'Generating OTP...' : 'Send Reset OTP'}
        </Button>

        <div className={styles.linkRow}>
          <Link to="/customer/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
};

export default CustomerForgotPassword;
