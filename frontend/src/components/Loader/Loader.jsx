import styles from './Loader.module.css';

const Loader = ({ fullScreen = false, label = 'Loading...' }) => {
  return (
    <div className={`${styles.loaderWrap} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.spinner} />
      <span>{label}</span>
    </div>
  );
};

export default Loader;
