import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { getCustomers, getCustomerById } from '../../api/customerApi';
import { getVehicleTypes } from '../../api/vehicleApi';
import { createShipment, getShipmentById, updateShipment } from '../../api/shipmentApi';
import styles from '../../styles/Shipment.module.css';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';

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

const initialForm = {
  customer_id: '',
  pickup_address_id: '',
  delivery_address_id: '',
  vehicle_type_id: '',
  shipment_type: 'PARCEL',
  priority: 'NORMAL',
  estimated_delivery_date: '',
  estimated_distance: '',
  special_instructions: '',
  status: 'DRAFT',
  packages: [emptyPackage()]
};

const formatAddressLabel = (address) =>
  [
    address.address_type,
    address.address_line_1,
    address.city,
    address.state,
    address.pincode
  ]
    .filter(Boolean)
    .join(' - ');

const ShipmentForm = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = mode === 'edit';
  const [form, setForm] = useState(initialForm);
  const [shipment, setShipment] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === form.customer_id) || null,
    [customers, form.customer_id]
  );

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
          setShipment(shipmentResponse);
          setForm({
            customer_id: shipmentResponse.customer_id,
            pickup_address_id: shipmentResponse.pickup_address_id,
            delivery_address_id: shipmentResponse.delivery_address_id,
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
          setAddresses(shipmentResponse.customer?.addresses || []);

          if (!shipmentResponse.customer?.addresses?.length) {
            const customerDetails = await getCustomerById(shipmentResponse.customer_id);
            setAddresses(customerDetails.addresses || []);
          }
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load shipment form data.');
      } finally {
        setLoading(false);
      }
    };

    loadBaseData();
  }, [id, isEditMode]);

  useEffect(() => {
    if (!form.customer_id) {
      setAddresses([]);
      setForm((current) => ({
        ...current,
        pickup_address_id: '',
        delivery_address_id: ''
      }));
      return;
    }

    const loadAddresses = async () => {
      try {
        const customer = await getCustomerById(form.customer_id);
        setAddresses(customer.addresses || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load customer addresses.');
      }
    };

    loadAddresses();
  }, [form.customer_id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'customer_id'
        ? {
            pickup_address_id: '',
            delivery_address_id: ''
          }
        : {})
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm(event.currentTarget)) {
      return;
    }

    if (form.packages.length === 0) {
      setError('At least one package is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        customer_id: form.customer_id,
        pickup_address_id: form.pickup_address_id,
        delivery_address_id: form.delivery_address_id,
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
          <h2 className={styles.pageTitle}>
            {isEditMode ? 'Edit Shipment' : 'Create Shipment'}
          </h2>
          <p className={styles.pageCopy}>
            {isEditMode
              ? `Shipment number: ${shipment?.shipment_number || 'Loading'}`
              : 'Shipment number will be generated automatically when the record is created.'}
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
            <p>Connect customer, route endpoints, vehicle type, and fulfillment priority.</p>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Customer</span>
              <select
                name="customer_id"
                value={form.customer_id}
                onChange={handleChange}
                required
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company_name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Pickup Address</span>
              <select
                name="pickup_address_id"
                value={form.pickup_address_id}
                onChange={handleChange}
                required
              >
                <option value="">Select pickup address</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {formatAddressLabel(address)}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Delivery Address</span>
              <select
                name="delivery_address_id"
                value={form.delivery_address_id}
                onChange={handleChange}
                required
              >
                <option value="">Select delivery address</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {formatAddressLabel(address)}
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
              <span>Estimated Distance (km)</span>
              <input
                type="number"
                step="0.01"
                name="estimated_distance"
                value={form.estimated_distance}
                onChange={handleChange}
                min="0"
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
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving Shipment...' : isEditMode ? 'Update Shipment' : 'Create Shipment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentForm;
