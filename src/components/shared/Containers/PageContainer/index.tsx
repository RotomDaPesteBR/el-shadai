import styles from './PageContainer.module.scss';

export default function ContentContainer({ ...props }) {
  return (
    <div className={`font-[family-name:inter] ${styles.outer}`}>
      <div className={styles.inner}>{props.children}</div>
    </div>
  );
}
