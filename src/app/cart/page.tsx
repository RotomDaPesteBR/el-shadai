import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cart from '../components/cart';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function CartPage({ params }: any) {
  const { locale }: { locale: string } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Pages.Products');

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection />
      <PageContainer>
        <PageHeader />
        <Cart />
      </PageContainer>
    </>
  );
}
