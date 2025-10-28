import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import { getTranslations } from 'next-intl/server';
import { OrderService } from '@/services/OrderService';
import { ProductsService } from '@/services/ProductsService';
import DashboardClientPage from '@/app/components/admin/dashboard/DashboardClientPage';

export default async function DashboardPage() {
  const t = await getTranslations('Pages.Dashboard');

  let orderMetrics = null;
  let productMetrics = null;
  let initialLoading = true;
  let initialError: string | null = null;

  try {
    orderMetrics = await OrderService.getDashboardOrderMetrics();
    productMetrics = await ProductsService.getDashboardProductMetrics();
  } catch (err: unknown) {
    console.error("Error fetching dashboard metrics:", err);
    initialError = err instanceof Error ? err.message : "Não foi possível carregar as métricas do dashboard.";
  } finally {
    initialLoading = false;
  }

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection roles={['admin']} />
      <PageContainer>
        <PageHeader />
        <DashboardClientPage
          orderMetrics={orderMetrics}
          productMetrics={productMetrics}
          initialLoading={initialLoading}
          initialError={initialError}
        />
      </PageContainer>
    </>
  );
}
