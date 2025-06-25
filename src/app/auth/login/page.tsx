import { auth } from '@/app/auth';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Login from './login';
import styles from './page.module.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function LoginPage({ params }: any) {
  const { locale }: { locale: string } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Pages.Login');

  const session = await auth();
  if (session) redirect('/');

  return (
    <>
      <title>{t('Title')}</title>
      <Toaster />
      <div className={`${styles.container}`}>
        <div className={`${styles.content}`}>
          <Login />
        </div>
      </div>
    </>
  );
}
