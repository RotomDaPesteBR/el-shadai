import { auth } from '@/app/auth';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import styles from './page.module.scss';
import Register from './register';

interface Neighborhood {
  id: number;
  description: string;
  zone: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function RegisterPage({ params }: any) {
  const { locale }: { locale: string } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Pages.Register');

  const session = await auth();
  if (session) redirect('/');

  let neighborhoods: Neighborhood[] = [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/neighborhood`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Failed to fetch neighborhoods from API.'
      );
    }

    const result = await response.json();

    // Verifique se a estrutura da resposta é como esperado (ex: { data: [...] })
    if (result && Array.isArray(result.data)) {
      neighborhoods = result.data;
    } else {
      throw new Error('Unexpected API response structure for neighborhoods.');
    }
  } catch (error) {
    console.error('Failed to fetch neighborhoods on server:', error);
  }

  return (
    <>
      <title>{t('Title')}</title>
      <Toaster />
      <div className={`${styles.container}`}>
        <div className={`${styles.content}`}>
          <Register neighborhoods={neighborhoods} />
        </div>
      </div>
    </>
  );
}
