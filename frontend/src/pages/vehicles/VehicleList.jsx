import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ActionIcon from '../../components/ActionIcon/ActionIcon';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  assignVehicleToDriver,
  getVehicleAssignmentHistory,
  deleteVehicle,
  getVehicleTypes,
  getVehicles,
  returnVehicleAssignment,
  updateVehicleStatus,
  verifyVehicle
} from '../../api/vehicleApi';
import { getAvailableDriversForAssignment } from '../../api/driverApi';
import styles from '../../styles/Vehicle.module.css';
import {
  notifyVehicleAssignmentUpdated,
  subscribeToVehicleAssignmentUpdates
} from '../../utils/assignmentSync';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const initialFilters = {
  search: '',
  status: '',
  verification_status: '',
  availability_status: '',
  vehicle_type_id: '',
  page: 1,
  limit: 10
};

const initialAssignModal = {
  open: false,
  vehicle: null,
  driverId: '',
  drivers: [],
  loading: false,
  saving: false,
  error: ''
};

const initialReturnModal = {
  open: false,
  vehicle: null,
  saving: false,
  error: ''
};

const initialHistoryModal = {
  open: false,
  vehicle: null,
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

const VehicleList = () => {
  const { permissions } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [data, setData] = useState({ records: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState('');
  const [toast, setToast] = useState('');
  const [assignModal, setAssignModal] = useState(initialAssignModal);
  const [returnModal, setReturnModal] = useState(initialReturnModal);
  const [historyModal, setHistoryModal] = useState(initialHistoryModal);
  const hasMountedFilters = useRef(false);

  const canCreate = permissions.includes('vehicle_create');
  const canUpdate = permissions.includes('vehicle_update');
  const canDelete = permissions.includes('vehicle_delete');
  const canVerify = permissions.includes('vehicle_verify');
  const canAssign = permissions.includes('vehicle_assign');

  const fetchVehicles = async (currentFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const response = await getVehicles(currentFilters);
      setData(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to fetch vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [vehicleTypeResponse, vehicleResponse] = await Promise.all([
          getVehicleTypes(),
          getVehicles(filters)
        ]);
        setVehicleTypes(vehicleTypeResponse);
        setData(vehicleResponse);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load vehicle data.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    fetchVehicles(filters);
  }, [filters.page, filters.limit]);

  useEffect(() => {
    if (!hasMountedFilters.current) {
      hasMountedFilters.current = true;
      return;
    }

    const debounceTimer = window.setTimeout(() => {
      fetchVehicles(filters);
    }, 300);

    return () => window.clearTimeout(debounceTimer);
  }, [
    filters.search,
    filters.status,
    filters.verification_status,
    filters.availability_status,
    filters.vehicle_type_id
  ]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => subscribeToVehicleAssignmentUpdates(() => fetchVehicles(filters)), [filters]);

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
    await fetchVehicles(initialFilters);
  };

  const runAction = async (callback, message) => {
    setActionState(message);
    setError('');
    try {
      await callback();
      await fetchVehicles(filters);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Vehicle action failed.');
    } finally {
      setActionState('');
    }
  };

  const handleDelete = async (vehicleId) => {
    const confirmed = window.confirm(
      'Delete this vehicle and all linked documents? If it is assigned, return the assignment first.'
    );
    if (!confirmed) {
      return;
    }

    await runAction(() => deleteVehicle(vehicleId), 'Deleting vehicle...');
  };

  const openAssignModal = async (vehicle) => {
    setAssignModal({
      open: true,
      vehicle,
      driverId: '',
      drivers: [],
      loading: true,
      saving: false,
      error: ''
    });

    try {
      const drivers = await getAvailableDriversForAssignment();
      setAssignModal((current) => ({
        ...current,
        drivers,
        loading: false
      }));
    } catch (requestError) {
      setAssignModal((current) => ({
        ...current,
        loading: false,
        error: requestError.response?.data?.message || 'Unable to load drivers.'
      }));
    }
  };

  const handleAssignSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm(event.currentTarget)) {
      return;
    }

    if (!assignModal.driverId) {
      setAssignModal((current) => ({
        ...current,
        error: 'Driver is required.'
      }));
      return;
    }

    setAssignModal((current) => ({
      ...current,
      saving: true,
      error: ''
    }));

    try {
      await assignVehicleToDriver(assignModal.vehicle.id, assignModal.driverId);
      notifyVehicleAssignmentUpdated();
      setToast('Vehicle assigned successfully.');
      setAssignModal(initialAssignModal);
      await fetchVehicles(filters);
    } catch (requestError) {
      setAssignModal((current) => ({
        ...current,
        saving: false,
        error: requestError.response?.data?.message || 'Unable to assign vehicle.'
      }));
    }
  };

  const openReturnModal = (vehicle) => {
    setReturnModal({
      open: true,
      vehicle,
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
      await returnVehicleAssignment(returnModal.vehicle.id);
      notifyVehicleAssignmentUpdated();
      setToast('Vehicle returned successfully.');
      setReturnModal(initialReturnModal);
      await fetchVehicles(filters);
    } catch (requestError) {
      setReturnModal((current) => ({
        ...current,
        saving: false,
        error: requestError.response?.data?.message || 'Unable to return vehicle.'
      }));
    }
  };

  const openHistoryModal = async (vehicle) => {
    setHistoryModal({
      open: true,
      vehicle,
      records: [],
      loading: true,
      error: ''
    });

    try {
      const records = await getVehicleAssignmentHistory(vehicle.id);
      setHistoryModal({
        open: true,
        vehicle,
        records,
        loading: false,
        error: ''
      });
    } catch (requestError) {
      setHistoryModal({
        open: true,
        vehicle,
        records: [],
        loading: false,
        error: requestError.response?.data?.message || 'Unable to load assignment history.'
      });
    }
  };

  const renderVehicleActions = (vehicle) => {
    const isAssigned = vehicle.availability_status === 'ASSIGNED';
    const isAvailable = vehicle.availability_status === 'AVAILABLE';
    const isVerified = vehicle.verification_status === 'VERIFIED';

    return (
      <div className={styles.actionStack}>
        <Link
          to={`/vehicles/${vehicle.id}`}
          className={styles.actionIconLink}
          title="View vehicle"
          aria-label="View vehicle"
        >
          <ActionIcon name="view" />
        </Link>
        {canUpdate ? (
          <Link
            to={`/vehicles/${vehicle.id}/edit`}
            className={styles.actionIconLink}
            title="Edit vehicle"
            aria-label="Edit vehicle"
          >
            <ActionIcon name="edit" />
          </Link>
        ) : null}
        <Link
          to={`/vehicles/${vehicle.id}/documents`}
          className={styles.actionIconLink}
          title="Manage vehicle documents"
          aria-label="Manage vehicle documents"
        >
          <ActionIcon name="document" />
        </Link>
        {canAssign && isVerified && isAvailable ? (
          <button
            type="button"
            className={styles.actionIconButton}
            title="Assign vehicle"
            aria-label="Assign vehicle"
            onClick={() => openAssignModal(vehicle)}
          >
            <ActionIcon name="assign" />
          </button>
        ) : null}
        {canAssign && isAssigned ? (
          <button
            type="button"
            className={styles.actionIconButton}
            title="Return vehicle"
            aria-label="Return vehicle"
            onClick={() => openReturnModal(vehicle)}
          >
            <ActionIcon name="return" />
          </button>
        ) : null}
        {canAssign && isVerified ? (
          <button
            type="button"
            className={styles.actionIconButton}
            title="View assignment history"
            aria-label="View assignment history"
            onClick={() => openHistoryModal(vehicle)}
          >
            <ActionIcon name="history" />
          </button>
        ) : null}
        {canVerify && vehicle.verification_status !== 'VERIFIED' ? (
          <button
            type="button"
            className={styles.actionIconButton}
            title="Verify vehicle"
            aria-label="Verify vehicle"
            onClick={() =>
              runAction(() => verifyVehicle(vehicle.id, 'VERIFIED'), 'Verifying vehicle...')
            }
          >
            <ActionIcon name="verify" />
          </button>
        ) : null}
        {canUpdate ? (
          <button
            type="button"
            className={styles.actionIconButton}
            title={vehicle.status === 'ACTIVE' ? 'Deactivate vehicle' : 'Activate vehicle'}
            aria-label={vehicle.status === 'ACTIVE' ? 'Deactivate vehicle' : 'Activate vehicle'}
            onClick={() =>
              runAction(
                () =>
                  updateVehicleStatus(
                    vehicle.id,
                    vehicle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                  ),
                'Updating status...'
              )
            }
          >
            <ActionIcon name={vehicle.status === 'ACTIVE' ? 'deactivate' : 'activate'} />
          </button>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            className={styles.actionIconDanger}
            title="Delete vehicle"
            aria-label="Delete vehicle"
            onClick={() => handleDelete(vehicle.id)}
          >
            <ActionIcon name="delete" />
          </button>
        ) : null}
      </div>
    );
  };

  if (loading && !data.pagination) {
    return <Loader label="Loading vehicles..." />;
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <div>
            <span className={styles.eyebrow}>Vehicle Management</span>
            <h2 className={styles.pageTitle}>Fleet Control Center</h2>
            <p className={styles.pageCopy}>
              Monitor vehicle readiness, document compliance, and assignment state across the fleet.
            </p>
          </div>
          <div className={styles.linkGroup}>
            <Link to="/vehicles/types" className={styles.secondaryLink}>
              Vehicle Types
            </Link>
            {canCreate ? (
              <Link to="/vehicles/new" className={styles.primaryLink}>
                Add Vehicle
              </Link>
            ) : null}
          </div>
        </div>

        <div className={styles.filterCard}>
          <div className={styles.filterGrid}>
            <label className={`${styles.field} ${styles.searchField}`}>
              <span>Search</span>
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Vehicle no, registration, type, brand, model"
              />
            </label>
            <label className={styles.field}>
              <span>Vehicle Type</span>
              <select
                name="vehicle_type_id"
                value={filters.vehicle_type_id}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {vehicleTypes.map((vehicleType) => (
                  <option key={vehicleType.id} value={vehicleType.id}>
                    {vehicleType.type_name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Status</span>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
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
                <option value="PENDING">PENDING</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="REJECTED">REJECTED</option>
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
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
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
                  <th>Vehicle Number</th>
                  <th>Vehicle Type</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Verification</th>
                  <th>Availability</th>
                  <th>Assigned Driver</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.records.length === 0 ? (
                  <tr>
                    <td colSpan="10" className={styles.emptyState}>
                      No vehicles found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  data.records.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>{vehicle.vehicle_number}</td>
                      <td>{vehicle.vehicleType?.type_name || 'Unknown'}</td>
                      <td>{vehicle.brand}</td>
                      <td>{vehicle.model}</td>
                      <td>{vehicle.capacity}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[vehicle.status.toLowerCase()]}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            styles[vehicle.verification_status.toLowerCase()]
                          }`}
                        >
                          {vehicle.verification_status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            styles[vehicle.availability_status.toLowerCase()]
                          }`}
                        >
                          {vehicle.availability_status}
                        </span>
                      </td>
                      <td>
                        {vehicle.assignedDriver
                          ? `${vehicle.assignedDriver.driver_code} - ${vehicle.assignedDriver.first_name} ${vehicle.assignedDriver.last_name}`
                          : 'Unassigned'}
                      </td>
                      <td>{renderVehicleActions(vehicle)}</td>
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
          <div className={styles.modalCard} role="dialog" aria-modal="true" aria-labelledby="assign-vehicle-title">
            <div className={styles.modalHeader}>
              <div>
                <h3 id="assign-vehicle-title">Assign Vehicle</h3>
                <p>
                  {assignModal.vehicle?.vehicle_number} - {assignModal.vehicle?.brand}{' '}
                  {assignModal.vehicle?.model}
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
                <span>Driver</span>
                <select
                  value={assignModal.driverId}
                  onChange={(event) =>
                    setAssignModal((current) => ({
                      ...current,
                      driverId: event.target.value,
                      error: ''
                    }))
                  }
                  disabled={assignModal.loading || assignModal.saving}
                  required
                >
                  <option value="">Select driver</option>
                  {assignModal.drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.driver_code} - {driver.first_name} {driver.last_name}
                    </option>
                  ))}
                </select>
              </label>

              {assignModal.loading ? <p className={styles.modalMessage}>Loading eligible drivers...</p> : null}
              {!assignModal.loading && assignModal.drivers.length === 0 ? (
                <p className={styles.modalMessage}>No active verified drivers are currently available.</p>
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
                  disabled={assignModal.loading || assignModal.saving || assignModal.drivers.length === 0}
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
          <div className={styles.modalCard} role="dialog" aria-modal="true" aria-labelledby="return-vehicle-title">
            <div className={styles.modalHeader}>
              <div>
                <h3 id="return-vehicle-title">Return Vehicle</h3>
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
              <p className={styles.modalMessage}>
                {returnModal.vehicle?.vehicle_number} - {returnModal.vehicle?.brand}{' '}
                {returnModal.vehicle?.model}
              </p>
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
          <div className={`${styles.modalCard} ${styles.historyModal}`} role="dialog" aria-modal="true" aria-labelledby="history-title">
            <div className={styles.modalHeader}>
              <div>
                <h3 id="history-title">Vehicle Assignment History</h3>
                <p>
                  {historyModal.vehicle?.vehicle_number} - {historyModal.vehicle?.brand}{' '}
                  {historyModal.vehicle?.model}
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
                        <th>Driver Name</th>
                        <th>Driver Code</th>
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
                            No assignment history available for this vehicle.
                          </td>
                        </tr>
                      ) : (
                        historyModal.records.map((record) => (
                          <tr key={record.id}>
                            <td>{formatDate(record.assigned_at)}</td>
                            <td>{`${record.driver?.first_name || ''} ${record.driver?.last_name || ''}`.trim() || 'Unknown'}</td>
                            <td>{record.driver?.driver_code || 'Unknown'}</td>
                            <td>{getAssignedByLabel(record.assignedBy)}</td>
                            <td>{formatDate(record.returned_at)}</td>
                            <td>{formatDuration(record.assigned_at, record.returned_at)}</td>
                            <td>
                              <span
                                className={`${styles.badge} ${
                                  record.status === 'ASSIGNED' ? styles.available : styles.assigned
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

export default VehicleList;
