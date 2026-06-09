import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../../styles/Shipment.module.css';

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

const createMarkerIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<span style="display:block;width:18px;height:18px;border-radius:999px;background:${color};border:3px solid #ffffff;box-shadow:0 10px 18px rgba(0,0,0,0.28);"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

const normalizeLatLng = (point) => {
  const latitude = Number(point?.latitude);
  const longitude = Number(point?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return [latitude, longitude];
};

const MapEventBinder = ({ enabled, onMapClick }) => {
  useMapEvents({
    click(event) {
      if (!enabled || !onMapClick) {
        return;
      }

      onMapClick({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng
      });
    }
  });

  return null;
};

const MapViewport = ({ markers, routePoints }) => {
  const map = useMap();

  const bounds = useMemo(() => {
    const allPoints = [...markers, ...routePoints].filter(Boolean);
    return allPoints.length > 0 ? L.latLngBounds(allPoints) : null;
  }, [markers, routePoints]);

  useEffect(() => {
    if (!bounds) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (bounds.isValid()) {
      if (markers.length + routePoints.length === 1) {
        map.setView(bounds.getCenter(), 14);
      } else {
        map.fitBounds(bounds, {
          padding: [24, 24]
        });
      }
    }
  }, [bounds, map, markers.length, routePoints.length]);

  return null;
};

const LeafletMap = ({
  markers = [],
  routeGeometry = null,
  onMapClick,
  onMarkerDragEnd,
  className = '',
  emptyMessage = 'Map is loading...',
  readOnly = false
}) => {
  const routePoints = useMemo(() => {
    if (routeGeometry?.type !== 'LineString' || !Array.isArray(routeGeometry.coordinates)) {
      return [];
    }

    return routeGeometry.coordinates
      .map(([longitude, latitude]) => [Number(latitude), Number(longitude)])
      .filter(([latitude, longitude]) => Number.isFinite(latitude) && Number.isFinite(longitude));
  }, [routeGeometry]);

  const markerPoints = useMemo(
    () => markers.map((marker) => normalizeLatLng(marker.position)).filter(Boolean),
    [markers]
  );

  const hasRenderableContent = markerPoints.length > 0 || routePoints.length > 0;

  return (
    <div className={`${styles.leafletMapShell} ${className}`.trim()}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className={styles.leafletMapCanvas}
        scrollWheelZoom={!readOnly}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventBinder enabled={!readOnly} onMapClick={onMapClick} />
        <MapViewport markers={markerPoints} routePoints={routePoints} />

        {routePoints.length > 1 ? (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: '#1b5f96',
              weight: 4,
              opacity: 0.85
            }}
          />
        ) : null}

        {markers.map((marker) => {
          const latLng = normalizeLatLng(marker.position);
          if (!latLng) {
            return null;
          }

          return (
            <Marker
              key={marker.id}
              position={latLng}
              draggable={Boolean(marker.draggable && onMarkerDragEnd)}
              icon={createMarkerIcon(marker.color || '#1f8a76')}
              eventHandlers={
                marker.draggable && onMarkerDragEnd
                  ? {
                      dragend(event) {
                        const point = event.target.getLatLng();
                        onMarkerDragEnd(marker.id, {
                          latitude: point.lat,
                          longitude: point.lng
                        });
                      }
                    }
                  : undefined
              }
            >
              {marker.label ? <Tooltip direction="top">{marker.label}</Tooltip> : null}
            </Marker>
          );
        })}
      </MapContainer>

      {!hasRenderableContent ? <div className={styles.mapOverlayHint}>{emptyMessage}</div> : null}
    </div>
  );
};

export default LeafletMap;
