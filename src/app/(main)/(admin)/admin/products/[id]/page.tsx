import { auth } from '@/app/auth';
import EditProductForm from '@/app/components/admin/products/EditProductForm';
import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import NavigationBar from '@/components/shared/Navigation';
import { ProductsService } from '@/services/ProductsService';
import { getTranslations } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';

interface CategorySummary {
  id: number;
  categoryName: string;
}

interface ProductDetails {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
  categoryId: number;
}

export default async function AdminEditProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('Pages.AdminEditProduct');
  const { id } = await params;
  const productId = id;

  const session = await auth();
  const userId = session?.user?.id;

  let categories: CategorySummary[] = [];
  let categoriesError: string | null = null;

  try {
    categories = await ProductsService.getAllCategories();
  } catch (err: unknown) {
    console.error('Error fetching categories:', err);
    categoriesError =
      err instanceof Error
        ? err.message
        : 'Não foi possível carregar as categorias.';
  }

  if (!userId) {
    return (
      <>
        <title>{t('Title')}</title>
        <RouteProtection roles={['admin']} />
        <PageContainer>
          <NavigationBar />
          <EditProductForm
            initialProduct={null}
            initialLoading={false}
            initialError="Usuário não autenticado."
            productId={productId}
            categories={categories}
            categoriesError={categoriesError}
          />
        </PageContainer>
      </>
    );
  }

  let initialProduct: ProductDetails | null = null;
  let initialLoading = true;
  let initialError: string | null = null;

  if (!productId) {
    initialLoading = false;
    initialError = 'ID do produto não fornecido.';
  } else {
    try {
      const product = await ProductsService.getProductById(Number(productId));
      if (product) {
        initialProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          image: product.image,
          categoryId: product.categoryId // Include categoryId
        };
      }
    } catch (err: unknown) {
      console.error('Error fetching product details:', err);
      initialError =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os detalhes do produto.';
    } finally {
      initialLoading = false;
    }
  }

  return (
    <>
      <title>{t('Title')}</title>
      <PageContainer>
        <NavigationBar />
        <EditProductForm
          initialProduct={initialProduct}
          initialLoading={initialLoading}
          initialError={initialError}
          productId={productId}
          categories={categories}
          categoriesError={categoriesError}
        />
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
