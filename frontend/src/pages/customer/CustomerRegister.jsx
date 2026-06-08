import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { registerCustomer } from '../../api/customerAuthApi';
import styles from '../../styles/CustomerAuthPortal.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const CustomerRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
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

    try {
      await registerCustomer(form);
      navigate('/customer/login', {
        replace: true,
        state: {
          registrationSuccess: 'Account created successfully. Please sign in.'
        }
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authShell}>
      <section className={styles.heroPanel}>
        <span>New Customer Access</span>
        <h1>Open your logistics account and move from signup to shipment readiness in minutes.</h1>
        <p>
          Registration creates your secure customer identity and prepares your account for
          booking, tracking, and future mobile access.
        </p>
      </section>

      <section className={styles.formPanel}>
        <form className={styles.formCard} onSubmit={handleSubmit} {...getFormValidationProps()}>
          <div>
            <h2>Create Customer Account</h2>
            <p>All fields are required for first-time registration.</p>
          </div>

          <div className={styles.gridTwo}>
            <Input label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required minLength={2} />
            <Input label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required minLength={2} />
          </div>
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            pattern="^[0-9+\-\s]{7,20}$"
          />
          <Input
            label="Password"
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

          <div className={styles.helperCard}>
            Password must be at least 8 characters and include uppercase, lowercase, a number,
            and a special character.
          </div>

          {error ? <div className={styles.errorBox}>{error}</div> : null}

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </Button>

          <div className={styles.linkRow}>
            <Link to="/customer/login">Already have an account?</Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CustomerRegister;
