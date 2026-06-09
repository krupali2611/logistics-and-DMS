import LeafletMap from './LeafletMap';
import styles from '../../styles/Shipment.module.css';

const ShipmentBookingMap = ({
  pickup,
  delivery,
  route,
  activeTarget,
  onActiveTargetChange,
  onMapPointSelect,
  onMarkerDragEnd,
  disabled = false,
  statusText = ''
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
          draggable: !disabled,
          color: '#1f8a76'
        }
      : null,
    hasDeliveryCoordinates
      ? {
          id: 'delivery',
          label: 'Delivery',
          position: delivery,
          draggable: !disabled,
          color: '#c3472e'
        }
      : null
  ].filter(Boolean);

  return (
    <div className={styles.mapPickerCard}>
      <div className={styles.mapPickerHeader}>
        <strong>Shipment Map</strong>
        <span>Use one shared map for both points. Click to place the active pin or drag markers to refine the route.</span>
      </div>

      <div className={styles.mapTargetToolbar}>
        <button
          type="button"
          className={`${styles.mapTargetButton} ${activeTarget === 'pickup' ? styles.mapTargetButtonActive : ''}`.trim()}
          onClick={() => onActiveTargetChange('pickup')}
          disabled={disabled}
        >
          Pin Pickup
        </button>
        <button
          type="button"
          className={`${styles.mapTargetButton} ${activeTarget === 'delivery' ? styles.mapTargetButtonActive : ''}`.trim()}
          onClick={() => onActiveTargetChange('delivery')}
          disabled={disabled}
        >
          Pin Delivery
        </button>
        <span className={styles.locationHint}>
          {statusText || `Map clicks will place the ${activeTarget === 'delivery' ? 'delivery' : 'pickup'} marker.`}
        </span>
      </div>

      <div className={styles.mapFrameShell}>
        <LeafletMap
          markers={markers}
          routeGeometry={route?.geometry || null}
          onMapClick={
            disabled
              ? undefined
              : (point) => {
                  onMapPointSelect(activeTarget, point);
                }
          }
          onMarkerDragEnd={disabled ? undefined : onMarkerDragEnd}
          emptyMessage="Choose a pickup and delivery point to see the live route."
        />
      </div>
    </div>
  );
};

export default ShipmentBookingMap;
