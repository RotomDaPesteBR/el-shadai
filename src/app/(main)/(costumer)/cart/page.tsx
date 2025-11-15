import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import NavigationBar from '@/components/shared/Navigation';
import { ProductsService } from '@/services/ProductsService'; // Import ProductsService
import { ProductType } from '@/types/products'; // Import ProductType
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';
import Cart from '../../../components/cart';

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
        <NavigationBar />
        <Cart initialProducts={allProducts} />{' '}
        {/* Pass initialProducts to Cart component */}
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
