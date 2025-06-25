'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import styles from './ToggleThemeWrapper.module.scss';

const SetTheme = dynamic(() => import('./ToggleTheme'), {
  ssr: false,
  loading: () => <LoadingFallback />
});

export function LoadingFallback() {
  const t = useTranslations('Components.ToggleTheme');
  return <div className={styles.loading}>{t('Loading')}</div>;
}

export default function ToggleTheme() {
  return (
    <div className={styles.themeButton}>
      <SetTheme />
    </div>
  );
}
