import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import {
  createDriver,
  createDriverDocument,
  getDriverById,
  updateDriver
} from '../../api/driverApi';
import { getFileUrl, toBase64Payload } from '../../utils/fileHelpers';
import styles from '../../styles/Driver.module.css';

const documentTypes = ['DRIVING_LICENSE', 'AADHAR_CARD', 'PAN_CARD', 'OTHER'];

const createInitialDocument = (type = 'DRIVING_LICENSE') => ({
  document_type: type,
  document_number: '',
  expiry_date: '',
  remarks: '',
  file: null,
  preview: ''
});

const initialForm = {
  driver_code: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  pincode: ''
};

const getValidationMessage = (error) => {
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((item) => item.message).join(' ');
  }

  return error.response?.data?.message || 'Unable to save driver.';
};

const DriverForm = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = mode === 'edit';
  const [form, setForm] = useState(initialForm);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [documents, setDocuments] = useState([
    createInitialDocument('DRIVING_LICENSE'),
    createInitialDocument('AADHAR_CARD'),
    createInitialDocument('PAN_CARD')
  ]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pageTitle = useMemo(
    () => (isEditMode ? 'Edit Driver Profile' : 'Register New Driver'),
    [isEditMode]
  );

  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    const loadDriver = async () => {
      setLoading(true);
      setError('');

      try {
        const driver = await getDriverById(id);
        setForm({
          driver_code: driver.driver_code || '',
          first_name: driver.first_name || '',
          last_name: driver.last_name || '',
          email: driver.email || '',
          phone: driver.phone || '',
          date_of_birth: driver.date_of_birth || '',
          gender: driver.gender || '',
          address: driver.address || '',
          city: driver.city || '',
          state: driver.state || '',
          pincode: driver.pincode || ''
        });
        setProfilePreview(driver.profile_image ? getFileUrl(driver.profile_image) : '');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load driver.');
      } finally {
        setLoading(false);
      }
    };

    loadDriver();
  }, [id, isEditMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
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
      let profilePayload = null;
      if (profileFile) {
        profilePayload = await toBase64Payload(profileFile);
      }

      const driverPayload = {
        ...form,
        ...(profilePayload ? { profile_image: profilePayload } : {})
      };

      const driver = isEditMode
        ? await updateDriver(id, driverPayload)
        : await createDriver(driverPayload);

      const documentsToUpload = documents.filter((item) => item.document_number && item.file);

      for (const document of documentsToUpload) {
        await createDriverDocument(driver.id, {
          document_type: document.document_type,
          document_number: document.document_number,
          expiry_date: document.expiry_date || undefined,
          remarks: document.remarks || undefined,
          document_file: await toBase64Payload(document.file)
        });
      }

      navigate(`/drivers/${driver.id}`);
    } catch (requestError) {
      setError(getValidationMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading driver profile..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Driver Management</span>
          <h2 className={styles.pageTitle}>{pageTitle}</h2>
          <p className={styles.pageCopy}>
            Capture driver identity, contact, and compliance records in one operational flow.
          </p>
        </div>
        <Link to="/drivers" className={styles.secondaryLink}>
          Back to Drivers
        </Link>
      </div>

      <form className={styles.formShell} onSubmit={handleSubmit}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Driver Details</h3>
            <p>Use a stable driver code and keep phone and email unique across the fleet.</p>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Driver Code</span>
              <input
                name="driver_code"
                value={form.driver_code}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>First Name</span>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Last Name</span>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label className={styles.field}>
              <span>Phone</span>
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </label>
            <label className={styles.field}>
              <span>DOB</span>
              <input
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
              />
            </label>
            <label className={styles.field}>
              <span>Gender</span>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>City</span>
              <input name="city" value={form.city} onChange={handleChange} />
            </label>
            <label className={styles.field}>
              <span>State</span>
              <input name="state" value={form.state} onChange={handleChange} />
            </label>
            <label className={styles.field}>
              <span>Pincode</span>
              <input name="pincode" value={form.pincode} onChange={handleChange} />
            </label>
            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Address</span>
              <textarea name="address" value={form.address} onChange={handleChange} rows="4" />
            </label>
            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Profile Image</span>
              <input type="file" accept="image/*" onChange={handleProfileFileChange} />
            </label>
          </div>

          {profilePreview ? (
            <div className={styles.previewPanel}>
              <span>Profile Preview</span>
              <img src={profilePreview} alt="Driver profile preview" className={styles.profilePreview} />
            </div>
          ) : null}
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Document Section</h3>
            <p>Attach initial compliance documents now. Full document lifecycle stays available after save.</p>
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

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        <div className={styles.submitRow}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving Driver...' : isEditMode ? 'Update Driver' : 'Create Driver'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DriverForm;
