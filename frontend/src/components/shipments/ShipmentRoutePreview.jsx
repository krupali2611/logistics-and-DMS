import LeafletMap from './LeafletMap';
import styles from '../../styles/Shipment.module.css';

const ShipmentRoutePreview = ({
  pickup,
  delivery,
  route,
  title = 'Route Preview',
  subtitle = 'Pickup, delivery, and the calculated path appear here.'
}) => {
  const hasPickupCoordinates =
    Number.isFinite(Number(pickup?.latitude)) && Number.isFinite(Number(pickup?.longitude));
  const hasDeliveryCoordinates =
    Number.isFinite(Number(delivery?.latitude)) && Number.isFinite(Number(delivery?.longitude));

  const markers = [
    hasPickupCoordinates
      ? {
          id: 'pickup',
          label: 'Pickup',
          position: pickup,
          color: '#1f8a76'
        }
      : null,
    hasDeliveryCoordinates
      ? {
          id: 'delivery',
          label: 'Delivery',
          position: delivery,
          color: '#c3472e'
        }
      : null
  ].filter(Boolean);

  return (
    <div className={styles.mapPickerCard}>
      <div className={styles.mapPickerHeader}>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <LeafletMap
        markers={markers}
        routeGeometry={route?.geometry || null}
        readOnly
        emptyMessage="Loading route map..."
      />
    </div>
  );
};

export default ShipmentRoutePreview;
