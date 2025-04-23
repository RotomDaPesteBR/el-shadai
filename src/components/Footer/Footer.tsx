import styles from './Footer.module.scss';

export default function Footer({ ...props }) {
  const year = new Date().getFullYear();

  return (
    <footer className={`${styles.Container} ${props.className}`} id="footer">
      <div className={styles.Copyright}>© {year}</div>
      <div className={styles.Content}>{props.children}</div>
    </footer>
  );
}
