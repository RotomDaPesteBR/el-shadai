import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import styles from './page.module.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Home({ params }: any) {
  const { locale }: { locale: string } = use(params);
  setRequestLocale(locale);

  const t = useTranslations('Pages.Index');

  return (
    <>
      <title>{t('Title')}</title>
      <div className={`font-[family-name:inter] ${styles.container}`}>
        <div className={`${styles.content}`}>{}</div>
      </div>
    </>
  );
}
