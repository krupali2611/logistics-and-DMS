import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import { getDriverById } from '../../api/driverApi';
import { getFileUrl, isImageFile } from '../../utils/fileHelpers';
import { getDocumentDisplayName } from '../../utils/documentOptions';
import styles from '../../styles/Driver.module.css';

const DriverDetails = () => {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => {
    const loadDriver = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getDriverById(id);
        setDriver(response);
        setProfileImageError(false);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load driver details.');
      } finally {
        setLoading(false);
      }
    };

    loadDriver();
  }, [id]);

  if (loading) {
    return <Loader label="Loading driver details..." />;
  }

  if (error) {
    return <div className={styles.errorBox}>{error}</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Driver Profile</span>
          <h2 className={styles.pageTitle}>
            {driver.first_name} {driver.last_name}
          </h2>
          <p className={styles.pageCopy}>Driver code: {driver.driver_code}</p>
        </div>
        <div className={styles.linkGroup}>
          <Link to="/drivers" className={styles.secondaryLink}>
            Back
          </Link>
          <Link to={`/drivers/${id}/edit`} className={styles.secondaryLink}>
            Edit Driver
          </Link>
          <Link to={`/drivers/${id}/documents`} className={styles.primaryLink}>
            Manage Documents
          </Link>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Identity & Contact</h3>
          </div>
          <div className={styles.detailInfoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <strong>{driver.email || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone</span>
              <strong>{driver.phone || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>DOB</span>
              <strong>{driver.date_of_birth || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Gender</span>
              <strong>{driver.gender || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <strong>{driver.status}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Availability</span>
              <strong>{driver.availability_status}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Verification</span>
              <strong>{driver.verification_status}</strong>
            </div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Address</h3>
          </div>
          <p className={styles.addressBlock}>
            {driver.address || 'Address not provided'}
            <br />
            {[driver.city, driver.state, driver.pincode].filter(Boolean).join(', ') || 'Location not provided'}
          </p>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Profile Image</h3>
          </div>
          {driver.profile_image && !profileImageError ? (
            <img
              src={getFileUrl(driver.profile_image)}
              alt={`${driver.first_name} ${driver.last_name}`}
              className={styles.profilePreview}
              onError={() => setProfileImageError(true)}
            />
          ) : driver.profile_image ? (
            <p className={styles.pageCopy}>Profile image preview is unavailable.</p>
          ) : (
            <p className={styles.pageCopy}>No profile image uploaded yet.</p>
          )}
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Documents</h3>
            <p>{driver.documents.length} records linked</p>
          </div>
          <div className={styles.documentSummary}>
            {driver.documents.length === 0 ? (
              <p className={styles.pageCopy}>No documents uploaded yet.</p>
            ) : (
              driver.documents.map((document) => (
                <div key={document.id} className={styles.summaryCard}>
                  <strong>{getDocumentDisplayName(document)}</strong>
                  <span>{document.document_number}</span>
                  <span>{document.verification_status}</span>
                  <a
                    href={getFileUrl(document.document_file)}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.textLink}
                  >
                    {isImageFile(document.document_file) ? 'Open Image' : 'Open File'}
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

export default DriverDetails;
