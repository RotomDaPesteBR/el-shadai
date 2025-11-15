import styles from './layout.module.scss';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.page_wrapper}>{children}</div>;
}
