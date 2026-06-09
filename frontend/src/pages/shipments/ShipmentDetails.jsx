import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import ShipmentRoutePreview from '../../components/shipments/ShipmentRoutePreview';
import ShipmentTimeline from '../../components/shipments/ShipmentTimeline';
import { cancelShipment, getShipmentById } from '../../api/shipmentApi';
import { getFileUrl } from '../../utils/fileHelpers';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Shipment.module.css';

const EDITABLE_SHIPMENT_STATUSES = ['DRAFT', 'PENDING_ASSIGNMENT'];
const CANCELLABLE_SHIPMENT_STATUSES = ['DRAFT', 'PENDING_ASSIGNMENT', 'ASSIGNED'];

const formatAddress = (location) => {
  if (!location) {
    return 'Not available';
  }

  return (
    location.address ||
    [
      location.saved_address?.formatted_address,
      location.city,
      location.state,
      location.country,
      location.pincode
    ]
      .filter(Boolean)
      .join(', ')
  );
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0));

const formatDistance = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0 ? `${Number(value).toFixed(1)} KM` : 'Pending';

const formatDuration = (value) => {
  const totalMinutes = Math.round(Number(value || 0));
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return 'Pending';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} Hr ${minutes} Min`;
  }

  if (hours > 0) {
    return `${hours} Hr`;
  }

  return `${minutes} Min`;
};

const formatEta = (value) => {
  if (!value) {
    return 'Pending';
  }

  const eta = new Date(value);
  if (Number.isNaN(eta.getTime())) {
    return 'Pending';
  }

  const now = new Date();
  const sameDay =
    eta.getFullYear() === now.getFullYear() &&
    eta.getMonth() === now.getMonth() &&
    eta.getDate() === now.getDate();

  return `${sameDay ? 'Today' : eta.toLocaleDateString()} ${eta.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
};

const ShipmentDetails = () => {
  const { id } = useParams();
  const { permissions } = useAuth();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState('');

  const loadShipment = async () => {
    setLoading(true);
    setError('');

    try {
      setShipment(await getShipmentById(id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load shipment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipment();
  }, [id]);

  const totalDeclaredValue = useMemo(
    () =>
      (shipment?.packages || []).reduce(
        (sum, pkg) => sum + Number(pkg.declared_value || 0) * Number(pkg.quantity || 1),
        0
      ),
    [shipment]
  );
  const fareEstimation = shipment?.fare_estimation || shipment?.fareEstimation || null;
  const vehicleType = shipment?.vehicle_type || shipment?.vehicleType || null;
  const customer = shipment?.customer || null;
  const pickupLocation = shipment?.pickup_location || null;
  const deliveryLocation = shipment?.delivery_location || null;
  const route = shipment?.route || null;
  const statusHistory = shipment?.status_history || shipment?.statusHistory || [];
  const attachments = shipment?.attachments || [];
  const packages = shipment?.packages || [];
  const canEditShipment =
    permissions.includes('shipment_update') && EDITABLE_SHIPMENT_STATUSES.includes(shipment?.status);
  const canCancelShipment =
    permissions.includes('shipment_cancel') && CANCELLABLE_SHIPMENT_STATUSES.includes(shipment?.status);

  const handleCancelShipment = async () => {
    const reason = window.prompt(
      'Cancellation reason:',
      shipment?.cancellation_reason || 'Shipment cancelled from shipment details.'
    );

    if (reason === null) {
      return;
    }

    setActionState('Cancelling shipment...');
    setError('');

    try {
      await cancelShipment(id, reason);
      await loadShipment();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to cancel shipment.');
    } finally {
      setActionState('');
    }
  };

  if (loading) {
    return <Loader label="Loading shipment details..." />;
  }

  if (error) {
    return <div className={styles.errorBox}>{error}</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Shipment Details</span>
          <h2 className={styles.pageTitle}>{shipment.shipment_number}</h2>
          <p className={styles.pageCopy}>
            {customer?.company_name || 'Unknown customer'} - {shipment.status}
          </p>
        </div>
        <div className={styles.linkGroup}>
          {canEditShipment ? (
            <Link to={`/shipments/${id}/edit`} className={styles.secondaryLink}>
              Edit Shipment
            </Link>
          ) : null}
          {canCancelShipment ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancelShipment}
              disabled={Boolean(actionState)}
            >
              Cancel Shipment
            </button>
          ) : null}
          <Link to={`/shipments/${id}/timeline`} className={styles.secondaryLink}>
            Timeline
          </Link>
          <Link to={`/shipments/${id}/attachments`} className={styles.primaryLink}>
            Attachments
          </Link>
        </div>
      </div>

      {actionState ? <div className={styles.statusText}>{actionState}</div> : null}
      <div className={styles.detailGrid}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Shipment Overview</h3>
          </div>
          <div className={styles.infoGridCompact}>
            <div><strong>Customer:</strong> {customer?.company_name || 'N/A'}</div>
            <div><strong>Contact:</strong> {customer?.contact_person || 'N/A'}</div>
            <div><strong>Phone:</strong> {customer?.phone || 'N/A'}</div>
            <div><strong>Vehicle Type:</strong> {vehicleType?.type_name || 'N/A'}</div>
            <div><strong>Shipment Type:</strong> {shipment.shipment_type}</div>
            <div><strong>Priority:</strong> {shipment.priority}</div>
            <div><strong>Status:</strong> {shipment.status}</div>
            <div><strong>Cancellation Reason:</strong> {shipment.cancellation_reason || 'Not cancelled'}</div>
            <div>
              <strong>Estimated Delivery:</strong>{' '}
              {shipment.estimated_delivery_date
                ? new Date(shipment.estimated_delivery_date).toLocaleDateString()
                : 'Not set'}
            </div>
            <div><strong>Estimated Distance:</strong> {formatDistance(shipment.estimated_distance)}</div>
            <div><strong>Route Distance:</strong> {formatDistance(route?.distance_km || shipment.route_distance_km)}</div>
            <div><strong>ETA:</strong> {formatEta(route?.estimated_eta || shipment.estimated_eta)}</div>
            <div><strong>Created:</strong> {new Date(shipment.created_at).toLocaleString()}</div>
            <div>
              <strong>Cancelled At:</strong>{' '}
              {shipment.cancelled_at ? new Date(shipment.cancelled_at).toLocaleString() : 'Not cancelled'}
            </div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Route Addresses</h3>
          </div>
          <div className={styles.addressPair}>
            <div className={styles.summaryCard}>
              <strong>Pickup</strong>
              <span>{formatAddress(pickupLocation)}</span>
            </div>
            <div className={styles.summaryCard}>
              <strong>Delivery</strong>
              <span>{formatAddress(deliveryLocation)}</span>
            </div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Shipment Metrics</h3>
          </div>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <strong>{shipment.package_count}</strong>
              <span>Total Package Units</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{shipment.total_weight}</strong>
              <span>Total Weight</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{shipment.total_volume}</strong>
              <span>Total Volume</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{totalDeclaredValue.toFixed(2)}</strong>
              <span>Declared Value</span>
            </div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Fare Summary</h3>
          </div>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <strong>{formatDistance(fareEstimation?.distance_km || shipment.estimated_distance)}</strong>
              <span>Distance (km)</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{formatCurrency(fareEstimation?.base_fare || 0)}</strong>
              <span>Base Fare</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{formatCurrency(fareEstimation?.distance_charge || 0)}</strong>
              <span>Distance Charge</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{formatCurrency(fareEstimation?.weight_charge || 0)}</strong>
              <span>Weight Charge</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{formatCurrency(fareEstimation?.fare_breakdown?.minimum_fare || 0)}</strong>
              <span>Minimum Fare</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{formatCurrency(fareEstimation?.final_amount || 0)}</strong>
              <span>Final Amount</span>
            </div>
          </div>
          <div className={styles.documentSummary}>
            <div className={styles.summaryCard}>
              <strong>Pricing Debug</strong>
              <span>Distance Source: {fareEstimation?.debug?.distance_source || route?.provider || 'Not available'}</span>
              <span>Vehicle Type: {fareEstimation?.debug?.vehicle_type || vehicleType?.type_name || 'Not available'}</span>
              <span>Pricing Rule: {fareEstimation?.debug?.pricing_rule_id || fareEstimation?.pricing_rule?.id || 'Not available'}</span>
              <span>Formula: {fareEstimation?.debug?.formula || 'Not available'}</span>
            </div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Route Preview</h3>
          </div>
          <div className={styles.infoGridCompact}>
            <div><strong>Distance:</strong> {formatDistance(route?.distance_km)}</div>
            <div><strong>Duration:</strong> {formatDuration(route?.duration_minutes)}</div>
            <div><strong>ETA:</strong> {formatEta(route?.estimated_eta)}</div>
            <div><strong>Provider:</strong> {route?.provider || 'Not available'}</div>
          </div>
          <ShipmentRoutePreview
            pickup={pickupLocation}
            delivery={deliveryLocation}
            route={route}
            subtitle="Stored route geometry is shown for admin review and future tracking compatibility."
          />
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Special Instructions</h3>
          </div>
          <p className={styles.pageCopyAlt}>
            {shipment.special_instructions || 'No special instructions provided.'}
          </p>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Packages</h3>
            <p>{packages.length} records linked</p>
          </div>
          <div className={styles.documentSummary}>
            {packages.map((pkg) => (
              <div key={pkg.id} className={styles.summaryCard}>
                <strong>{pkg.package_name}</strong>
                <span>{pkg.package_type}</span>
                <span>
                  Qty {pkg.quantity} | {pkg.weight} kg each | {pkg.length} x {pkg.width} x {pkg.height}
                </span>
                <span>Declared value: {pkg.declared_value || '0'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Recent Timeline</h3>
            <p>{statusHistory.length} status records</p>
          </div>
          <ShipmentTimeline items={statusHistory.slice(-5)} />
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Attachments</h3>
            <p>{attachments.length} files linked</p>
          </div>
          <div className={styles.documentSummary}>
            {attachments.length === 0 ? (
              <p className={styles.pageCopy}>No attachments uploaded yet.</p>
            ) : (
              attachments.map((attachment) => (
                <div key={attachment.id} className={styles.summaryCard}>
                  <strong>{attachment.file_name}</strong>
                  <span>{attachment.file_type}</span>
                  <a href={getFileUrl(attachment.file_path)} target="_blank" rel="noreferrer" className={styles.textLink}>
                    Open attachment
                  </a>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShipmentDetails;
