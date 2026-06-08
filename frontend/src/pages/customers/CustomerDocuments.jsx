import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ActionIcon from '../../components/ActionIcon/ActionIcon';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  createCustomerDocument,
  deleteCustomerDocument,
  getCustomerById,
  getCustomerDocuments,
  updateCustomerDocument
} from '../../api/customerApi';
import { getFileUrl, isImageFile, isImageMimeType, toBase64Payload } from '../../utils/fileHelpers';
import {
  customerDocumentTypes,
  customerOtherDocumentNames,
  getAvailableDocumentTypes,
  getDocumentDisplayName,
  hasDuplicateNonOtherDocument,
  OTHER_DOCUMENT_VALUE
} from '../../utils/documentOptions';
import { getFormValidationProps, validateForm } from '../../utils/formValidation';
import styles from '../../styles/Customer.module.css';

const emptyDocumentForm = {
  document_type: 'GST_CERTIFICATE',
  document_name: '',
  document_number: '',
  verification_status: 'PENDING',
  remarks: '',
  file: null,
  preview: ''
};

const CustomerDocuments = () => {
  const { id } = useParams();
  const { permissions } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(emptyDocumentForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const canUpdate = permissions.includes('customer_update');

  const getDefaultDocumentType = (existingDocuments = documents) =>
    getAvailableDocumentTypes({
      allTypes: customerDocumentTypes,
      currentType: emptyDocumentForm.document_type,
      existingDocuments
    })[0] || OTHER_DOCUMENT_VALUE;

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [customerResponse, documentResponse] = await Promise.all([
        getCustomerById(id),
        getCustomerDocuments(id)
      ]);
      setCustomer(customerResponse);
      setDocuments(documentResponse);
      if (!editingId) {
        setForm((current) => ({
          ...emptyDocumentForm,
          ...current,
          document_type: getDefaultDocumentType(documentResponse)
        }));
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load customer documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'document_type') {
      if (
        hasDuplicateNonOtherDocument({
          documentType: value,
          existingDocuments: documents,
          editingId
        })
      ) {
        setError(`${value} document already exists.`);
        return;
      }
    }

    setError('');

    if (name === 'document_type' && value !== OTHER_DOCUMENT_VALUE) {
      setForm((current) => ({ ...current, [name]: value, document_name: '' }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setForm((current) => ({
      ...current,
      file,
      preview: URL.createObjectURL(file)
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyDocumentForm, document_type: getDefaultDocumentType() });
    setEditingId('');
  };

  const handleEdit = (document) => {
    setEditingId(document.id);
    setForm({
      document_type: document.document_type,
      document_name: document.document_name || '',
      document_number: document.document_number,
      verification_status: document.verification_status,
      remarks: document.remarks || '',
      file: null,
      preview: document.document_file ? getFileUrl(document.document_file) : ''
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm(event.currentTarget)) {
      return;
    }

    if (
      hasDuplicateNonOtherDocument({
        documentType: form.document_type,
        existingDocuments: documents,
        editingId
      })
    ) {
      setError(`${form.document_type} document already exists.`);
      return;
    }

    if (form.document_type === OTHER_DOCUMENT_VALUE && !form.document_name.trim()) {
      setError('Document name is required when document type is OTHER.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        document_type: form.document_type,
        document_name:
          form.document_type === OTHER_DOCUMENT_VALUE ? form.document_name.trim() : undefined,
        document_number: form.document_number,
        verification_status: form.verification_status,
        remarks: form.remarks || undefined
      };

      if (form.file) {
        payload.document_file = await toBase64Payload(form.file);
      }

      if (editingId) {
        await updateCustomerDocument(editingId, payload);
      } else {
        if (!payload.document_file) {
          throw new Error('Please select a document file.');
        }
        await createCustomerDocument(id, payload);
      }

      resetForm();
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Unable to save customer document.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Delete this document?')) {
      return;
    }

    setSaving(true);
    try {
      await deleteCustomerDocument(documentId);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading documents..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Customer Documents</span>
          <h2 className={styles.pageTitle}>{customer.company_name}</h2>
          <p className={styles.pageCopy}>
            Store tax, identity, and business compliance files required for account verification.
          </p>
        </div>
        <div className={styles.linkGroup}>
          <Link to={`/customers/${id}`} className={styles.secondaryLink}>
            Customer Details
          </Link>
          <Link to="/customers" className={styles.secondaryLink}>
            Customer List
          </Link>
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <div className={styles.detailGrid}>
        {canUpdate ? (
          <form className={styles.formCard} onSubmit={handleSubmit} {...getFormValidationProps()}>
            <div className={styles.cardHeader}>
              <h3>{editingId ? 'Update Document' : 'Upload Document'}</h3>
            </div>
            <div className={`${styles.formGrid} ${styles.documentFormGrid}`}>
              <label className={styles.field}>
                <span>Document Type</span>
                <select name="document_type" value={form.document_type} onChange={handleChange}>
                  {getAvailableDocumentTypes({
                    allTypes: customerDocumentTypes,
                    currentType: form.document_type,
                    existingDocuments: documents,
                    editingId
                  }).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              {form.document_type === OTHER_DOCUMENT_VALUE ? (
                <label className={styles.field}>
                  <span>Document Name</span>
                  <input
                    name="document_name"
                    list="customer-other-document-names"
                    value={form.document_name}
                    onChange={handleChange}
                    required
                  />
                  <datalist id="customer-other-document-names">
                    {customerOtherDocumentNames.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </label>
              ) : null}
              <label className={styles.field}>
                <span>Document Number</span>
                <input
                  name="document_number"
                  value={form.document_number}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className={styles.field}>
                <span>Verification Status</span>
                <select
                  name="verification_status"
                  value={form.verification_status}
                  onChange={handleChange}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>Remarks</span>
                <textarea name="remarks" rows="3" value={form.remarks} onChange={handleChange} />
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>{editingId ? 'Replace File' : 'Document File'}</span>
                <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
              </label>
            </div>

            {form.preview ? (
              <div className={styles.inlinePreview}>
                {isImageMimeType(form.file?.type) || isImageFile(form.preview) ? (
                  <img src={form.preview} alt="Document preview" className={styles.documentPreview} />
                ) : (
                  <a href={form.preview} target="_blank" rel="noreferrer" className={styles.textLink}>
                    Preview current file
                  </a>
                )}
              </div>
            ) : null}

            <div className={styles.submitRow}>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Document' : 'Upload Document'}
              </Button>
              {editingId ? (
                <button type="button" className={styles.secondaryButton} onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        ) : null}

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Uploaded Documents</h3>
            <p>{documents.length} total</p>
          </div>
          <div className={styles.documentSummary}>
            {documents.length === 0 ? (
              <p className={styles.pageCopy}>No documents uploaded yet.</p>
            ) : (
              documents.map((document) => (
                <div key={document.id} className={styles.summaryCard}>
                  <strong>{getDocumentDisplayName(document)}</strong>
                  <span>{document.document_number}</span>
                  <span>{document.verification_status}</span>
                  <div className={styles.summaryActions}>
                    <a
                      href={getFileUrl(document.document_file)}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.actionIconLink}
                      title="Open file"
                      aria-label="Open file"
                    >
                      <ActionIcon name="open" />
                    </a>
                    {canUpdate ? (
                      <button
                        type="button"
                        className={styles.actionIconButton}
                        title="Edit document"
                        aria-label="Edit document"
                        onClick={() => handleEdit(document)}
                      >
                        <ActionIcon name="edit" />
                      </button>
                    ) : null}
                    {canUpdate ? (
                      <button
                        type="button"
                        className={styles.actionIconDanger}
                        title="Delete document"
                        aria-label="Delete document"
                        onClick={() => handleDelete(document.id)}
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

export default CustomerDocuments;
