import RouteProtection from '@/components/server/RouteProtection';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { use } from 'react';
import { signOut } from '../../auth';
import styles from './page.module.scss';
import Product_Page from './product_page';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Home({ params }: any) {
  const { locale, id }: { locale: string; id: string } = use(params);
  setRequestLocale(locale);

  const t = useTranslations('Pages.Index');

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection />
      <div className={`font-[family-name:inter] ${styles.container}`}>
        <div className={`${styles.content}`}>
          <div className={styles.header}>
            <form
              action={async () => {
                'use server';
                await signOut();
                return;
              }}
            >
              <button className={styles.logout_btn}>Logout</button>
            </form>
            <div className={styles.logo}>
              <Image
                src="/images/logo.png"
                alt="El Shadai Logo"
                height={1000}
                width={1000}
              />
              <div className={styles.logo_title}>El Shadai</div>
            </div>
            <div className={styles.header_spacing} />
          </div>
          <Product_Page Id={id} />
        </div>
      </div>
    </>
  );
}
