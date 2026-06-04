import { useEffect, useState } from 'react';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { getDrivers } from '../../api/driverApi';
import {
  assignVehicle,
  getVehicleAssignments,
  getVehicles,
  removeVehicleAssignment
} from '../../api/vehicleApi';
import styles from '../../styles/Vehicle.module.css';

const initialFilters = {
  status: 'ACTIVE',
  page: 1,
  limit: 10
};

const initialForm = {
  driver_id: '',
  vehicle_id: ''
};

const VehicleAssignments = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [form, setForm] = useState(initialForm);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [data, setData] = useState({ records: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadAssignmentOptions = async () => {
    const [driverResponse, vehicleResponse] = await Promise.all([
      getDrivers({
        verification_status: 'VERIFIED',
        page: 1,
        limit: 100
      }),
      getVehicles({
        verification_status: 'VERIFIED',
        availability_status: 'AVAILABLE',
        page: 1,
        limit: 100
      })
    ]);

    setDrivers(driverResponse.records);
    setVehicles(vehicleResponse.records);
  };

  const loadAssignments = async (currentFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      setData(await getVehicleAssignments(currentFilters));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load vehicle assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadAssignmentOptions(), loadAssignments(filters)]);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load assignment data.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!data.pagination) {
      return;
    }

    loadAssignments(filters);
  }, [filters.page, filters.limit, filters.status]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await assignVehicle(form);
      setForm(initialForm);
      await Promise.all([loadAssignmentOptions(), loadAssignments(filters)]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to assign vehicle.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (assignmentId) => {
    const confirmed = window.confirm('Remove this assignment?');
    if (!confirmed) {
      return;
    }

    setSaving(true);
    try {
      await removeVehicleAssignment(assignmentId);
      await Promise.all([loadAssignmentOptions(), loadAssignments(filters)]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove assignment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data.pagination) {
    return <Loader label="Loading assignments..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Vehicle Assignment</span>
          <h2 className={styles.pageTitle}>Driver Vehicle Matching Desk</h2>
          <p className={styles.pageCopy}>
            Create one-to-one active assignments only for verified drivers and verified vehicles.
          </p>
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <div className={styles.detailGrid}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <h3>Assign Vehicle</h3>
            <p>Only available, verified vehicles and verified drivers are listed here.</p>
          </div>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Select Driver</span>
              <select name="driver_id" value={form.driver_id} onChange={handleChange} required>
                <option value="">Choose driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.driver_code} - {driver.first_name} {driver.last_name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Select Vehicle</span>
              <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required>
                <option value="">Choose vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.vehicle_number} - {vehicle.brand} {vehicle.model}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.submitRow}>
            <Button type="submit" disabled={saving}>
              {saving ? 'Assigning...' : 'Assign Vehicle'}
            </Button>
          </div>
        </form>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Current Assignments</h3>
          </div>
          <div className={styles.filterActions}>
            <label className={styles.field}>
              <span>Status</span>
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value,
                    page: 1
                  }))
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
          </div>
          <div className={styles.assignmentList}>
            {data.records.length === 0 ? (
              <p className={styles.pageCopy}>No assignments available for the selected filter.</p>
            ) : (
              data.records.map((assignment) => (
                <div key={assignment.id} className={styles.summaryCard}>
                  <strong>
                    {assignment.driver?.first_name} {assignment.driver?.last_name}
                  </strong>
                  <span>Driver Code: {assignment.driver?.driver_code}</span>
                  <span>
                    Vehicle: {assignment.vehicle?.vehicle_number} - {assignment.vehicle?.vehicleType?.type_name}
                  </span>
                  <span>Assigned At: {new Date(assignment.assigned_at).toLocaleString()}</span>
                  <span>Status: {assignment.status}</span>
                  {assignment.status === 'ACTIVE' ? (
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleRemove(assignment.id)}
                    >
                      Remove Assignment
                    </button>
                  ) : null}
                </div>
              ))
            )}
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
        </section>
      </div>
    </div>
  );
};

export default VehicleAssignments;
