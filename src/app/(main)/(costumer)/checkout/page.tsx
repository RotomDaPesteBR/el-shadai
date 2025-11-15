import CheckoutForm from '@/app/components/checkout/CheckoutForm';
import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import NavigationBar from '@/components/shared/Navigation'; // Import NavigationBar
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function CheckoutPage({ params }: any) {
  const { locale }: { locale: string } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Pages.Checkout');

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection />
      <PageContainer>
        <NavigationBar />
        <CheckoutForm />
      </PageContainer>
      <Toaster
        toastOptions={{
          style: {
            textAlign: 'center'
          },
          success: {
            duration: 5000
          },
          error: {
            duration: 10000
          }
        }}
      />
    </>
  );
}
