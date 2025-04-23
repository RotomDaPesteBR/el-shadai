import styles from './NavigationBar.module.scss';

export default function NavigationBar({ ...props }) {
  return (
    <nav className={styles.Container} id="nav">
      {props.children}
    </nav>
  );
}
