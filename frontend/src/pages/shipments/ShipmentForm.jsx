import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import LocationSearchField from '../../components/shipments/LocationSearchField';
import ShipmentBookingMap from '../../components/shipments/ShipmentBookingMap';
import { getCustomers, getCustomerAddresses } from '../../api/customerApi';
import { getLocationPlaceDetails, saveLocationAddress } from '../../api/locationApi';
import { getVehicleTypes } from '../../api/vehicleApi';
import {
  createShipment,
  getShipmentById,
  previewShipmentRoute,
  updateShipment
} from '../../api/shipmentApi';
import { estimateShipmentFare } from '../../api/pricingApi';
import styles from '../../styles/Shipment.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

const EDITABLE_SHIPMENT_STATUSES = ['DRAFT', 'PENDING_ASSIGNMENT'];

const emptyPackage = () => ({
  id: '',
  package_name: '',
  package_type: '',
  weight: '',
  length: '',
  width: '',
  height: '',
  quantity: '1',
  declared_value: ''
});

const emptyLocation = () => ({
  saved_address_id: null,
  address: '',
  address_snapshot: '',
  latitude: '',
  longitude: '',
  place_id: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  saved_address: null
});

const initialForm = {
  customer_id: '',
  pickup: emptyLocation(),
  delivery: emptyLocation(),
  vehicle_type_id: '',
  shipment_type: 'PARCEL',
  priority: 'NORMAL',
  estimated_delivery_date: '',
  estimated_distance: '',
  special_instructions: '',
  status: 'DRAFT',
  packages: [emptyPackage()]
};

const mapShipmentLocationToForm = (location) => ({
  saved_address_id: location?.saved_address_id || null,
  address: location?.address || '',
  address_snapshot: location?.address_snapshot || location?.address || '',
  latitude: location?.latitude || '',
  longitude: location?.longitude || '',
  place_id: location?.place_id || '',
  city: location?.city || '',
  state: location?.state || '',
  country: location?.country || '',
  pincode: location?.pincode || '',
  saved_address: location?.saved_address || null
});

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0));

const formatDistanceLabel = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0 ? `${Number(value).toFixed(1)} KM` : 'Pending';

const formatDurationLabel = (value) => {
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

const formatEtaLabel = (value) => {
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

  const dayLabel = sameDay
    ? 'Today'
    : eta.toLocaleDateString([], {
        day: '2-digit',
        month: 'short'
      });

  const timeLabel = eta.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `${dayLabel} ${timeLabel}`;
};

const ShipmentForm = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = mode === 'edit';
  const [form, setForm] = useState(initialForm);
  const [shipment, setShipment] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [mapResolvingTarget, setMapResolvingTarget] = useState('');
  const [activeMapTarget, setActiveMapTarget] = useState('pickup');
  const [fareEstimate, setFareEstimate] = useState(null);
  const [routePreview, setRoutePreview] = useState(null);
  const [error, setError] = useState('');

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === form.customer_id) || null,
    [customers, form.customer_id]
  );
  const selectedVehicleType = useMemo(
    () => vehicleTypes.find((vehicleType) => vehicleType.id === form.vehicle_type_id) || null,
    [form.vehicle_type_id, vehicleTypes]
  );

  const totalWeight = useMemo(
    () =>
      form.packages.reduce((sum, pkg) => {
        const weight = Number(pkg.weight || 0);
        const quantity = Number(pkg.quantity || 0);
        return (
          sum +
          (Number.isFinite(weight) ? weight : 0) * (Number.isFinite(quantity) ? quantity : 0)
        );
      }, 0),
    [form.packages]
  );
  const canSubmitShipment =
    Boolean(form.vehicle_type_id) &&
    Boolean(routePreview) &&
    Boolean(fareEstimate) &&
    !routeLoading &&
    !estimateLoading &&
    !mapResolvingTarget;

  useEffect(() => {
    const loadBaseData = async () => {
      setLoading(true);
      setError('');

      try {
        const [customerResponse, vehicleTypeResponse] = await Promise.all([
          getCustomers({ page: 1, limit: 100, status: 'ACTIVE' }),
          getVehicleTypes({ status: 'ACTIVE' })
        ]);

        setCustomers(customerResponse.records);
        setVehicleTypes(vehicleTypeResponse);

        if (isEditMode && id) {
          const shipmentResponse = await getShipmentById(id);

          if (!EDITABLE_SHIPMENT_STATUSES.includes(shipmentResponse.status)) {
            throw new Error(
              `Shipment can only be edited in statuses: ${EDITABLE_SHIPMENT_STATUSES.join(', ')}.`
            );
          }

          setShipment(shipmentResponse);
          setForm({
            customer_id: shipmentResponse.customer_id,
            pickup: mapShipmentLocationToForm(shipmentResponse.pickup_location),
            delivery: mapShipmentLocationToForm(shipmentResponse.delivery_location),
            vehicle_type_id: shipmentResponse.vehicle_type_id,
            shipment_type: shipmentResponse.shipment_type,
            priority: shipmentResponse.priority,
            estimated_delivery_date: shipmentResponse.estimated_delivery_date || '',
            estimated_distance: shipmentResponse.estimated_distance || '',
            special_instructions: shipmentResponse.special_instructions || '',
            status: shipmentResponse.status,
            packages:
              shipmentResponse.packages?.length > 0
                ? shipmentResponse.packages.map((pkg) => ({
                    id: pkg.id,
                    package_name: pkg.package_name || '',
                    package_type: pkg.package_type || '',
                    weight: pkg.weight || '',
                    length: pkg.length || '',
                    width: pkg.width || '',
                    height: pkg.height || '',
                    quantity: String(pkg.quantity || 1),
                    declared_value: pkg.declared_value || ''
                  }))
                : [emptyPackage()]
          });
          setFareEstimate(shipmentResponse.fare_estimation || null);
          setRoutePreview(shipmentResponse.route || null);
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            'Unable to load shipment form data.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadBaseData();
  }, [id, isEditMode]);

  useEffect(() => {
    if (!form.customer_id) {
      setSavedAddresses([]);
      setForm((current) => ({
        ...current,
        pickup: emptyLocation(),
        delivery: emptyLocation()
      }));
      setRoutePreview(null);
      setFareEstimate(null);
      return;
    }

    const loadAddresses = async () => {
      try {
        const addresses = await getCustomerAddresses(form.customer_id);
        setSavedAddresses(addresses || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load customer addresses.');
      }
    };

    loadAddresses();
  }, [form.customer_id]);

  useEffect(() => {
    const pickupLatitude = Number(form.pickup.latitude);
    const pickupLongitude = Number(form.pickup.longitude);
    const deliveryLatitude = Number(form.delivery.latitude);
    const deliveryLongitude = Number(form.delivery.longitude);

    const canPreviewRoute =
      Number.isFinite(pickupLatitude) &&
      Number.isFinite(pickupLongitude) &&
      Number.isFinite(deliveryLatitude) &&
      Number.isFinite(deliveryLongitude);

    if (!canPreviewRoute) {
      setRouteLoading(false);
      setRoutePreview(null);
      return;
    }

    let isActive = true;

    const loadRoutePreview = async () => {
      setRouteLoading(true);

      try {
        const route = await previewShipmentRoute({
          pickup_coordinates: {
            latitude: pickupLatitude,
            longitude: pickupLongitude
          },
          delivery_coordinates: {
            latitude: deliveryLatitude,
            longitude: deliveryLongitude
          },
          vehicle_type_name: selectedVehicleType?.type_name || undefined
        });

        if (!isActive) {
          return;
        }

        setError('');
        setRoutePreview(route);
        setForm((current) => ({
          ...current,
          estimated_distance: route.distance_km || ''
        }));
      } catch (requestError) {
        if (isActive) {
          setRoutePreview(null);
          setError(requestError.response?.data?.message || 'Unable to calculate route right now.');
        }
      } finally {
        if (isActive) {
          setRouteLoading(false);
        }
      }
    };

    loadRoutePreview();

    return () => {
      isActive = false;
    };
  }, [
    form.delivery.latitude,
    form.delivery.longitude,
    form.pickup.latitude,
    form.pickup.longitude,
    selectedVehicleType?.type_name
  ]);

  useEffect(() => {
    const pickupLatitude = Number(form.pickup.latitude);
    const pickupLongitude = Number(form.pickup.longitude);
    const deliveryLatitude = Number(form.delivery.latitude);
    const deliveryLongitude = Number(form.delivery.longitude);

    const canEstimate =
      Boolean(form.vehicle_type_id) &&
      Number.isFinite(pickupLatitude) &&
      Number.isFinite(pickupLongitude) &&
      Number.isFinite(deliveryLatitude) &&
      Number.isFinite(deliveryLongitude) &&
      totalWeight > 0;

    if (!canEstimate) {
      setEstimateLoading(false);
      setFareEstimate(null);
      return;
    }

    let isActive = true;

    const loadEstimate = async () => {
      setEstimateLoading(true);

      try {
        const estimation = await estimateShipmentFare({
          vehicle_type_id: form.vehicle_type_id,
          weight: totalWeight,
          pickup_coordinates: {
            latitude: pickupLatitude,
            longitude: pickupLongitude
          },
          delivery_coordinates: {
            latitude: deliveryLatitude,
            longitude: deliveryLongitude
          }
        });

        if (!isActive) {
          return;
        }

        setError('');
        setFareEstimate(estimation);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setFareEstimate(null);
        setError(
          requestError.response?.data?.message || 'Unable to estimate shipment fare right now.'
        );
      } finally {
        if (isActive) {
          setEstimateLoading(false);
        }
      }
    };

    loadEstimate();

    return () => {
      isActive = false;
    };
  }, [
    form.delivery.latitude,
    form.delivery.longitude,
    form.pickup.latitude,
    form.pickup.longitude,
    form.vehicle_type_id,
    totalWeight
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleLocationChange = (key, nextValue) => {
    setForm((current) => ({
      ...current,
      [key]: {
        ...current[key],
        ...nextValue
      }
    }));
  };

  const handlePackageChange = (index, event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      packages: current.packages.map((pkg, pkgIndex) =>
        pkgIndex === index ? { ...pkg, [name]: value } : pkg
      )
    }));
  };

  const addPackageRow = () => {
    setForm((current) => ({
      ...current,
      packages: [...current.packages, emptyPackage()]
    }));
  };

  const removePackageRow = (index) => {
    if (form.packages.length === 1) {
      return;
    }

    setForm((current) => ({
      ...current,
      packages: current.packages.filter((_, pkgIndex) => pkgIndex !== index)
    }));
  };

  const handleSaveAddress = async (location) => {
    if (!form.customer_id) {
      setError('Select a customer before saving an address.');
      return;
    }

    try {
      await saveLocationAddress({
        customer_id: form.customer_id,
        address_type: 'OTHER',
        is_favorite: true,
        location: {
          address: location.address,
          place_id: location.place_id || undefined,
          latitude: location.latitude || undefined,
          longitude: location.longitude || undefined,
          city: location.city || undefined,
          state: location.state || undefined,
          country: location.country || undefined,
          pincode: location.pincode || undefined
        }
      });

      const refreshedAddresses = await getCustomerAddresses(form.customer_id);
      setSavedAddresses(refreshedAddresses || []);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save the selected address.');
    }
  };

  const resolveMapLocation = async (target, point) => {
    setMapResolvingTarget(target);

    try {
      const location = await getLocationPlaceDetails({
        latitude: point.latitude,
        longitude: point.longitude,
        customer_id: form.customer_id || undefined
      });

      handleLocationChange(target, location);
      setError('');

      if (target === 'pickup' && !form.delivery.address) {
        setActiveMapTarget('delivery');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to resolve the selected map point.');
    } finally {
      setMapResolvingTarget('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm(event.currentTarget)) {
      return;
    }

    if (form.packages.length === 0) {
      setError('At least one package is required.');
      return;
    }

    if (!form.vehicle_type_id) {
      setError('Vehicle type is required before calculating fare.');
      return;
    }

    if (!form.pickup.address || !form.delivery.address) {
      setError('Pickup and delivery locations are required.');
      return;
    }

    if (
      !Number.isFinite(Number(form.pickup.latitude)) ||
      !Number.isFinite(Number(form.pickup.longitude)) ||
      !Number.isFinite(Number(form.delivery.latitude)) ||
      !Number.isFinite(Number(form.delivery.longitude))
    ) {
      setError('Pickup and delivery coordinates are required before creating the shipment.');
      return;
    }

    if (!routePreview) {
      setError('Route calculation is required before creating the shipment.');
      return;
    }

    if (!fareEstimate) {
      setError('Fare estimate must be available before creating the shipment.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        customer_id: form.customer_id,
        pickup_address_id: form.pickup.saved_address_id || undefined,
        pickup_address: form.pickup.address,
        pickup_address_snapshot: form.pickup.address_snapshot || form.pickup.address,
        pickup_latitude: form.pickup.latitude || undefined,
        pickup_longitude: form.pickup.longitude || undefined,
        pickup_place_id: form.pickup.place_id || undefined,
        pickup_city: form.pickup.city || undefined,
        pickup_state: form.pickup.state || undefined,
        pickup_country: form.pickup.country || undefined,
        pickup_pincode: form.pickup.pincode || undefined,
        delivery_address_id: form.delivery.saved_address_id || undefined,
        delivery_address: form.delivery.address,
        delivery_address_snapshot: form.delivery.address_snapshot || form.delivery.address,
        delivery_latitude: form.delivery.latitude || undefined,
        delivery_longitude: form.delivery.longitude || undefined,
        delivery_place_id: form.delivery.place_id || undefined,
        delivery_city: form.delivery.city || undefined,
        delivery_state: form.delivery.state || undefined,
        delivery_country: form.delivery.country || undefined,
        delivery_pincode: form.delivery.pincode || undefined,
        vehicle_type_id: form.vehicle_type_id,
        shipment_type: form.shipment_type,
        priority: form.priority,
        estimated_delivery_date: form.estimated_delivery_date || undefined,
        estimated_distance: form.estimated_distance || undefined,
        special_instructions: form.special_instructions || undefined,
        status: form.status,
        packages: form.packages.map((pkg) => ({
          ...(pkg.id ? { id: pkg.id } : {}),
          package_name: pkg.package_name,
          package_type: pkg.package_type,
          weight: pkg.weight,
          length: pkg.length,
          width: pkg.width,
          height: pkg.height,
          quantity: pkg.quantity,
          declared_value: pkg.declared_value || undefined
        }))
      };

      const response = isEditMode ? await updateShipment(id, payload) : await createShipment(payload);
      navigate(`/shipments/${response.id}`);
    } catch (requestError) {
      if (requestError.response?.data?.errors?.length) {
        setError(requestError.response.data.errors.map((item) => item.message).join(' '));
      } else {
        setError(requestError.response?.data?.message || 'Unable to save shipment.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading shipment form..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Shipment Management</span>
          <h2 className={styles.pageTitle}>{isEditMode ? 'Edit Shipment' : 'Create Shipment'}</h2>
          <p className={styles.pageCopy}>
            {isEditMode
              ? `Shipment number: ${shipment?.shipment_number || 'Loading'}`
              : 'Plan the route, review ETA and fare, then create the shipment.'}
          </p>
        </div>
        <Link to="/shipments" className={styles.secondaryLink}>
          Back to Shipments
        </Link>
      </div>

      <form className={styles.formShell} onSubmit={handleSubmit} {...getFormValidationProps()}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Shipment Details</h3>
            <p>Choose the customer, vehicle, and shipment preferences before confirming the route.</p>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Customer</span>
              <select name="customer_id" value={form.customer_id} onChange={handleChange} required>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company_name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Vehicle Type</span>
              <select
                name="vehicle_type_id"
                value={form.vehicle_type_id}
                onChange={handleChange}
                required
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
              <span>Shipment Type</span>
              <select name="shipment_type" value={form.shipment_type} onChange={handleChange} required>
                <option value="DOCUMENT">DOCUMENT</option>
                <option value="PARCEL">PARCEL</option>
                <option value="HOUSEHOLD">HOUSEHOLD</option>
                <option value="COMMERCIAL">COMMERCIAL</option>
                <option value="FRAGILE">FRAGILE</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Priority</span>
              <select name="priority" value={form.priority} onChange={handleChange} required>
                <option value="LOW">LOW</option>
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Estimated Delivery Date</span>
              <input
                type="date"
                name="estimated_delivery_date"
                value={form.estimated_delivery_date}
                onChange={handleChange}
              />
            </label>

            <label className={styles.field}>
              <span>Initial Status</span>
              <select name="status" value={form.status} onChange={handleChange} disabled={isEditMode}>
                <option value="DRAFT">DRAFT</option>
                <option value="PENDING_ASSIGNMENT">PENDING_ASSIGNMENT</option>
              </select>
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Special Instructions</span>
              <textarea
                rows="4"
                name="special_instructions"
                value={form.special_instructions}
                onChange={handleChange}
                placeholder={
                  selectedCustomer
                    ? `Notes for ${selectedCustomer.company_name}`
                    : 'Handling, loading, or customer-specific notes'
                }
              />
            </label>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Shipment Route Planner</h3>
            <p>Search addresses, drop pins on the shared map, drag markers, and review the live route before booking.</p>
          </div>

          <div className={styles.locationPlannerGrid}>
            <LocationSearchField
              label="Pickup Address Search"
              customerId={form.customer_id}
              savedAddresses={savedAddresses}
              value={form.pickup}
              onChange={(nextValue) => handleLocationChange('pickup', nextValue)}
              onSaveAddress={handleSaveAddress}
              onActivateMapTarget={() => setActiveMapTarget('pickup')}
              showCurrentLocation
              mapTargetActive={activeMapTarget === 'pickup'}
              required
            />

            <LocationSearchField
              label="Delivery Address Search"
              customerId={form.customer_id}
              savedAddresses={savedAddresses}
              value={form.delivery}
              onChange={(nextValue) => handleLocationChange('delivery', nextValue)}
              onSaveAddress={handleSaveAddress}
              onActivateMapTarget={() => setActiveMapTarget('delivery')}
              mapTargetActive={activeMapTarget === 'delivery'}
              required
            />
          </div>

          <ShipmentBookingMap
            pickup={form.pickup}
            delivery={form.delivery}
            route={routePreview}
            activeTarget={activeMapTarget}
            onActiveTargetChange={setActiveMapTarget}
            onMapPointSelect={resolveMapLocation}
            onMarkerDragEnd={resolveMapLocation}
            statusText={
              mapResolvingTarget
                ? `Resolving ${mapResolvingTarget} address from the map...`
                : routeLoading
                  ? 'Recalculating route...'
                  : 'Click the map to place the active marker, or drag an existing marker to update the route.'
            }
          />

          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <strong>{formatDistanceLabel(routePreview?.distance_km)}</strong>
              <span>Distance</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{formatDurationLabel(routePreview?.duration_minutes)}</strong>
              <span>Travel Duration</span>
            </div>
            <div className={styles.metricCard}>
              <strong>{formatEtaLabel(routePreview?.estimated_eta)}</strong>
              <span>Estimated Arrival</span>
            </div>
            <div className={styles.metricCard}>
              <strong>
                {estimateLoading
                  ? 'Estimating...'
                  : form.vehicle_type_id
                    ? formatCurrency(fareEstimate?.final_amount || 0)
                    : 'Select vehicle'}
              </strong>
              <span>Fare Estimate</span>
            </div>
          </div>

          <div className={styles.documentSummary}>
            <div className={styles.summaryCard}>
              <strong>Route Summary</strong>
              <span>Vehicle: {selectedVehicleType?.type_name || 'Select vehicle type'}</span>
              <span>
                Route Provider:{' '}
                {routePreview?.provider || fareEstimate?.route?.provider || 'Awaiting route'}
              </span>
              <span>Total Weight: {totalWeight.toFixed(2)} kg</span>
            </div>
            <div className={styles.summaryCard}>
              <strong>Fare Breakdown</strong>
              <span>
                Base Fare:{' '}
                {formatCurrency(fareEstimate?.fare_breakdown?.base_fare || fareEstimate?.base_fare || 0)}
              </span>
              <span>
                Distance Charge:{' '}
                {formatCurrency(
                  fareEstimate?.fare_breakdown?.distance_charge || fareEstimate?.distance_charge || 0
                )}
              </span>
              <span>
                Weight Charge:{' '}
                {formatCurrency(
                  fareEstimate?.fare_breakdown?.weight_charge || fareEstimate?.weight_charge || 0
                )}
              </span>
              <span>
                Minimum Fare:{' '}
                {formatCurrency(fareEstimate?.fare_breakdown?.minimum_fare || 0)}
              </span>
              <span>
                Final Fare:{' '}
                {formatCurrency(fareEstimate?.fare_breakdown?.final_amount || fareEstimate?.final_amount || 0)}
              </span>
            </div>
            <div className={styles.summaryCard}>
              <strong>Estimator Debug</strong>
              <span>Distance Source: {fareEstimate?.debug?.distance_source || routePreview?.provider || 'Pending'}</span>
              <span>Vehicle Type: {fareEstimate?.debug?.vehicle_type || selectedVehicleType?.type_name || 'Pending'}</span>
              <span>Pricing Rule: {fareEstimate?.debug?.pricing_rule_id || fareEstimate?.pricing_rule?.id || 'Pending'}</span>
              <span>Formula: {fareEstimate?.debug?.formula || 'Pending'}</span>
            </div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Package Details</h3>
            <p>Add one or more packages. Totals will be calculated automatically by the backend.</p>
          </div>

          <div className={styles.packageGrid}>
            {form.packages.map((pkg, index) => (
              <div key={pkg.id || `package-${index}`} className={styles.packageCard}>
                <div className={styles.packageHeader}>
                  <strong>Package {index + 1}</strong>
                  {form.packages.length > 1 ? (
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => removePackageRow(index)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className={styles.packageFields}>
                  <label className={styles.field}>
                    <span>Package Name</span>
                    <input
                      name="package_name"
                      value={pkg.package_name}
                      onChange={(event) => handlePackageChange(index, event)}
                      required
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Package Type</span>
                    <input
                      name="package_type"
                      value={pkg.package_type}
                      onChange={(event) => handlePackageChange(index, event)}
                      required
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Weight</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="weight"
                      value={pkg.weight}
                      onChange={(event) => handlePackageChange(index, event)}
                      required
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Length</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="length"
                      value={pkg.length}
                      onChange={(event) => handlePackageChange(index, event)}
                      required
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Width</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="width"
                      value={pkg.width}
                      onChange={(event) => handlePackageChange(index, event)}
                      required
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Height</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="height"
                      value={pkg.height}
                      onChange={(event) => handlePackageChange(index, event)}
                      required
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Quantity</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      name="quantity"
                      value={pkg.quantity}
                      onChange={(event) => handlePackageChange(index, event)}
                      required
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Declared Value</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="declared_value"
                      value={pkg.declared_value}
                      onChange={(event) => handlePackageChange(index, event)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.submitRow}>
            <button type="button" className={styles.secondaryButton} onClick={addPackageRow}>
              Add Package
            </button>
          </div>
        </section>

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        <div className={styles.submitRow}>
          <Button
            type="submit"
            disabled={saving || !canSubmitShipment}
          >
            {saving
              ? 'Saving Shipment...'
              : routeLoading || estimateLoading || mapResolvingTarget
                ? 'Calculating Shipment...'
                : !form.vehicle_type_id
                  ? 'Select Vehicle Type'
                  : !fareEstimate
                    ? 'Waiting For Fare Estimate'
                    : !routePreview
                      ? 'Waiting For Route'
                      : Boolean(mapResolvingTarget)
                        ? 'Resolving Location...'
                : isEditMode
                  ? 'Update Shipment'
                  : 'Create Shipment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentForm;
