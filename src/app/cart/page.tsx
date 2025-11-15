import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import NavigationBar from '@/components/shared/Navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cart from '../components/cart';
import { ProductsService } from '@/services/ProductsService'; // Import ProductsService
import { ProductType } from '@/types/products'; // Import ProductType

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function CartPage({ params }: any) {
  const { locale }: { locale: string } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Pages.Products');

  // Fetch all products with their latest stock information
  const allProducts: ProductType[] = await ProductsService.getAllProducts();

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection />
      <PageContainer>
        <PageHeader />
        <NavigationBar />
        <Cart initialProducts={allProducts} /> {/* Pass initialProducts to Cart component */}
      </PageContainer>
    </>
  );
}
