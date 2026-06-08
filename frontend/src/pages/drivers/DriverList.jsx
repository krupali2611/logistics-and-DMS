import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ActionIcon from '../../components/ActionIcon/ActionIcon';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  assignVehicleToDriver,
  deleteDriver,
  getAvailableVehiclesForAssignment,
  getDriverVehicleHistory,
  getDrivers,
  returnDriverVehicle,
  updateDriverAvailability,
  updateDriverStatus,
  verifyDriver
} from '../../api/driverApi';
import styles from '../../styles/Driver.module.css';
import {
  notifyVehicleAssignmentUpdated,
  subscribeToVehicleAssignmentUpdates
} from '../../utils/assignmentSync';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const initialFilters = {
  search: '',
  status: '',
  availability_status: '',
  verification_status: '',
  page: 1,
  limit: 10
};

const initialAssignModal = {
  open: false,
  driver: null,
  vehicleId: '',
  vehicles: [],
  loading: false,
  saving: false,
  error: ''
};

const initialReturnModal = {
  open: false,
  driver: null,
  saving: false,
  error: ''
};

const initialHistoryModal = {
  open: false,
  driver: null,
  records: [],
  loading: false,
  error: ''
};

const formatDate = (value) => {
  if (!value) {
    return 'Active';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
};

const formatDuration = (assignedAt, returnedAt) => {
  if (!returnedAt) {
    return 'Current Assignment';
  }

  const diffInDays = Math.max(
    0,
    Math.floor((new Date(returnedAt).getTime() - new Date(assignedAt).getTime()) / 86400000)
  );

  return `${diffInDays} Day${diffInDays === 1 ? '' : 's'}`;
};

const getAssignedByLabel = (assignedBy) => {
  if (!assignedBy) {
    return 'System';
  }

  const name = `${assignedBy.first_name || ''} ${assignedBy.last_name || ''}`.trim();
  return name || assignedBy.email || 'System';
};

const getVehicleLabel = (vehicle) => {
  const typeLabel = vehicle.vehicleType?.type_name || `${vehicle.brand} ${vehicle.model}`.trim();
  return `${vehicle.vehicle_number} - ${typeLabel}`;
};

const DriverList = () => {
  const { permissions } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState({ records: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState('');
  const [toast, setToast] = useState('');
  const [assignModal, setAssignModal] = useState(initialAssignModal);
  const [returnModal, setReturnModal] = useState(initialReturnModal);
  const [historyModal, setHistoryModal] = useState(initialHistoryModal);
  const hasMountedFilters = useRef(false);

  const canCreate = permissions.includes('driver_create');
  const canUpdate = permissions.includes('driver_update');
  const canDelete = permissions.includes('driver_delete');
  const canVerify = permissions.includes('driver_verify');
  const canAssign = permissions.includes('vehicle_assign');

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

  useEffect(() => {
    if (!hasMountedFilters.current) {
      hasMountedFilters.current = true;
      return;
    }

    const debounceTimer = window.setTimeout(() => {
      fetchDrivers(filters);
    }, 300);

    return () => window.clearTimeout(debounceTimer);
  }, [filters.search, filters.status, filters.availability_status, filters.verification_status]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => subscribeToVehicleAssignmentUpdates(() => fetchDrivers(filters)), [filters]);

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
    await fetchDrivers(initialFilters);
  };

  const runAction = async (callback, message) => {
    setActionState(message);
    setError('');

    try {
      await callback();
      await fetchDrivers(filters);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Driver action failed.');
    } finally {
      setActionState('');
    }
  };

  const handleDelete = async (driverId) => {
    const confirmed = window.confirm(
      'Delete this driver and all linked documents? If a vehicle is assigned, return it first.'
    );
    if (!confirmed) {
      return;
    }

    await runAction(() => deleteDriver(driverId), 'Deleting driver...');
  };

  const openAssignModal = async (driver) => {
    setAssignModal({
      open: true,
      driver,
      vehicleId: '',
      vehicles: [],
      loading: true,
      saving: false,
      error: ''
    });

    try {
      const vehicles = await getAvailableVehiclesForAssignment();
      setAssignModal((current) => ({
        ...current,
        vehicles,
        loading: false
      }));
    } catch (requestError) {
      setAssignModal((current) => ({
        ...current,
        loading: false,
        error: requestError.response?.data?.message || 'Unable to load available vehicles.'
      }));
    }
  };

  const handleAssignSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm(event.currentTarget)) {
      return;
    }

    if (!assignModal.vehicleId) {
      setAssignModal((current) => ({
        ...current,
        error: 'Vehicle is required.'
      }));
      return;
    }

    setAssignModal((current) => ({
      ...current,
      saving: true,
      error: ''
    }));

    try {
      await assignVehicleToDriver(assignModal.driver.id, assignModal.vehicleId);
      notifyVehicleAssignmentUpdated();
      setToast('Vehicle assigned successfully.');
      setAssignModal(initialAssignModal);
      await fetchDrivers(filters);
    } catch (requestError) {
      setAssignModal((current) => ({
        ...current,
        saving: false,
        error: requestError.response?.data?.message || 'Unable to assign vehicle.'
      }));
    }
  };

  const openReturnModal = (driver) => {
    setReturnModal({
      open: true,
      driver,
      saving: false,
      error: ''
    });
  };

  const handleReturnConfirm = async () => {
    setReturnModal((current) => ({
      ...current,
      saving: true,
      error: ''
    }));

    try {
      await returnDriverVehicle(returnModal.driver.id);
      notifyVehicleAssignmentUpdated();
      setToast('Vehicle returned successfully.');
      setReturnModal(initialReturnModal);
      await fetchDrivers(filters);
    } catch (requestError) {
      setReturnModal((current) => ({
        ...current,
        saving: false,
        error: requestError.response?.data?.message || 'Unable to return vehicle.'
      }));
    }
  };

  const openHistoryModal = async (driver) => {
    setHistoryModal({
      open: true,
      driver,
      records: [],
      loading: true,
      error: ''
    });

    try {
      const records = await getDriverVehicleHistory(driver.id);
      setHistoryModal({
        open: true,
        driver,
        records,
        loading: false,
        error: ''
      });
    } catch (requestError) {
      setHistoryModal({
        open: true,
        driver,
        records: [],
        loading: false,
        error: requestError.response?.data?.message || 'Unable to load assignment history.'
      });
    }
  };

  const renderDriverActions = (driver) => {
    const hasAssignedVehicle = Boolean(driver.vehicle_assigned && driver.currentVehicle);

    return (
      <div className={styles.actionStack}>
        <Link
          to={`/drivers/${driver.id}`}
          className={styles.actionIconLink}
          title="View driver"
          aria-label="View driver"
        >
          <ActionIcon name="view" />
        </Link>
        {canUpdate ? (
          <Link
            to={`/drivers/${driver.id}/edit`}
            className={styles.actionIconLink}
            title="Edit driver"
            aria-label="Edit driver"
          >
            <ActionIcon name="edit" />
          </Link>
        ) : null}
        <Link
          to={`/drivers/${driver.id}/documents`}
          className={styles.actionIconLink}
          title="Manage documents"
          aria-label="Manage documents"
        >
          <ActionIcon name="document" />
        </Link>
        {canAssign && !hasAssignedVehicle ? (
          <button
            type="button"
            className={styles.actionIconButton}
            title="Assign vehicle"
            aria-label="Assign vehicle"
            onClick={() => openAssignModal(driver)}
          >
            <ActionIcon name="assign" />
          </button>
        ) : null}
        {canAssign && hasAssignedVehicle ? (
          <button
            type="button"
            className={styles.actionIconButton}
            title="Return vehicle"
            aria-label="Return vehicle"
            onClick={() => openReturnModal(driver)}
          >
            <ActionIcon name="return" />
          </button>
        ) : null}
        {canAssign ? (
          <button
            type="button"
            className={styles.actionIconButton}
            title="View assignment history"
            aria-label="View assignment history"
            onClick={() => openHistoryModal(driver)}
          >
            <ActionIcon name="history" />
          </button>
        ) : null}
        {canVerify && driver.verification_status !== 'VERIFIED' ? (
          <button
            type="button"
            className={styles.actionIconButton}
            title="Verify driver"
            aria-label="Verify driver"
            onClick={() => runAction(() => verifyDriver(driver.id, 'VERIFIED'), 'Verifying driver...')}
          >
            <ActionIcon name="verify" />
          </button>
        ) : null}
        {canUpdate ? (
          <button
            type="button"
            className={styles.actionIconButton}
            title={driver.status === 'ACTIVE' ? 'Deactivate driver' : 'Activate driver'}
            aria-label={driver.status === 'ACTIVE' ? 'Deactivate driver' : 'Activate driver'}
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
            <ActionIcon name={driver.status === 'ACTIVE' ? 'deactivate' : 'activate'} />
          </button>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            className={styles.actionIconDanger}
            title="Delete driver"
            aria-label="Delete driver"
            onClick={() => handleDelete(driver.id)}
          >
            <ActionIcon name="delete" />
          </button>
        ) : null}
      </div>
    );
  };

  if (loading && !data.pagination) {
    return <Loader label="Loading drivers..." />;
  }

  return (
    <>
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

        <div className={styles.filterCard}>
          <div className={styles.filterGrid}>
            <label className={`${styles.field} ${styles.searchField}`}>
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
            <div className={styles.filterActions}>
              <button type="button" className={styles.resetButton} onClick={handleReset}>
                Reset
              </button>
            </div>
            {actionState ? <span className={styles.statusText}>{actionState}</span> : null}
          </div>
        </div>

        {toast ? <div className={styles.toast}>{toast}</div> : null}
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
                  <th>Assigned Vehicle</th>
                  <th>Status</th>
                  <th>Availability</th>
                  <th>Verification</th>
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
                      <td>{driver.currentVehicle ? getVehicleLabel(driver.currentVehicle) : 'Unassigned'}</td>
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
                                () => updateDriverAvailability(driver.id, event.target.value),
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
                      <td>{renderDriverActions(driver)}</td>
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

      {assignModal.open ? (
        <div className={styles.modalOverlay} role="presentation">
          <div className={styles.modalCard} role="dialog" aria-modal="true" aria-labelledby="assign-driver-vehicle-title">
            <div className={styles.modalHeader}>
              <div>
                <h3 id="assign-driver-vehicle-title">Assign Vehicle To Driver</h3>
                <p>
                  {assignModal.driver?.driver_code} - {assignModal.driver?.first_name}{' '}
                  {assignModal.driver?.last_name}
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setAssignModal(initialAssignModal)}
              >
                Close
              </button>
            </div>

            <form className={styles.modalBody} onSubmit={handleAssignSubmit} {...getFormValidationProps()}>
              <label className={styles.field}>
                <span>Vehicle</span>
                <select
                  value={assignModal.vehicleId}
                  onChange={(event) =>
                    setAssignModal((current) => ({
                      ...current,
                      vehicleId: event.target.value,
                      error: ''
                    }))
                  }
                  disabled={assignModal.loading || assignModal.saving}
                  required
                >
                  <option value="">Select vehicle</option>
                  {assignModal.vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {getVehicleLabel(vehicle)}
                    </option>
                  ))}
                </select>
              </label>

              {assignModal.loading ? <p className={styles.modalMessage}>Loading available vehicles...</p> : null}
              {!assignModal.loading && assignModal.vehicles.length === 0 ? (
                <p className={styles.modalMessage}>No available vehicles are currently ready for assignment.</p>
              ) : null}
              {assignModal.error ? <div className={styles.errorBox}>{assignModal.error}</div> : null}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setAssignModal(initialAssignModal)}
                  disabled={assignModal.saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryAction}
                  disabled={assignModal.loading || assignModal.saving || assignModal.vehicles.length === 0}
                >
                  {assignModal.saving ? 'Assigning...' : 'Assign Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {returnModal.open ? (
        <div className={styles.modalOverlay} role="presentation">
          <div className={styles.modalCard} role="dialog" aria-modal="true" aria-labelledby="return-driver-vehicle-title">
            <div className={styles.modalHeader}>
              <div>
                <h3 id="return-driver-vehicle-title">Return Assigned Vehicle</h3>
                <p>Are you sure you want to return this vehicle?</p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setReturnModal(initialReturnModal)}
              >
                Close
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.summaryCard}>
                <strong>
                  {returnModal.driver?.currentVehicle ? getVehicleLabel(returnModal.driver.currentVehicle) : 'No vehicle assigned'}
                </strong>
                <span>
                  Driver: {returnModal.driver?.driver_code} - {returnModal.driver?.first_name}{' '}
                  {returnModal.driver?.last_name}
                </span>
              </div>
              {returnModal.error ? <div className={styles.errorBox}>{returnModal.error}</div> : null}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setReturnModal(initialReturnModal)}
                  disabled={returnModal.saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.deleteAction}
                  onClick={handleReturnConfirm}
                  disabled={returnModal.saving}
                >
                  {returnModal.saving ? 'Returning...' : 'Confirm Return'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {historyModal.open ? (
        <div className={styles.modalOverlay} role="presentation">
          <div className={`${styles.modalCard} ${styles.historyModal}`} role="dialog" aria-modal="true" aria-labelledby="driver-history-title">
            <div className={styles.modalHeader}>
              <div>
                <h3 id="driver-history-title">Driver Vehicle Assignment History</h3>
                <p>
                  {historyModal.driver?.driver_code} - {historyModal.driver?.first_name}{' '}
                  {historyModal.driver?.last_name}
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setHistoryModal(initialHistoryModal)}
              >
                Close
              </button>
            </div>

            <div className={styles.modalBody}>
              {historyModal.error ? <div className={styles.errorBox}>{historyModal.error}</div> : null}
              {historyModal.loading ? (
                <p className={styles.modalMessage}>Loading assignment history...</p>
              ) : (
                <div className={styles.historyTableWrap}>
                  <table className={styles.historyTable}>
                    <thead>
                      <tr>
                        <th>Assignment Date</th>
                        <th>Vehicle Number</th>
                        <th>Vehicle Type</th>
                        <th>Assigned By</th>
                        <th>Return Date</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyModal.records.length === 0 ? (
                        <tr>
                          <td colSpan="7" className={styles.emptyState}>
                            No assignment history available for this driver.
                          </td>
                        </tr>
                      ) : (
                        historyModal.records.map((record) => (
                          <tr key={record.id}>
                            <td>{formatDate(record.assigned_at)}</td>
                            <td>{record.vehicle?.vehicle_number || 'Unknown'}</td>
                            <td>{record.vehicle?.vehicleType?.type_name || 'Unknown'}</td>
                            <td>{getAssignedByLabel(record.assignedBy)}</td>
                            <td>{formatDate(record.returned_at)}</td>
                            <td>{formatDuration(record.assigned_at, record.returned_at)}</td>
                            <td>
                              <span
                                className={`${styles.badge} ${
                                  record.status === 'ASSIGNED'
                                    ? styles.statusAssigned
                                    : styles.statusReturned
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default DriverList;
