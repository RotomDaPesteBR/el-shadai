import { auth } from '@/app/auth';
import ProductListClientPage from '@/app/components/admin/products/ProductListClientPage';
import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import { ProductsService } from '@/services/ProductsService';
import { getTranslations } from 'next-intl/server';

interface ProductSummary {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
  categoryId: number;
  categoryName: string;
}

export default async function AdminProductsPage() {
  const t = await getTranslations('Pages.AdminProducts');

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <>
        <title>{t('Title')}</title>
        <RouteProtection roles={['admin']} />
        <PageContainer>
          <PageHeader />
          <ProductListClientPage
            initialProducts={[]}
            initialLoading={false}
            initialError="Usuário não autenticado."
          />
        </PageContainer>
      </>
    );
  }

  let initialProducts: ProductSummary[] = [];
  let initialLoading = true;
  let initialError: string | null = null;

  try {
    const products = await ProductsService.getAllProducts();
    initialProducts = products;
  } catch (err: unknown) {
    console.error("Error fetching products:", err);
    initialError = err instanceof Error ? err.message : "Não foi possível carregar os produtos.";
  } finally {
    initialLoading = false;
  }

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection roles={['admin']} />
      <PageContainer>
        <PageHeader />
        <ProductListClientPage
          initialProducts={initialProducts}
          initialLoading={initialLoading}
          initialError={initialError}
        />
      </PageContainer>
    </>
  );
}
