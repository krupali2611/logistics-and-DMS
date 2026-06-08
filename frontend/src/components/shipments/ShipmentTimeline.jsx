import styles from '../../styles/Shipment.module.css';

const formatActor = (user) => {
  if (!user) {
    return 'System';
  }

  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return name || user.email || 'System';
};

const ShipmentTimeline = ({ items = [], emptyMessage = 'No status history available yet.' }) => {
  if (items.length === 0) {
    return <p className={styles.pageCopy}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.timeline}>
      {items.map((item, index) => (
        <div key={item.id || `${item.new_status}-${item.created_at}-${index}`} className={styles.timelineItem}>
          <div className={styles.timelineRail}>
            <span className={styles.timelineDot} />
            {index !== items.length - 1 ? <span className={styles.timelineLine} /> : null}
          </div>
          <div className={styles.timelineContent}>
            <div className={styles.timelineHeader}>
              <strong>{item.new_status}</strong>
              <span>{new Date(item.created_at).toLocaleString()}</span>
            </div>
            <p className={styles.timelineMeta}>
              {item.old_status ? `From ${item.old_status} to ${item.new_status}` : 'Initial status entry'}
            </p>
            <p className={styles.timelineMeta}>Updated by {formatActor(item.updatedBy)}</p>
            {item.remarks ? <p className={styles.timelineRemarks}>{item.remarks}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShipmentTimeline;
