import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import ShipmentTimeline from '../../components/shipments/ShipmentTimeline';
import { getShipmentById } from '../../api/shipmentApi';
import { getFileUrl } from '../../utils/fileHelpers';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Shipment.module.css';

const formatAddress = (address) => {
  if (!address) {
    return 'Not available';
  }

  return [
    address.address_line_1,
    address.address_line_2,
    address.landmark,
    address.city,
    address.state,
    address.country,
    address.pincode
  ]
    .filter(Boolean)
    .join(', ');
};

const ShipmentDetails = () => {
  const { id } = useParams();
  const { permissions } = useAuth();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
            {shipment.customer?.company_name || 'Unknown customer'} - {shipment.status}
          </p>
        </div>
        <div className={styles.linkGroup}>
          {permissions.includes('shipment_update') && shipment.status !== 'DELIVERED' ? (
            <Link to={`/shipments/${id}/edit`} className={styles.secondaryLink}>
              Edit Shipment
            </Link>
          ) : null}
          <Link to={`/shipments/${id}/timeline`} className={styles.secondaryLink}>
            Timeline
          </Link>
          <Link to={`/shipments/${id}/attachments`} className={styles.primaryLink}>
            Attachments
          </Link>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Shipment Overview</h3>
          </div>
          <div className={styles.infoGridCompact}>
            <div><strong>Customer:</strong> {shipment.customer?.company_name || 'N/A'}</div>
            <div><strong>Contact:</strong> {shipment.customer?.contact_person || 'N/A'}</div>
            <div><strong>Phone:</strong> {shipment.customer?.phone || 'N/A'}</div>
            <div><strong>Vehicle Type:</strong> {shipment.vehicleType?.type_name || 'N/A'}</div>
            <div><strong>Shipment Type:</strong> {shipment.shipment_type}</div>
            <div><strong>Priority:</strong> {shipment.priority}</div>
            <div><strong>Status:</strong> {shipment.status}</div>
            <div>
              <strong>Estimated Delivery:</strong>{' '}
              {shipment.estimated_delivery_date
                ? new Date(shipment.estimated_delivery_date).toLocaleDateString()
                : 'Not set'}
            </div>
            <div><strong>Estimated Distance:</strong> {shipment.estimated_distance || '0'} km</div>
            <div><strong>Created:</strong> {new Date(shipment.created_at).toLocaleString()}</div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Route Addresses</h3>
          </div>
          <div className={styles.addressPair}>
            <div className={styles.summaryCard}>
              <strong>Pickup</strong>
              <span>{formatAddress(shipment.pickupAddress)}</span>
            </div>
            <div className={styles.summaryCard}>
              <strong>Delivery</strong>
              <span>{formatAddress(shipment.deliveryAddress)}</span>
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
            <h3>Special Instructions</h3>
          </div>
          <p className={styles.pageCopyAlt}>
            {shipment.special_instructions || 'No special instructions provided.'}
          </p>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Packages</h3>
            <p>{shipment.packages.length} records linked</p>
          </div>
          <div className={styles.documentSummary}>
            {shipment.packages.map((pkg) => (
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
            <p>{shipment.statusHistory.length} status records</p>
          </div>
          <ShipmentTimeline items={shipment.statusHistory.slice(-5)} />
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Attachments</h3>
            <p>{shipment.attachments.length} files linked</p>
          </div>
          <div className={styles.documentSummary}>
            {shipment.attachments.length === 0 ? (
              <p className={styles.pageCopy}>No attachments uploaded yet.</p>
            ) : (
              shipment.attachments.map((attachment) => (
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
