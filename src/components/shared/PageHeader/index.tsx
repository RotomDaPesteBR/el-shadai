import LogoutButton from '../Buttons/LogoutButton';
import Logo from '../Logo';
import styles from './PageHeader.module.scss';

export default function PageHeader() {
  return (
    <div className={styles.header}>
      <LogoutButton />
      <Logo />
      <div className={styles.header_spacing} />
    </div>
  );
}
