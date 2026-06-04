import styles from './Input.module.css';

const Input = ({ label, error, ...props }) => {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input {...props} />
      {error ? <small>{error}</small> : null}
    </label>
  );
};

export default Input;
