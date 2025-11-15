import LogoutButton from '../Buttons/LogoutButton';
import Logo from '../Logo';
import styles from './PageHeader.module.scss';
import PageHeaderClientWrapper from './PageHeaderClientWrapper';

export default function PageHeader() {
  return (
    <div className={styles.header}>
      <PageHeaderClientWrapper />
      <Logo />
      <LogoutButton />
    </div>
  );
}
