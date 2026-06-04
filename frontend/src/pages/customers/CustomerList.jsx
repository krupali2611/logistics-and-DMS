import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  deleteCustomer,
  getCustomers,
  updateCustomerStatus,
  verifyCustomer
} from '../../api/customerApi';
import styles from '../../styles/Customer.module.css';

const initialFilters = {
  search: '',
  customer_type: '',
  status: '',
  verification_status: '',
  page: 1,
  limit: 10
};

const CustomerList = () => {
  const { permissions } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState({ records: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState('');

  const canCreate = permissions.includes('customer_create');
  const canUpdate = permissions.includes('customer_update');
  const canDelete = permissions.includes('customer_delete');
  const canVerify = permissions.includes('customer_verify');

  const fetchCustomers = async (currentFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const response = await getCustomers(currentFilters);
      setData(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to fetch customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(filters);
  }, [filters.page, filters.limit]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
      page: 1
    }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await fetchCustomers(filters);
  };

  const handleReset = async () => {
    setFilters(initialFilters);
    await fetchCustomers(initialFilters);
  };

  const runAction = async (callback, message) => {
    setActionState(message);
    try {
      await callback();
      await fetchCustomers(filters);
    } finally {
      setActionState('');
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Delete this customer and all linked addresses, documents, and notes?')) {
      return;
    }

    await runAction(() => deleteCustomer(customerId), 'Deleting customer...');
  };

  if (loading && !data.pagination) {
    return <Loader label="Loading customers..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Customer Management</span>
          <h2 className={styles.pageTitle}>Customer Operations Hub</h2>
          <p className={styles.pageCopy}>
            Manage account master data for booking, pricing, billing, and future shipment flows.
          </p>
        </div>
        {canCreate ? (
          <Link to="/customers/new" className={styles.primaryLink}>
            Add Customer
          </Link>
        ) : null}
      </div>

      <form className={styles.filterCard} onSubmit={handleSearch}>
        <div className={styles.filterGrid}>
          <label className={styles.field}>
            <span>Search</span>
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Code, company, contact, phone, or email"
            />
          </label>
          <label className={styles.field}>
            <span>Customer Type</span>
            <select
              name="customer_type"
              value={filters.customer_type}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="BUSINESS">Business</option>
              <option value="CORPORATE">Corporate</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Status</span>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Verification</span>
            <select
              name="verification_status"
              value={filters.verification_status}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>
        </div>

        <div className={styles.filterActions}>
          <Button type="submit">Apply Filters</Button>
          <button type="button" className={styles.secondaryButton} onClick={handleReset}>
            Reset
          </button>
          {actionState ? <span className={styles.statusText}>{actionState}</span> : null}
        </div>
      </form>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer Code</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Customer Type</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.records.length === 0 ? (
                <tr>
                  <td colSpan="8" className={styles.emptyState}>
                    No customers found for the selected filters.
                  </td>
                </tr>
              ) : (
                data.records.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.customer_code}</td>
                    <td>{customer.company_name}</td>
                    <td>{customer.contact_person}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.customer_type}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[customer.status.toLowerCase()]}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          styles[customer.verification_status.toLowerCase()]
                        }`}
                      >
                        {customer.verification_status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionStack}>
                        <Link to={`/customers/${customer.id}`} className={styles.textLink}>
                          View
                        </Link>
                        {canUpdate ? (
                          <Link to={`/customers/${customer.id}/edit`} className={styles.textLink}>
                            Edit
                          </Link>
                        ) : null}
                        <Link to={`/customers/${customer.id}/addresses`} className={styles.textLink}>
                          Addresses
                        </Link>
                        <Link to={`/customers/${customer.id}/documents`} className={styles.textLink}>
                          Documents
                        </Link>
                        <Link to={`/customers/${customer.id}/notes`} className={styles.textLink}>
                          Notes
                        </Link>
                        {canVerify && customer.verification_status !== 'VERIFIED' ? (
                          <button
                            type="button"
                            className={styles.textButton}
                            onClick={() =>
                              runAction(
                                () => verifyCustomer(customer.id, 'VERIFIED'),
                                'Verifying customer...'
                              )
                            }
                          >
                            Verify
                          </button>
                        ) : null}
                        {canUpdate ? (
                          <button
                            type="button"
                            className={styles.textButton}
                            onClick={() =>
                              runAction(
                                () =>
                                  updateCustomerStatus(
                                    customer.id,
                                    customer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                  ),
                                'Updating status...'
                              )
                            }
                          >
                            {customer.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => handleDelete(customer.id)}
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data.pagination ? (
          <div className={styles.pagination}>
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages} •{' '}
              {data.pagination.totalRecords} records
            </span>
            <div className={styles.paginationActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={data.pagination.page <= 1}
                onClick={() =>
                  setFilters((current) => ({ ...current, page: current.page - 1 }))
                }
              >
                Previous
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={data.pagination.page >= data.pagination.totalPages}
                onClick={() =>
                  setFilters((current) => ({ ...current, page: current.page + 1 }))
                }
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerList;
