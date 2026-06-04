import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  deleteDriver,
  getDrivers,
  updateDriverAvailability,
  updateDriverStatus,
  verifyDriver
} from '../../api/driverApi';
import styles from '../../styles/Driver.module.css';

const initialFilters = {
  search: '',
  status: '',
  availability_status: '',
  verification_status: '',
  page: 1,
  limit: 10
};

const DriverList = () => {
  const { permissions } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState({ records: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState('');

  const canCreate = permissions.includes('driver_create');
  const canUpdate = permissions.includes('driver_update');
  const canDelete = permissions.includes('driver_delete');
  const canVerify = permissions.includes('driver_verify');

  const fetchDrivers = async (currentFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const response = await getDrivers(currentFilters);
      setData(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to fetch drivers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers(filters);
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
    await fetchDrivers(filters);
  };

  const handleReset = async () => {
    setFilters(initialFilters);
    await fetchDrivers(initialFilters);
  };

  const runAction = async (callback, message) => {
    setActionState(message);
    try {
      await callback();
      await fetchDrivers(filters);
    } finally {
      setActionState('');
    }
  };

  const handleDelete = async (driverId) => {
    const confirmed = window.confirm('Delete this driver and all linked documents?');
    if (!confirmed) {
      return;
    }

    await runAction(() => deleteDriver(driverId), 'Deleting driver...');
  };

  if (loading && !data.pagination) {
    return <Loader label="Loading drivers..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Driver Management</span>
          <h2 className={styles.pageTitle}>Driver Control Center</h2>
          <p className={styles.pageCopy}>
            Search, verify, and operationally manage your delivery fleet from one place.
          </p>
        </div>
        {canCreate ? (
          <Link to="/drivers/new" className={styles.primaryLink}>
            Add Driver
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
              placeholder="Name, email, phone, or driver code"
            />
          </label>
          <label className={styles.field}>
            <span>Status</span>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Availability</span>
            <select
              name="availability_status"
              value={filters.availability_status}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="BUSY">Busy</option>
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
                <th>Driver Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Availability</th>
                <th>Verification</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.records.length === 0 ? (
                <tr>
                  <td colSpan="9" className={styles.emptyState}>
                    No drivers found for the selected filters.
                  </td>
                </tr>
              ) : (
                data.records.map((driver) => (
                  <tr key={driver.id}>
                    <td>{driver.driver_code}</td>
                    <td>{`${driver.first_name} ${driver.last_name}`}</td>
                    <td>{driver.phone}</td>
                    <td>{driver.email}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[driver.status.toLowerCase()]}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td>
                      {canUpdate ? (
                        <select
                          className={styles.inlineSelect}
                          value={driver.availability_status}
                          onChange={(event) =>
                            runAction(
                              () =>
                                updateDriverAvailability(driver.id, event.target.value),
                              'Updating availability...'
                            )
                          }
                        >
                          <option value="ONLINE">ONLINE</option>
                          <option value="OFFLINE">OFFLINE</option>
                          <option value="BUSY">BUSY</option>
                        </select>
                      ) : (
                        driver.availability_status
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          styles[driver.verification_status.toLowerCase()]
                        }`}
                      >
                        {driver.verification_status}
                      </span>
                    </td>
                    <td>{new Date(driver.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionStack}>
                        <Link to={`/drivers/${driver.id}`} className={styles.textLink}>
                          View
                        </Link>
                        {canUpdate ? (
                          <Link to={`/drivers/${driver.id}/edit`} className={styles.textLink}>
                            Edit
                          </Link>
                        ) : null}
                        <Link to={`/drivers/${driver.id}/documents`} className={styles.textLink}>
                          Documents
                        </Link>
                        {canVerify && driver.verification_status !== 'VERIFIED' ? (
                          <button
                            type="button"
                            className={styles.textButton}
                            onClick={() =>
                              runAction(
                                () => verifyDriver(driver.id, 'VERIFIED'),
                                'Verifying driver...'
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
                                  updateDriverStatus(
                                    driver.id,
                                    driver.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                  ),
                                'Updating status...'
                              )
                            }
                          >
                            {driver.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => handleDelete(driver.id)}
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

export default DriverList;
