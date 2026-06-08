import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { resendCustomerOtp, verifyCustomerOtp } from '../../api/customerAuthApi';
import styles from '../../styles/CustomerAuthPortal.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const CustomerOtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpPreview, setOtpPreview] = useState(location.state?.otpPreview || '');

  const payload = {
    customer_user_id: location.state?.customer_user_id,
    email: location.state?.email,
    phone: location.state?.phone,
    type: location.state?.type || 'EMAIL_VERIFICATION'
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
      await verifyCustomerOtp({
        ...payload,
        otp
      });
      setMessage('OTP verified. Your account is now active.');
      window.setTimeout(() => navigate('/customer/login', { replace: true }), 1000);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setMessage('');

    try {
      const data = await resendCustomerOtp(payload);
      setOtpPreview(data.otp || '');
      setMessage('A fresh OTP has been generated.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.centeredShell}>
      <form className={styles.formCard} onSubmit={handleSubmit} {...getFormValidationProps()}>
        <div>
          <h2>Verify OTP</h2>
          <p>Complete verification to activate your customer account.</p>
        </div>

        <Input label="OTP" name="otp" value={otp} onChange={(event) => setOtp(event.target.value)} required />

        {otpPreview ? <div className={styles.tokenBox}>Development OTP: {otpPreview}</div> : null}
        {error ? <div className={styles.errorBox}>{error}</div> : null}
        {message ? <div className={styles.successBox}>{message}</div> : null}

        <Button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>
        <Button type="button" onClick={handleResend} disabled={resending}>
          {resending ? 'Resending...' : 'Resend OTP'}
        </Button>

        <div className={styles.linkRow}>
          <Link to="/customer/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
};

export default CustomerOtpVerification;
