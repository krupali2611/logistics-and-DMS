import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ActionIcon from '../../components/ActionIcon/ActionIcon';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  createVehicleType,
  getVehicleTypes,
  updateVehicleType
} from '../../api/vehicleApi';
import styles from '../../styles/Vehicle.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const initialForm = {
  type_name: '',
  description: '',
  min_capacity: '',
  max_capacity: '',
  status: 'ACTIVE'
};

const VehicleTypeList = () => {
  const { permissions } = useAuth();
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canCreate = permissions.includes('vehicle_create');
  const canUpdate = permissions.includes('vehicle_update');

  const loadVehicleTypes = async () => {
    setLoading(true);
    setError('');

    try {
      setVehicleTypes(await getVehicleTypes());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load vehicle types.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicleTypes();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId('');
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
        ...form,
        min_capacity: form.min_capacity || undefined,
        max_capacity: form.max_capacity || undefined
      };

      if (editingId) {
        await updateVehicleType(editingId, payload);
      } else {
        await createVehicleType(payload);
      }

      resetForm();
      await loadVehicleTypes();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save vehicle type.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (vehicleType) => {
    setEditingId(vehicleType.id);
    setForm({
      type_name: vehicleType.type_name,
      description: vehicleType.description || '',
      min_capacity: vehicleType.min_capacity || '',
      max_capacity: vehicleType.max_capacity || '',
      status: vehicleType.status
    });
  };

  const handleToggleStatus = async (vehicleType) => {
    setSaving(true);
    setError('');

    try {
      await updateVehicleType(vehicleType.id, {
        status: vehicleType.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      });
      await loadVehicleTypes();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update vehicle type status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading vehicle types..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Vehicle Management</span>
          <h2 className={styles.pageTitle}>Vehicle Type Catalog</h2>
          <p className={styles.pageCopy}>
            Maintain the master capacity buckets used by booking, assignment, and automation flows.
          </p>
        </div>
        <div className={styles.linkGroup}>
          <Link to="/vehicles" className={styles.secondaryLink}>
            Back
          </Link>
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      {canCreate || editingId ? (
        <form className={styles.formCard} onSubmit={handleSubmit} {...getFormValidationProps()}>
          <div className={styles.cardHeader}>
            <h3>{editingId ? 'Update Vehicle Type' : 'Add Vehicle Type'}</h3>
          </div>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Type Name</span>
              <input name="type_name" value={form.type_name} onChange={handleChange} required />
            </label>
            <label className={styles.field}>
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>Min Capacity</span>
              <input
                name="min_capacity"
                type="number"
                min="0"
                step="0.01"
                value={form.min_capacity}
                onChange={handleChange}
              />
            </label>
            <label className={styles.field}>
              <span>Max Capacity</span>
              <input
                name="max_capacity"
                type="number"
                min="0"
                step="0.01"
                value={form.max_capacity}
                onChange={handleChange}
              />
            </label>
            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Description</span>
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className={styles.submitRow}>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Type' : 'Create Type'}
            </Button>
            {editingId ? (
              <button type="button" className={styles.secondaryButton} onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      <section className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Min Capacity</th>
                <th>Max Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicleTypes.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.emptyState}>
                    No vehicle types available.
                  </td>
                </tr>
              ) : (
                vehicleTypes.map((vehicleType) => (
                  <tr key={vehicleType.id}>
                    <td>{vehicleType.type_name}</td>
                    <td>{vehicleType.description || 'No description'}</td>
                    <td>{vehicleType.min_capacity || 'N/A'}</td>
                    <td>{vehicleType.max_capacity || 'N/A'}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[vehicleType.status.toLowerCase()]}`}>
                        {vehicleType.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionStack}>
                        {canUpdate ? (
                          <button
                            type="button"
                            className={styles.actionIconButton}
                            title="Edit vehicle type"
                            aria-label="Edit vehicle type"
                            onClick={() => handleEdit(vehicleType)}
                          >
                            <ActionIcon name="edit" />
                          </button>
                        ) : null}
                        {canUpdate ? (
                          <button
                            type="button"
                            className={styles.actionIconButton}
                            title={
                              vehicleType.status === 'ACTIVE'
                                ? 'Mark vehicle type inactive'
                                : 'Mark vehicle type active'
                            }
                            aria-label={
                              vehicleType.status === 'ACTIVE'
                                ? 'Mark vehicle type inactive'
                                : 'Mark vehicle type active'
                            }
                            onClick={() => handleToggleStatus(vehicleType)}
                          >
                            <ActionIcon
                              name={vehicleType.status === 'ACTIVE' ? 'deactivate' : 'activate'}
                            />
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
      </section>
    </div>
  );
};

export default VehicleTypeList;
