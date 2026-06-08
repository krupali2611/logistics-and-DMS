import { useEffect, useState } from 'react';
import ActionIcon from '../../components/ActionIcon/ActionIcon';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  createPricingRule,
  deletePricingRule,
  getPricingRules,
  updatePricingRule
} from '../../api/pricingApi';
import { getVehicleTypes } from '../../api/vehicleApi';
import styles from '../../styles/Shipment.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const initialForm = {
  vehicle_type_id: '',
  base_fare: '',
  per_km_rate: '',
  per_kg_rate: '',
  minimum_fare: '',
  status: 'ACTIVE'
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0));

const PricingRules = () => {
  const { permissions } = useAuth();
  const [pricingRules, setPricingRules] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canCreate = permissions.includes('pricing_create');
  const canUpdate = permissions.includes('pricing_update');
  const canDelete = permissions.includes('pricing_delete');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [pricingResponse, vehicleTypeResponse] = await Promise.all([
        getPricingRules(),
        getVehicleTypes({ status: 'ACTIVE' })
      ]);
      setPricingRules(pricingResponse);
      setVehicleTypes(vehicleTypeResponse);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load pricing rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      if (editingId) {
        await updatePricingRule(editingId, form);
      } else {
        await createPricingRule(form);
      }

      resetForm();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save pricing rule.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pricingRule) => {
    setEditingId(pricingRule.id);
    setForm({
      vehicle_type_id: pricingRule.vehicle_type_id,
      base_fare: pricingRule.base_fare,
      per_km_rate: pricingRule.per_km_rate,
      per_kg_rate: pricingRule.per_kg_rate,
      minimum_fare: pricingRule.minimum_fare,
      status: pricingRule.status
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pricing rule?')) {
      return;
    }

    setSaving(true);
    try {
      await deletePricingRule(id);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete pricing rule.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading pricing rules..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Pricing Engine</span>
          <h2 className={styles.pageTitle}>Pricing Rules</h2>
          <p className={styles.pageCopy}>
            Manage vehicle-level fare configuration used by shipment estimation and future assignment workflows.
          </p>
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      {canCreate || editingId ? (
        <form className={styles.formCard} onSubmit={handleSubmit} {...getFormValidationProps()}>
          <div className={styles.cardHeader}>
            <h3>{editingId ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</h3>
            <p>Each vehicle type supports one production rule at a time.</p>
          </div>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Vehicle Type</span>
              <select
                name="vehicle_type_id"
                value={form.vehicle_type_id}
                onChange={handleChange}
                required
                disabled={Boolean(editingId)}
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map((vehicleType) => (
                  <option key={vehicleType.id} value={vehicleType.id}>
                    {vehicleType.type_name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Base Fare</span>
              <input
                type="number"
                name="base_fare"
                min="0"
                step="0.01"
                value={form.base_fare}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Per KM Rate</span>
              <input
                type="number"
                name="per_km_rate"
                min="0"
                step="0.01"
                value={form.per_km_rate}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Per KG Rate</span>
              <input
                type="number"
                name="per_kg_rate"
                min="0"
                step="0.01"
                value={form.per_kg_rate}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Minimum Fare</span>
              <input
                type="number"
                name="minimum_fare"
                min="0"
                step="0.01"
                value={form.minimum_fare}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
          </div>
          <div className={styles.submitRow}>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Rule' : 'Create Rule'}
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
                <th>Vehicle Type</th>
                <th>Base Fare</th>
                <th>Per KM</th>
                <th>Per KG</th>
                <th>Minimum Fare</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pricingRules.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.emptyState}>
                    No pricing rules available.
                  </td>
                </tr>
              ) : (
                pricingRules.map((pricingRule) => (
                  <tr key={pricingRule.id}>
                    <td>{pricingRule.vehicle_type?.type_name || 'Unknown vehicle type'}</td>
                    <td>{formatCurrency(pricingRule.base_fare)}</td>
                    <td>{formatCurrency(pricingRule.per_km_rate)}</td>
                    <td>{formatCurrency(pricingRule.per_kg_rate)}</td>
                    <td>{formatCurrency(pricingRule.minimum_fare)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[pricingRule.status.toLowerCase()] || styles.draft}`}>
                        {pricingRule.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionStack}>
                        {canUpdate ? (
                          <button
                            type="button"
                            className={styles.actionIconButton}
                            title="Edit pricing rule"
                            aria-label="Edit pricing rule"
                            onClick={() => handleEdit(pricingRule)}
                          >
                            <ActionIcon name="edit" />
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            className={styles.actionIconDanger}
                            title="Delete pricing rule"
                            aria-label="Delete pricing rule"
                            onClick={() => handleDelete(pricingRule.id)}
                          >
                            <ActionIcon name="delete" />
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

export default PricingRules;
