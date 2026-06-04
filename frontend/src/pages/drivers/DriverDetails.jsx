import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import { getDriverById } from '../../api/driverApi';
import { getFileUrl, isImageFile } from '../../utils/fileHelpers';
import styles from '../../styles/Driver.module.css';

const DriverDetails = () => {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDriver = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getDriverById(id);
        setDriver(response);
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
          <div className={styles.infoGrid}>
            <div><strong>Email:</strong> {driver.email}</div>
            <div><strong>Phone:</strong> {driver.phone}</div>
            <div><strong>DOB:</strong> {driver.date_of_birth || 'Not set'}</div>
            <div><strong>Gender:</strong> {driver.gender || 'Not set'}</div>
            <div><strong>Status:</strong> {driver.status}</div>
            <div><strong>Availability:</strong> {driver.availability_status}</div>
            <div><strong>Verification:</strong> {driver.verification_status}</div>
            <div><strong>Created:</strong> {new Date(driver.created_at).toLocaleString()}</div>
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
          {driver.profile_image ? (
            <img
              src={getFileUrl(driver.profile_image)}
              alt={`${driver.first_name} ${driver.last_name}`}
              className={styles.profilePreview}
            />
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
                  <strong>{document.document_type}</strong>
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
