import DashboardClientPage from '@/app/components/admin/dashboard/DashboardClientPage';
import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import NavigationBar from '@/components/shared/Navigation';
import PageHeader from '@/components/shared/PageHeader';
import { OrderService } from '@/services/OrderService';
import { ProductsService } from '@/services/ProductsService';
import { getTranslations } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';

interface LowStockProductSummary {
  id: number;
  name: string;
  stock: number;
  image?: string | null;
}

export default async function DashboardPage() {
  const t = await getTranslations('Pages.Dashboard');

  let orderMetrics = null;
  let productMetrics: {
    totalProducts: number;
    lowStockProducts: LowStockProductSummary[];
    lowStockThreshold: number;
  } | null = null;
  let initialLoading = true;
  let initialError: string | null = null;

  try {
    orderMetrics = await OrderService.getDashboardOrderMetrics();
    productMetrics = await ProductsService.getDashboardProductMetrics();
  } catch (err: unknown) {
    console.error('Error fetching dashboard metrics:', err);
    initialError =
      err instanceof Error
        ? err.message
        : 'Não foi possível carregar as métricas do dashboard.';
  } finally {
    initialLoading = false;
  }

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection roles={['admin']} />
      <PageContainer>
        <PageHeader />
        <NavigationBar />
        <DashboardClientPage
          orderMetrics={orderMetrics}
          productMetrics={productMetrics}
          initialLoading={initialLoading}
          initialError={initialError}
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
