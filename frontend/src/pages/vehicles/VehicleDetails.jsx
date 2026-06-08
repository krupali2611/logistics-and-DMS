import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import { getVehicleById } from '../../api/vehicleApi';
import { getFileUrl, isImageFile } from '../../utils/fileHelpers';
import styles from '../../styles/Vehicle.module.css';

const VehicleDetails = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadVehicle = async () => {
      setLoading(true);
      setError('');

      try {
        setVehicle(await getVehicleById(id));
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load vehicle details.');
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [id]);

  if (loading) {
    return <Loader label="Loading vehicle details..." />;
  }

  if (error) {
    return <div className={styles.errorBox}>{error}</div>;
  }

  const documents = vehicle.documents || [];
  const assignmentHistory = vehicle.assignmentHistory || [];
  const currentAssignment =
    assignmentHistory.find((assignment) => assignment.status === 'ASSIGNED') || null;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Vehicle Profile</span>
          <h2 className={styles.pageTitle}>{vehicle.vehicle_number}</h2>
          <p className={styles.pageCopy}>
            {vehicle.brand} {vehicle.model} - {vehicle.vehicleType?.type_name || 'Unknown type'}
          </p>
        </div>
        <div className={styles.linkGroup}>
          <Link to="/vehicles" className={styles.secondaryLink}>
            Back
          </Link>
          <Link to={`/vehicles/${id}/edit`} className={styles.secondaryLink}>
            Edit Vehicle
          </Link>
          <Link to={`/vehicles/${id}/documents`} className={styles.primaryLink}>
            Manage Documents
          </Link>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Vehicle Overview</h3>
          </div>
          <div className={styles.detailInfoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Type</span>
              <strong>{vehicle.vehicleType?.type_name || 'Unknown'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Brand</span>
              <strong>{vehicle.brand || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Model</span>
              <strong>{vehicle.model || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Year</span>
              <strong>{vehicle.manufacturing_year || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Fuel</span>
              <strong>{vehicle.fuel_type || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Capacity</span>
              <strong>{vehicle.capacity || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <strong>{vehicle.status || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Availability</span>
              <strong>{vehicle.availability_status || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Verification</span>
              <strong>{vehicle.verification_status || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Created</span>
              <strong>{new Date(vehicle.created_at).toLocaleString()}</strong>
            </div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Compliance & Registration</h3>
          </div>
          <div className={styles.detailInfoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Insurance No</span>
              <strong>{vehicle.insurance_number || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Insurance Expiry</span>
              <strong>{vehicle.insurance_expiry || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Registration No</span>
              <strong>{vehicle.registration_number || 'Not set'}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Registration Expiry</span>
              <strong>{vehicle.registration_expiry || 'Not set'}</strong>
            </div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Current Assignment</h3>
          </div>
          {currentAssignment ? (
            <div className={styles.summaryCard}>
              <strong>
                {currentAssignment.driver?.first_name} {currentAssignment.driver?.last_name}
              </strong>
              <span>Driver Code: {currentAssignment.driver?.driver_code}</span>
              <span>Phone: {currentAssignment.driver?.phone}</span>
              <span>Assigned At: {new Date(currentAssignment.assigned_at).toLocaleString()}</span>
            </div>
          ) : (
            <p className={styles.pageCopy}>No active driver assignment for this vehicle.</p>
          )}
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Documents</h3>
            <p>{documents.length} records linked</p>
          </div>
          <div className={styles.documentSummary}>
            {documents.length === 0 ? (
              <p className={styles.pageCopy}>No documents uploaded yet.</p>
            ) : (
              documents.map((document) => (
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

export default VehicleDetails;
