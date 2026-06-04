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

  const currentAssignment = vehicle.assignments.find((assignment) => assignment.status === 'ACTIVE');

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
          <div className={styles.infoGrid}>
            <div><strong>Type:</strong> {vehicle.vehicleType?.type_name || 'Unknown'}</div>
            <div><strong>Brand:</strong> {vehicle.brand}</div>
            <div><strong>Model:</strong> {vehicle.model}</div>
            <div><strong>Year:</strong> {vehicle.manufacturing_year}</div>
            <div><strong>Fuel:</strong> {vehicle.fuel_type}</div>
            <div><strong>Capacity:</strong> {vehicle.capacity}</div>
            <div><strong>Status:</strong> {vehicle.status}</div>
            <div><strong>Availability:</strong> {vehicle.availability_status}</div>
            <div><strong>Verification:</strong> {vehicle.verification_status}</div>
            <div><strong>Created:</strong> {new Date(vehicle.created_at).toLocaleString()}</div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Compliance & Registration</h3>
          </div>
          <div className={styles.infoGrid}>
            <div><strong>Insurance No:</strong> {vehicle.insurance_number || 'Not set'}</div>
            <div><strong>Insurance Expiry:</strong> {vehicle.insurance_expiry || 'Not set'}</div>
            <div><strong>Registration No:</strong> {vehicle.registration_number}</div>
            <div><strong>Registration Expiry:</strong> {vehicle.registration_expiry || 'Not set'}</div>
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
            <p>{vehicle.documents.length} records linked</p>
          </div>
          <div className={styles.documentSummary}>
            {vehicle.documents.length === 0 ? (
              <p className={styles.pageCopy}>No documents uploaded yet.</p>
            ) : (
              vehicle.documents.map((document) => (
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
