import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { createCustomer, getCustomerById, updateCustomer } from '../../api/customerApi';
import styles from '../../styles/Customer.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const initialForm = {
  customer_name: '',
  email: '',
  phone: '',
  alternate_phone: '',
  gst_number: '',
  pan_number: ''
};

const getValidationMessage = (error) => {
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((item) => item.message).join(' ');
  }

  return error.response?.data?.message || 'Unable to save customer.';
};

const CustomerForm = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = mode === 'edit';
  const [form, setForm] = useState(initialForm);
  const [customerCode, setCustomerCode] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    const loadCustomer = async () => {
      setLoading(true);
      setError('');

      try {
        const customer = await getCustomerById(id);
        setForm({
          customer_name: customer.company_name || customer.contact_person || '',
          email: customer.email || '',
          phone: customer.phone || '',
          alternate_phone: customer.alternate_phone || '',
          gst_number: customer.gst_number || '',
          pan_number: customer.pan_number || ''
        });
        setCustomerCode(customer.customer_code || '');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load customer.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id, isEditMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm(event.currentTarget)) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        customer_type: 'BUSINESS',
        company_name: form.customer_name,
        contact_person: form.customer_name,
        email: form.email,
        phone: form.phone,
        alternate_phone: form.alternate_phone || undefined,
        gst_number: form.gst_number || undefined,
        pan_number: form.pan_number || undefined
      };

      const customer = isEditMode
        ? await updateCustomer(id, payload)
        : await createCustomer(payload);

      navigate(`/customers/${customer.id}`);
    } catch (requestError) {
      setError(getValidationMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading customer profile..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Customer Management</span>
          <h2 className={styles.pageTitle}>
            {isEditMode ? 'Edit Customer Account' : 'Create Customer Account'}
          </h2>
          <p className={styles.pageCopy}>
            Keep customer master data consistent before shipment, pricing, and billing modules arrive.
          </p>
        </div>
        <Link to="/customers" className={styles.secondaryLink}>
          Back to Customers
        </Link>
      </div>

      <form className={styles.formShell} onSubmit={handleSubmit} {...getFormValidationProps()}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Customer Details</h3>
            <p>
              {isEditMode
                ? `Customer code: ${customerCode || 'Not available'}`
                : 'Customer code will be generated automatically after save if not provided by API.'}
            </p>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Customer Name</span>
              <input
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label className={styles.field}>
              <span>Phone</span>
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </label>
            <label className={styles.field}>
              <span>Alternate Phone</span>
              <input
                name="alternate_phone"
                value={form.alternate_phone}
                onChange={handleChange}
              />
            </label>
            <label className={styles.field}>
              <span>GST Number</span>
              <input name="gst_number" value={form.gst_number} onChange={handleChange} />
            </label>
            <label className={styles.field}>
              <span>PAN Number</span>
              <input name="pan_number" value={form.pan_number} onChange={handleChange} />
            </label>
          </div>
        </section>

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        <div className={styles.submitRow}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving Customer...' : isEditMode ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
