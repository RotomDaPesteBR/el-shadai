import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import NavigationBar from '@/components/shared/Navigation';
import { CategoriesService } from '@/services/CategoriesService';
import { ProductsService } from '@/services/ProductsService';
import { CategoryType } from '@/types/categories';
import { GroupedProducts, ProductType } from '@/types/products';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';
import Catalog from '../../../components/products/catalog';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Products({ params }: any) {
  const { locale }: { locale: string } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Pages.Products');

  let products: ProductType[] = [];
  let categories: CategoryType[] = [];

  try {
    products = await ProductsService.getAllProducts();
    categories = await CategoriesService.getAllCategories();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching data for catalog:', error.message);
    products = [];
    categories = [];
  }

  const groupedProducts: GroupedProducts = {};

  products.forEach((product: ProductType) => {
    if (!groupedProducts[product.categoryId]) {
      groupedProducts[product.categoryId] = [];
    }

    groupedProducts[product.categoryId].push(product);
  });

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection />
      <PageContainer>
        <NavigationBar />
        <Catalog categories={categories} products={groupedProducts} />
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
