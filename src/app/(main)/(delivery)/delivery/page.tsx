import DeliveryOrdersClientPage from '@/app/components/delivery/DeliveryOrdersClientPage';
import PageContainer from '@/components/shared/Containers/PageContainer';
import NavigationBar from '@/components/shared/Navigation'; // Import NavigationBar
import { OrderService } from '@/services/OrderService';
import { getTranslations } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';

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
    console.error('Error fetching delivery orders:', err);
    initialError =
      err instanceof Error
        ? err.message
        : 'Erro desconhecido ao carregar os pedidos de entrega.';
  } finally {
    initialLoading = false;
  }

  return (
    <>
      <title>{t('Title')}</title>
      <PageContainer>
        <NavigationBar />
        <DeliveryOrdersClientPage
          initialOrders={initialOrders}
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
