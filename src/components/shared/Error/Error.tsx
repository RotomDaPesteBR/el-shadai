import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './Error.module.scss';

export default function Error({ ...props }) {
  const t = useTranslations('Components.Error');
  return (
    <div className={styles.Container}>
      <div className={styles.ErrorMessage}>{props.children}</div>
      <div className={styles.BackContainer}>
        <Link className={styles.BackButton} href="/">
          {t('Back')}
        </Link>
      </div>
    </div>
  );
}
