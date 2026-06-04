import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import {
  createCustomerNote,
  deleteCustomerNote,
  getCustomerById,
  getCustomerNotes
} from '../../api/customerApi';
import styles from '../../styles/Customer.module.css';

const CustomerNotes = () => {
  const { id } = useParams();
  const { permissions } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const canUpdate = permissions.includes('customer_update');
  const canDelete = permissions.includes('customer_delete');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [customerResponse, noteResponse] = await Promise.all([
        getCustomerById(id),
        getCustomerNotes(id)
      ]);
      setCustomer(customerResponse);
      setNotes(noteResponse);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load customer notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await createCustomerNote(id, note);
      setNote('');
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save customer note.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note?')) {
      return;
    }

    setSaving(true);
    try {
      await deleteCustomerNote(noteId);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading notes..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Customer Notes</span>
          <h2 className={styles.pageTitle}>{customer.company_name}</h2>
          <p className={styles.pageCopy}>
            Keep operational context, service remarks, and verification follow-ups attached to the account.
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
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <div className={styles.cardHeader}>
              <h3>Add Note</h3>
              <p>Notes are stamped with the currently logged-in user.</p>
            </div>
            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Note</span>
              <textarea
                rows="7"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add service observations, billing notes, or verification follow-up."
                required
              />
            </label>
            <div className={styles.submitRow}>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving Note...' : 'Add Note'}
              </Button>
            </div>
          </form>
        ) : null}

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>Saved Notes</h3>
            <p>{notes.length} total</p>
          </div>
          <div className={styles.documentSummary}>
            {notes.length === 0 ? (
              <p className={styles.pageCopy}>No notes added yet.</p>
            ) : (
              notes.map((item) => (
                <div key={item.id} className={styles.noteCard}>
                  <p>{item.note}</p>
                  <span className={styles.noteMeta}>
                    {item.createdBy
                      ? `${item.createdBy.first_name} ${item.createdBy.last_name}`
                      : 'System'}
                    {' • '}
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                  {canDelete ? (
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerNotes;
