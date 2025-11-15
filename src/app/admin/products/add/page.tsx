import { auth } from '@/app/auth';
import AddProductForm from '@/app/components/admin/products/AddProductForm';
import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import NavigationBar from '@/components/shared/Navigation'; // Import NavigationBar
import { ProductsService } from '@/services/ProductsService';
import { getTranslations } from 'next-intl/server';

interface CategorySummary {
  id: number;
  categoryName: string;
}

export default async function AdminAddProductPage() {
  const t = await getTranslations('Pages.AdminAddProduct');

  const session = await auth();
  const userId = session?.user?.id;

  let categories: CategorySummary[] = [];
  let categoriesError: string | null = null;

  try {
    categories = await ProductsService.getAllCategories();
  } catch (err: unknown) {
    console.error("Error fetching categories:", err);
    categoriesError = err instanceof Error ? err.message : "Não foi possível carregar as categorias.";
  }

  if (!userId) {
    return (
      <>
        <title>{t('Title')}</title>
        <RouteProtection roles={['admin']} />
        <PageContainer>
          <PageHeader />
          <AddProductForm
            initialLoading={false}
            initialError="Usuário não autenticado."
            categories={categories}
            categoriesError={categoriesError}
          />
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection roles={['admin']} />
      <PageContainer>
        <PageHeader />
        <NavigationBar />
        <AddProductForm
          initialLoading={false}
          initialError={null}
          categories={categories}
          categoriesError={categoriesError}
        />
      </PageContainer>
    </>
  );
}
