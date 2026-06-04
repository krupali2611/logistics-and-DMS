import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import {
  createVehicle,
  createVehicleDocument,
  getVehicleById,
  getVehicleTypes,
  updateVehicle
} from '../../api/vehicleApi';
import { toBase64Payload } from '../../utils/fileHelpers';
import styles from '../../styles/Vehicle.module.css';

const documentTypes = [
  'RC_BOOK',
  'INSURANCE',
  'PUC',
  'FITNESS_CERTIFICATE',
  'PERMIT',
  'OTHER'
];

const fuelTypes = ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'LPG', 'OTHER'];

const createInitialDocument = (type = 'RC_BOOK') => ({
  document_type: type,
  document_number: '',
  expiry_date: '',
  remarks: '',
  file: null,
  preview: ''
});

const initialForm = {
  vehicle_number: '',
  vehicle_type_id: '',
  brand: '',
  model: '',
  manufacturing_year: '',
  fuel_type: 'DIESEL',
  capacity: '',
  insurance_number: '',
  insurance_expiry: '',
  registration_number: '',
  registration_expiry: ''
};

const getValidationMessage = (error) => {
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((item) => item.message).join(' ');
  }

  return error.response?.data?.message || 'Unable to save vehicle.';
};

const VehicleForm = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = mode === 'edit';
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState([
    createInitialDocument('RC_BOOK'),
    createInitialDocument('INSURANCE')
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pageTitle = useMemo(
    () => (isEditMode ? 'Edit Vehicle Profile' : 'Register New Vehicle'),
    [isEditMode]
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const vehicleTypesResponse = await getVehicleTypes({ status: 'ACTIVE' });
        setVehicleTypes(vehicleTypesResponse);

        if (isEditMode && id) {
          const vehicle = await getVehicleById(id);
          setForm({
            vehicle_number: vehicle.vehicle_number || '',
            vehicle_type_id: vehicle.vehicle_type_id || '',
            brand: vehicle.brand || '',
            model: vehicle.model || '',
            manufacturing_year: vehicle.manufacturing_year || '',
            fuel_type: vehicle.fuel_type || 'DIESEL',
            capacity: vehicle.capacity || '',
            insurance_number: vehicle.insurance_number || '',
            insurance_expiry: vehicle.insurance_expiry || '',
            registration_number: vehicle.registration_number || '',
            registration_expiry: vehicle.registration_expiry || ''
          });
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load vehicle form.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleDocumentChange = (index, field, value) => {
    setDocuments((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleDocumentFileChange = (index, file) => {
    if (!file) {
      return;
    }

    handleDocumentChange(index, 'file', file);
    handleDocumentChange(index, 'preview', URL.createObjectURL(file));
  };

  const addDocumentRow = () => {
    setDocuments((current) => [...current, createInitialDocument('OTHER')]);
  };

  const removeDocumentRow = (index) => {
    setDocuments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        manufacturing_year: Number(form.manufacturing_year),
        capacity: Number(form.capacity)
      };

      const vehicle = isEditMode
        ? await updateVehicle(id, payload)
        : await createVehicle(payload);

      const documentsToUpload = documents.filter((item) => item.document_number && item.file);

      for (const document of documentsToUpload) {
        await createVehicleDocument(vehicle.id, {
          document_type: document.document_type,
          document_number: document.document_number,
          expiry_date: document.expiry_date || undefined,
          remarks: document.remarks || undefined,
          document_file: await toBase64Payload(document.file)
        });
      }

      navigate(`/vehicles/${vehicle.id}`);
    } catch (requestError) {
      setError(getValidationMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading vehicle form..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Vehicle Management</span>
          <h2 className={styles.pageTitle}>{pageTitle}</h2>
          <p className={styles.pageCopy}>
            Capture operational, compliance, and registration data once so downstream assignment stays reliable.
          </p>
        </div>
        <Link to="/vehicles" className={styles.secondaryLink}>
          Back to Vehicles
        </Link>
      </div>

      <form className={styles.formShell} onSubmit={handleSubmit}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Vehicle Details</h3>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Vehicle Number</span>
              <input
                name="vehicle_number"
                value={form.vehicle_number}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Vehicle Type</span>
              <select
                name="vehicle_type_id"
                value={form.vehicle_type_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                {vehicleTypes.map((vehicleType) => (
                  <option key={vehicleType.id} value={vehicleType.id}>
                    {vehicleType.type_name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Brand</span>
              <input name="brand" value={form.brand} onChange={handleChange} required />
            </label>
            <label className={styles.field}>
              <span>Model</span>
              <input name="model" value={form.model} onChange={handleChange} required />
            </label>
            <label className={styles.field}>
              <span>Manufacturing Year</span>
              <input
                name="manufacturing_year"
                type="number"
                min="1950"
                max="2099"
                value={form.manufacturing_year}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Fuel Type</span>
              <select name="fuel_type" value={form.fuel_type} onChange={handleChange}>
                {fuelTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Capacity</span>
              <input
                name="capacity"
                type="number"
                min="0"
                step="0.01"
                value={form.capacity}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Insurance Number</span>
              <input
                name="insurance_number"
                value={form.insurance_number}
                onChange={handleChange}
              />
            </label>
            <label className={styles.field}>
              <span>Insurance Expiry</span>
              <input
                name="insurance_expiry"
                type="date"
                value={form.insurance_expiry}
                onChange={handleChange}
              />
            </label>
            <label className={styles.field}>
              <span>Registration Number</span>
              <input
                name="registration_number"
                value={form.registration_number}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Registration Expiry</span>
              <input
                name="registration_expiry"
                type="date"
                value={form.registration_expiry}
                onChange={handleChange}
              />
            </label>
          </div>
        </section>

        {!isEditMode ? (
          <section className={styles.formCard}>
            <div className={styles.cardHeader}>
              <h3>Document Section</h3>
              <p>Add core vehicle compliance files now. You can manage the full lifecycle after save.</p>
            </div>

            <div className={styles.documentList}>
              {documents.map((document, index) => (
                <div key={`${document.document_type}-${index}`} className={styles.documentRow}>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Document Type</span>
                      <select
                        value={document.document_type}
                        onChange={(event) =>
                          handleDocumentChange(index, 'document_type', event.target.value)
                        }
                      >
                        {documentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Document Number</span>
                      <input
                        value={document.document_number}
                        onChange={(event) =>
                          handleDocumentChange(index, 'document_number', event.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Expiry Date</span>
                      <input
                        type="date"
                        value={document.expiry_date}
                        onChange={(event) =>
                          handleDocumentChange(index, 'expiry_date', event.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Document File</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(event) =>
                          handleDocumentFileChange(index, event.target.files?.[0])
                        }
                      />
                    </label>
                    <label className={`${styles.field} ${styles.fullWidth}`}>
                      <span>Remarks</span>
                      <textarea
                        rows="3"
                        value={document.remarks}
                        onChange={(event) =>
                          handleDocumentChange(index, 'remarks', event.target.value)
                        }
                      />
                    </label>
                  </div>

                  {document.preview ? (
                    <div className={styles.inlinePreview}>
                      {document.file?.type?.startsWith('image/') ? (
                        <img
                          src={document.preview}
                          alt={`${document.document_type} preview`}
                          className={styles.documentPreview}
                        />
                      ) : (
                        <a href={document.preview} target="_blank" rel="noreferrer" className={styles.textLink}>
                          Preview selected file
                        </a>
                      )}
                    </div>
                  ) : null}

                  {documents.length > 1 ? (
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => removeDocumentRow(index)}
                    >
                      Remove Document
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <button type="button" className={styles.secondaryButton} onClick={addDocumentRow}>
              Add Another Document
            </button>
          </section>
        ) : null}

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        <div className={styles.submitRow}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving Vehicle...' : isEditMode ? 'Update Vehicle' : 'Create Vehicle'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
