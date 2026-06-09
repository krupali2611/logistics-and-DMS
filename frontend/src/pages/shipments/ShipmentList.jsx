import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ActionIcon from '../../components/ActionIcon/ActionIcon';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  cancelShipment,
  getShipments
} from '../../api/shipmentApi';
import styles from '../../styles/Shipment.module.css';

const CANCELLABLE_SHIPMENT_STATUSES = ['DRAFT', 'PENDING_ASSIGNMENT', 'ASSIGNED'];
const initialFilters = {
  search: '',
  status: '',
  priority: '',
  shipment_type: '',
  created_from: '',
  created_to: '',
  page: 1,
  limit: 10
};

const ShipmentList = () => {
  const { permissions } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState({ records: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState('');
  const hasMountedFilters = useRef(false);

  const canCreate = permissions.includes('shipment_create');
  const canCancel = permissions.includes('shipment_cancel');

  const fetchShipments = async (currentFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const response = await getShipments(currentFilters);
      setData(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to fetch shipments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments(filters);
  }, [filters.page, filters.limit]);

  useEffect(() => {
    if (!hasMountedFilters.current) {
      hasMountedFilters.current = true;
      return;
    }

    const debounceTimer = window.setTimeout(() => {
      fetchShipments(filters);
    }, 300);

    return () => window.clearTimeout(debounceTimer);
  }, [
    filters.search,
    filters.status,
    filters.priority,
    filters.shipment_type,
    filters.created_from,
    filters.created_to
  ]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
      page: 1
    }));
  };

  const handleReset = async () => {
    setFilters(initialFilters);
    await fetchShipments(initialFilters);
  };

  const runAction = async (callback, message) => {
    setActionState(message);
    setError('');

    try {
      await callback();
      await fetchShipments(filters);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Shipment action failed.');
    } finally {
      setActionState('');
    }
  };

  const handleCancel = async (shipmentId) => {
    const remarks = window.prompt('Cancellation reason:', 'Shipment cancelled from shipment list.');

    if (remarks === null) {
      return;
    }

    await runAction(() => cancelShipment(shipmentId, remarks), 'Cancelling shipment...');
  };

  if (loading && !data.pagination) {
    return <Loader label="Loading shipments..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Shipment Management</span>
          <h2 className={styles.pageTitle}>Shipment Command Center</h2>
          <p className={styles.pageCopy}>
            Create, track, and govern shipment lifecycle records for the full delivery network.
          </p>
        </div>
        {canCreate ? (
          <Link to="/shipments/new" className={styles.primaryLink}>
            Create Shipment
          </Link>
        ) : null}
      </div>

      <div className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <label className={`${styles.field} ${styles.searchField}`}>
            <span>Search</span>
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Shipment no, customer, or phone"
            />
          </label>
          <label className={styles.field}>
            <span>Status</span>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PENDING_ASSIGNMENT">PENDING_ASSIGNMENT</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="PICKUP_STARTED">PICKUP_STARTED</option>
              <option value="PICKED_UP">PICKED_UP</option>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Priority</span>
            <select name="priority" value={filters.priority} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="LOW">LOW</option>
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Shipment Type</span>
            <select
              name="shipment_type"
              value={filters.shipment_type}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="DOCUMENT">DOCUMENT</option>
              <option value="PARCEL">PARCEL</option>
              <option value="HOUSEHOLD">HOUSEHOLD</option>
              <option value="COMMERCIAL">COMMERCIAL</option>
              <option value="FRAGILE">FRAGILE</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Created From</span>
            <input
              type="date"
              name="created_from"
              value={filters.created_from}
              onChange={handleFilterChange}
            />
          </label>
          <label className={styles.field}>
            <span>Created To</span>
            <input
              type="date"
              name="created_to"
              value={filters.created_to}
              onChange={handleFilterChange}
            />
          </label>
          <div className={styles.filterActions}>
            <button type="button" className={styles.resetButton} onClick={handleReset}>
              Reset
            </button>
          </div>
          {actionState ? <span className={styles.statusText}>{actionState}</span> : null}
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Shipment Number</th>
                <th>Customer</th>
                <th>Pickup City</th>
                <th>Delivery City</th>
                <th>Shipment Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.records.length === 0 ? (
                <tr>
                  <td colSpan="9" className={styles.emptyState}>
                    No shipments found for the selected filters.
                  </td>
                </tr>
              ) : (
                data.records.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>{shipment.shipment_number}</td>
                    <td>{shipment.customer?.company_name || 'Unknown customer'}</td>
                    <td>{shipment.pickup_city || shipment.pickup_location?.city || 'N/A'}</td>
                    <td>{shipment.delivery_city || shipment.delivery_location?.city || 'N/A'}</td>
                    <td>{shipment.shipment_type}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[`priority_${shipment.priority.toLowerCase()}`]}`}>
                        {shipment.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[shipment.status.toLowerCase()] || ''}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td>{new Date(shipment.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionStack}>
                        <Link
                          to={`/shipments/${shipment.id}`}
                          className={styles.actionIconLink}
                          title="View shipment"
                          aria-label="View shipment"
                        >
                          <ActionIcon name="view" />
                        </Link>
                        <Link
                          to={`/shipments/${shipment.id}/attachments`}
                          className={styles.actionIconLink}
                          title="Manage attachments"
                          aria-label="Manage attachments"
                        >
                          <ActionIcon name="document" />
                        </Link>
                        {canCancel && CANCELLABLE_SHIPMENT_STATUSES.includes(shipment.status) ? (
                          <button
                            type="button"
                            className={styles.actionIconButton}
                            title="Cancel shipment"
                            aria-label="Cancel shipment"
                            onClick={() => handleCancel(shipment.id)}
                          >
                            <ActionIcon name="deactivate" />
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
              Page {data.pagination.page} of {data.pagination.totalPages} -{' '}
              {data.pagination.totalRecords} records
            </span>
            <div className={styles.paginationActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={data.pagination.page <= 1}
                onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
              >
                Previous
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={data.pagination.page >= data.pagination.totalPages}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
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

export default ShipmentList;
