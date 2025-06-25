import styles from './Loading.module.scss';

export default function LoadingSplash() {
  return (
    <div className={styles.Container}>
      <div className={styles.Spinner} />
    </div>
  );
}
