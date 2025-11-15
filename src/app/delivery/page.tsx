import DeliveryOrdersClientPage from '@/app/components/delivery/DeliveryOrdersClientPage';
import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import NavigationBar from '@/components/shared/Navigation'; // Import NavigationBar
import { OrderService } from '@/services/OrderService';
import { getTranslations } from 'next-intl/server';

interface ProductInOrder {
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
}

interface DeliveryOrderSummary {
  id: number;
  clientName: string | null;
  clientAddress: string;
  totalPrice: number;
  status: string;
  products: ProductInOrder[];
  createdAt: Date;
}

export default async function DeliveryOrdersPage() {
  const t = await getTranslations('Pages.DeliveryOrders');

  let initialOrders: DeliveryOrderSummary[] = [];
  let initialLoading = true;
  let initialError: string | null = null;

  try {
    const orders = await OrderService.getPendingDeliveryOrders();
    initialOrders = orders;
  } catch (err: unknown) {
    console.error("Error fetching delivery orders:", err);
    initialError = err instanceof Error ? err.message : "Erro desconhecido ao carregar os pedidos de entrega.";
  } finally {
    initialLoading = false;
  }

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection roles={['delivery']} />
      <PageContainer>
        <PageHeader />
        <NavigationBar />
        <DeliveryOrdersClientPage
          initialOrders={initialOrders}
          initialLoading={initialLoading}
          initialError={initialError}
        />
      </PageContainer>
    </>
  );
}