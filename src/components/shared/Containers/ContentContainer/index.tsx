import styles from './ContentContainer.module.scss';

export default function ContentContainer({ ...props }) {
  return (
    <div className={styles.outer}>
      <div className={styles.inner}>{props.children}</div>
    </div>
  );
}
