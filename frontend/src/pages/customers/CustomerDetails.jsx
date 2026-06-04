import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import { getCustomerById } from '../../api/customerApi';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Customer.module.css';

const CustomerDetails = () => {
  const { id } = useParams();
  const { permissions } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true);
      setError('');

      try {
        setCustomer(await getCustomerById(id));
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load customer details.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id]);

  if (loading) {
    return <Loader label="Loading customer details..." />;
  }

  if (error) {
    return <div className={styles.errorBox}>{error}</div>;
  }

  const defaultBillingAddress = customer.addresses.find(
    (address) => address.address_type === 'BILLING' && address.is_default
  );

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Customer Profile</span>
          <h2 className={styles.pageTitle}>{customer.company_name}</h2>
          <p className={styles.pageCopy}>Customer code: {customer.customer_code}</p>
        </div>
        <div className={styles.linkGroup}>
          {permissions.includes('customer_update') ? (
            <Link to={`/customers/${id}/edit`} className={styles.secondaryLink}>
              Edit Customer
            </Link>
          ) : null}
          <Link to={`/customers/${id}/addresses`} className={styles.secondaryLink}>
            Manage Addresses
          </Link>
          <Link to={`/customers/${id}/documents`} className={styles.primaryLink}>
            Manage Documents
          </Link>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Account Overview</h3>
          </div>
          <div className={styles.infoGrid}>
            <div><strong>Contact Person:</strong> {customer.contact_person}</div>
            <div><strong>Email:</strong> {customer.email}</div>
            <div><strong>Phone:</strong> {customer.phone}</div>
            <div><strong>Alternate Phone:</strong> {customer.alternate_phone || 'Not set'}</div>
            <div><strong>Customer Type:</strong> {customer.customer_type}</div>
            <div><strong>Status:</strong> {customer.status}</div>
            <div><strong>Verification:</strong> {customer.verification_status}</div>
            <div><strong>GST Number:</strong> {customer.gst_number || 'Not set'}</div>
            <div><strong>PAN Number:</strong> {customer.pan_number || 'Not set'}</div>
            <div><strong>Created:</strong> {new Date(customer.created_at).toLocaleString()}</div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Default Billing Address</h3>
          </div>
          {defaultBillingAddress ? (
            <p className={styles.addressBlock}>
              {defaultBillingAddress.address_line_1}
              {defaultBillingAddress.address_line_2 ? `, ${defaultBillingAddress.address_line_2}` : ''}
              {defaultBillingAddress.landmark ? `, ${defaultBillingAddress.landmark}` : ''}
              <br />
              {[
                defaultBillingAddress.city,
                defaultBillingAddress.state,
                defaultBillingAddress.country,
                defaultBillingAddress.pincode
              ].join(', ')}
            </p>
          ) : (
            <p className={styles.pageCopy}>No default billing address configured yet.</p>
          )}
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Module Readiness</h3>
          </div>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <strong>{customer.addresses.length}</strong>
              <span>Addresses</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{customer.documents.length}</strong>
              <span>Documents</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{customer.notes.length}</strong>
              <span>Notes</span>
            </div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Recent Notes</h3>
            <p>{customer.notes.length} records linked</p>
          </div>
          <div className={styles.documentSummary}>
            {customer.notes.length === 0 ? (
              <p className={styles.pageCopy}>No notes added yet.</p>
            ) : (
              customer.notes.slice(0, 3).map((note) => (
                <div key={note.id} className={styles.noteCard}>
                  <p>{note.note}</p>
                  <span className={styles.noteMeta}>
                    {note.createdBy
                      ? `${note.createdBy.first_name} ${note.createdBy.last_name}`
                      : 'System'}
                    {' • '}
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerDetails;
