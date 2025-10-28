import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import CheckoutForm from '@/app/components/checkout/CheckoutForm';

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
        <PageHeader />
        <CheckoutForm />
      </PageContainer>
    </>
  );
}
