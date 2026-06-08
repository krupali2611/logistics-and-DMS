import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import ShipmentTimeline from '../../components/shipments/ShipmentTimeline';
import {
  cancelShipment,
  getShipmentById,
  updateShipmentStatus
} from '../../api/shipmentApi';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Shipment.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const initialForm = {
  status: 'PENDING_ASSIGNMENT',
  remarks: ''
};

const ShipmentTimelinePage = () => {
  const { id } = useParams();
  const { permissions } = useAuth();
  const [shipment, setShipment] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canUpdateStatus = permissions.includes('shipment_status_update');
  const canCancel = permissions.includes('shipment_cancel');

  const loadShipment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getShipmentById(id);
      setShipment(response);
      setForm((current) => ({
        ...current,
        status: response.status
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load shipment timeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipment();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleStatusSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm(event.currentTarget)) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateShipmentStatus(id, form.status, form.remarks || undefined);
      setForm((current) => ({ ...current, remarks: '' }));
      await loadShipment();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update shipment status.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    const remarks = window.prompt('Optional cancellation remarks:', 'Shipment cancelled from timeline view.');

    if (remarks === null) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await cancelShipment(id, remarks);
      await loadShipment();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to cancel shipment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading shipment timeline..." />;
  }

  const timelineOptions = [
    'DRAFT',
    'PENDING_ASSIGNMENT',
    'ASSIGNED',
    'PICKUP_STARTED',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'FAILED'
  ];

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Shipment Timeline</span>
          <h2 className={styles.pageTitle}>{shipment.shipment_number}</h2>
          <p className={styles.pageCopy}>Current status: {shipment.status}</p>
        </div>
        <div className={styles.linkGroup}>
          <Link to={`/shipments/${id}`} className={styles.secondaryLink}>
            Shipment Details
          </Link>
          <Link to="/shipments" className={styles.secondaryLink}>
            Shipment List
          </Link>
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <div className={styles.detailGridSingle}>
        {(canUpdateStatus || canCancel) && shipment.status !== 'DELIVERED' ? (
          <form className={styles.formCard} onSubmit={handleStatusSubmit} {...getFormValidationProps()}>
            <div className={styles.cardHeader}>
              <h3>Status Controls</h3>
              <p>Every change is persisted into shipment status history.</p>
            </div>

            <div className={styles.formGridCompact}>
              <label className={styles.field}>
                <span>New Status</span>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={!canUpdateStatus || shipment.status === 'CANCELLED'}
                  required
                >
                  {timelineOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>Remarks</span>
                <textarea
                  rows="3"
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  placeholder="Optional note for operations audit trail"
                />
              </label>
            </div>

            <div className={styles.submitRow}>
              {canUpdateStatus ? (
                <Button type="submit" disabled={saving || shipment.status === 'CANCELLED'}>
                  {saving ? 'Saving Status...' : 'Update Status'}
                </Button>
              ) : null}
              {canCancel && shipment.status !== 'CANCELLED' ? (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel Shipment
                </button>
              ) : null}
            </div>
          </form>
        ) : null}

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Full Timeline</h3>
            <p>{shipment.statusHistory.length} events</p>
          </div>
          <ShipmentTimeline items={shipment.statusHistory} />
        </section>
      </div>
    </div>
  );
};

export default ShipmentTimelinePage;
