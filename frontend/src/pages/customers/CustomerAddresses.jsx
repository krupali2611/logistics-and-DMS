import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddresses,
  getCustomerById,
  updateCustomerAddress
} from '../../api/customerApi';
import styles from '../../styles/Customer.module.css';

const emptyAddressForm = {
  address_type: 'PICKUP',
  address_line_1: '',
  address_line_2: '',
  landmark: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  latitude: '',
  longitude: '',
  is_default: false
};

const CustomerAddresses = () => {
  const { id } = useParams();
  const { permissions } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddressForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const canUpdate = permissions.includes('customer_update');
  const canDelete = permissions.includes('customer_delete');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [customerResponse, addressResponse] = await Promise.all([
        getCustomerById(id),
        getCustomerAddresses(id)
      ]);
      setCustomer(customerResponse);
      setAddresses(addressResponse);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load customer addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setForm(emptyAddressForm);
    setEditingId('');
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setForm({
      address_type: address.address_type,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
      latitude: address.latitude || '',
      longitude: address.longitude || '',
      is_default: Boolean(address.is_default)
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        address_line_2: form.address_line_2 || undefined,
        landmark: form.landmark || undefined,
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined
      };

      if (editingId) {
        await updateCustomerAddress(editingId, payload);
      } else {
        await createCustomerAddress(id, payload);
      }

      resetForm();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save customer address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Delete this address?')) {
      return;
    }

    setSaving(true);
    try {
      await deleteCustomerAddress(addressId);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading addresses..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Customer Addresses</span>
          <h2 className={styles.pageTitle}>{customer.company_name}</h2>
          <p className={styles.pageCopy}>
            Maintain pickup, delivery, and billing endpoints for downstream shipment operations.
          </p>
        </div>
        <div className={styles.linkGroup}>
          <Link to={`/customers/${id}`} className={styles.secondaryLink}>
            Customer Details
          </Link>
          <Link to="/customers" className={styles.secondaryLink}>
            Customer List
          </Link>
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <div className={styles.detailGrid}>
        {canUpdate ? (
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <div className={styles.cardHeader}>
              <h3>{editingId ? 'Update Address' : 'Add Address'}</h3>
              <p>Only one billing address can stay marked as default at a time.</p>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Address Type</span>
                <select name="address_type" value={form.address_type} onChange={handleChange}>
                  <option value="PICKUP">PICKUP</option>
                  <option value="DELIVERY">DELIVERY</option>
                  <option value="BILLING">BILLING</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Address Line 1</span>
                <input
                  name="address_line_1"
                  value={form.address_line_1}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className={styles.field}>
                <span>Address Line 2</span>
                <input
                  name="address_line_2"
                  value={form.address_line_2}
                  onChange={handleChange}
                />
              </label>
              <label className={styles.field}>
                <span>Landmark</span>
                <input name="landmark" value={form.landmark} onChange={handleChange} />
              </label>
              <label className={styles.field}>
                <span>City</span>
                <input name="city" value={form.city} onChange={handleChange} required />
              </label>
              <label className={styles.field}>
                <span>State</span>
                <input name="state" value={form.state} onChange={handleChange} required />
              </label>
              <label className={styles.field}>
                <span>Country</span>
                <input name="country" value={form.country} onChange={handleChange} required />
              </label>
              <label className={styles.field}>
                <span>Pincode</span>
                <input name="pincode" value={form.pincode} onChange={handleChange} required />
              </label>
              <label className={styles.field}>
                <span>Latitude</span>
                <input name="latitude" value={form.latitude} onChange={handleChange} />
              </label>
              <label className={styles.field}>
                <span>Longitude</span>
                <input name="longitude" value={form.longitude} onChange={handleChange} />
              </label>
              <label className={`${styles.field} ${styles.checkboxField}`}>
                <input
                  type="checkbox"
                  name="is_default"
                  checked={form.is_default}
                  onChange={handleChange}
                />
                <span>Set as default billing address</span>
              </label>
            </div>

            <div className={styles.submitRow}>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
              </Button>
              {editingId ? (
                <button type="button" className={styles.secondaryButton} onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        ) : null}

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Saved Addresses</h3>
            <p>{addresses.length} total</p>
          </div>
          <div className={styles.documentSummary}>
            {addresses.length === 0 ? (
              <p className={styles.pageCopy}>No addresses added yet.</p>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className={styles.summaryCard}>
                  <strong>
                    {address.address_type}
                    {address.address_type === 'BILLING' && address.is_default
                      ? ' • DEFAULT'
                      : ''}
                  </strong>
                  <span>
                    {address.address_line_1}
                    {address.address_line_2 ? `, ${address.address_line_2}` : ''}
                  </span>
                  <span>
                    {[address.city, address.state, address.country, address.pincode].join(', ')}
                  </span>
                  <div className={styles.summaryActions}>
                    {canUpdate ? (
                      <button
                        type="button"
                        className={styles.textButton}
                        onClick={() => handleEdit(address)}
                      >
                        Edit
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleDelete(address.id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerAddresses;
