import { auth } from '@/app/auth';
import OrdersClientPage from '@/app/components/orders/OrdersClientPage';
import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import NavigationBar from '@/components/shared/Navigation'; // Import NavigationBar
import { OrderService } from '@/services/OrderService';
import { getTranslations } from 'next-intl/server';

interface OrderSummary {
  id: number;
  totalPrice: number;
  status: string; 
  createdAt: Date;
}

export default async function OrdersPage() {
  const t = await getTranslations('Pages.Orders');

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <>
        <title>{t('Title')}</title>
        <RouteProtection />
        <PageContainer>
          <PageHeader />
          <OrdersClientPage
            initialOrders={[]}
            initialLoading={false}
            initialError="Usuário não autenticado."
          />
        </PageContainer>
      </>
    );
  }

  let initialOrders: OrderSummary[] = [];
  let initialLoading = true;
  let initialError: string | null = null;

  try {
    const orders = await OrderService.getUserOrders(userId);
    initialOrders = orders as OrderSummary[];
  } catch (err: unknown) {
    console.error("Error fetching orders:", err);
    initialError = err instanceof Error ? err.message : "Não foi possível carregar seus pedidos.";
  } finally {
    initialLoading = false;
  }

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection />
      <PageContainer>
        <PageHeader />
        <NavigationBar />
        <OrdersClientPage
          initialOrders={initialOrders}
          initialLoading={initialLoading}
          initialError={initialError}
        />
      </PageContainer>
    </>
  );
}