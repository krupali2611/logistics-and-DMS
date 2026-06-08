import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ActionIcon from '../../components/ActionIcon/ActionIcon';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  createShipmentAttachment,
  deleteShipmentAttachment,
  getShipmentAttachments,
  getShipmentById
} from '../../api/shipmentApi';
import { getFileUrl, toBase64Payload } from '../../utils/fileHelpers';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';
import styles from '../../styles/Shipment.module.css';

const initialForm = {
  file: null,
  fileName: ''
};

const ShipmentAttachments = () => {
  const { id } = useParams();
  const { permissions } = useAuth();
  const [shipment, setShipment] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canUpdate = permissions.includes('shipment_update');
  const canDelete = permissions.includes('shipment_delete');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [shipmentResponse, attachmentResponse] = await Promise.all([
        getShipmentById(id),
        getShipmentAttachments(id)
      ]);
      setShipment(shipmentResponse);
      setAttachments(attachmentResponse);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load shipment attachments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setForm({
      file,
      fileName: file.name
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm(event.currentTarget)) {
      return;
    }

    if (!form.file) {
      setError('Please select a file to upload.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        file: await toBase64Payload(form.file)
      };
      await createShipmentAttachment(id, payload);
      setForm(initialForm);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to upload attachment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Delete this attachment?')) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await deleteShipmentAttachment(attachmentId);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete attachment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading shipment attachments..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Shipment Attachments</span>
          <h2 className={styles.pageTitle}>{shipment.shipment_number}</h2>
          <p className={styles.pageCopy}>
            Upload proof documents, invoices, manifests, or handling references for this shipment.
          </p>
        </div>
        <div className={styles.linkGroup}>
          <Link to={`/shipments/${id}`} className={styles.secondaryLink}>
            Shipment Details
          </Link>
          <Link to={`/shipments/${id}/timeline`} className={styles.secondaryLink}>
            Timeline
          </Link>
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <div className={styles.detailGridSingle}>
        {canUpdate && shipment.status !== 'DELIVERED' ? (
          <form className={styles.formCard} onSubmit={handleSubmit} {...getFormValidationProps()}>
            <div className={styles.cardHeader}>
              <h3>Upload Attachment</h3>
              <p>Supported formats: JPG, PNG, WEBP, and PDF.</p>
            </div>

            <div className={styles.formGridCompact}>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>Attachment File</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>

            {form.fileName ? <p className={styles.pageCopyAlt}>Selected file: {form.fileName}</p> : null}

            <div className={styles.submitRow}>
              <Button type="submit" disabled={saving}>
                {saving ? 'Uploading...' : 'Upload Attachment'}
              </Button>
            </div>
          </form>
        ) : null}

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Uploaded Attachments</h3>
            <p>{attachments.length} total</p>
          </div>
          <div className={styles.documentSummary}>
            {attachments.length === 0 ? (
              <p className={styles.pageCopy}>No attachments uploaded yet.</p>
            ) : (
              attachments.map((attachment) => (
                <div key={attachment.id} className={styles.summaryCard}>
                  <strong>{attachment.file_name}</strong>
                  <span>{attachment.file_type}</span>
                  <span>
                    Uploaded by{' '}
                    {attachment.uploadedBy
                      ? `${attachment.uploadedBy.first_name} ${attachment.uploadedBy.last_name}`.trim()
                      : 'System'}
                  </span>
                  <div className={styles.summaryActions}>
                    <a
                      href={getFileUrl(attachment.file_path)}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.actionIconLink}
                      title="Open attachment"
                      aria-label="Open attachment"
                    >
                      <ActionIcon name="open" />
                    </a>
                    {canDelete && shipment.status !== 'DELIVERED' ? (
                      <button
                        type="button"
                        className={styles.actionIconDanger}
                        title="Delete attachment"
                        aria-label="Delete attachment"
                        onClick={() => handleDelete(attachment.id)}
                      >
                        <ActionIcon name="delete" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShipmentAttachments;
