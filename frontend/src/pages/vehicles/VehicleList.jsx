import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  deleteVehicle,
  getVehicleTypes,
  getVehicles,
  updateVehicleAvailability,
  updateVehicleStatus,
  verifyVehicle
} from '../../api/vehicleApi';
import styles from '../../styles/Vehicle.module.css';

const initialFilters = {
  search: '',
  status: '',
  verification_status: '',
  availability_status: '',
  vehicle_type_id: '',
  page: 1,
  limit: 10
};

const VehicleList = () => {
  const { permissions } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [data, setData] = useState({ records: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState('');

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
    if (!data.pagination) {
      return;
    }

    fetchVehicles(filters);
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
    await fetchVehicles(filters);
  };

  const handleReset = async () => {
    setFilters(initialFilters);
    await fetchVehicles(initialFilters);
  };

  const runAction = async (callback, message) => {
    setActionState(message);
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
    const confirmed = window.confirm('Delete this vehicle and all linked documents?');
    if (!confirmed) {
      return;
    }

    await runAction(() => deleteVehicle(vehicleId), 'Deleting vehicle...');
  };

  if (loading && !data.pagination) {
    return <Loader label="Loading vehicles..." />;
  }

  return (
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
          {canAssign ? (
            <Link to="/vehicle-assignments" className={styles.secondaryLink}>
              Assignments
            </Link>
          ) : null}
          {canCreate ? (
            <Link to="/vehicles/new" className={styles.primaryLink}>
              Add Vehicle
            </Link>
          ) : null}
        </div>
      </div>

      <form className={styles.filterCard} onSubmit={handleSearch}>
        <div className={styles.filterGrid}>
          <label className={styles.field}>
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
            <select name="vehicle_type_id" value={filters.vehicle_type_id} onChange={handleFilterChange}>
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
                <th>Vehicle Number</th>
                <th>Vehicle Type</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.records.length === 0 ? (
                <tr>
                  <td colSpan="9" className={styles.emptyState}>
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
                      {canUpdate ? (
                        <select
                          className={styles.inlineSelect}
                          value={vehicle.availability_status}
                          onChange={(event) =>
                            runAction(
                              () => updateVehicleAvailability(vehicle.id, event.target.value),
                              'Updating availability...'
                            )
                          }
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                        </select>
                      ) : (
                        vehicle.availability_status
                      )}
                    </td>
                    <td>
                      <div className={styles.actionStack}>
                        <Link to={`/vehicles/${vehicle.id}`} className={styles.textLink}>
                          View
                        </Link>
                        {canUpdate ? (
                          <Link to={`/vehicles/${vehicle.id}/edit`} className={styles.textLink}>
                            Edit
                          </Link>
                        ) : null}
                        <Link to={`/vehicles/${vehicle.id}/documents`} className={styles.textLink}>
                          Documents
                        </Link>
                        {canAssign ? (
                          <Link to="/vehicle-assignments" className={styles.textLink}>
                            Assign
                          </Link>
                        ) : null}
                        {canVerify && vehicle.verification_status !== 'VERIFIED' ? (
                          <button
                            type="button"
                            className={styles.textButton}
                            onClick={() =>
                              runAction(
                                () => verifyVehicle(vehicle.id, 'VERIFIED'),
                                'Verifying vehicle...'
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
                                  updateVehicleStatus(
                                    vehicle.id,
                                    vehicle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                  ),
                                'Updating status...'
                              )
                            }
                          >
                            {vehicle.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => handleDelete(vehicle.id)}
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

export default VehicleList;
