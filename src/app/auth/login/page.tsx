import AccessRouteProtection from '@/components/AccessRouteProtection';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './login';
import styles from './page.module.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LoginPage({ params }: any) {
  const { locale }: { locale: string } = use(params);
  setRequestLocale(locale);

  const t = useTranslations('Pages.Index');

  return (
    <>
      <title>{t('Title')}</title>
      <Toaster />
      <AccessRouteProtection />
      <div className={`${styles.container}`}>
        <div className={`${styles.content}`}>
          <Login signIn={signIn} />
        </div>
      </div>
    </>
  );
}
