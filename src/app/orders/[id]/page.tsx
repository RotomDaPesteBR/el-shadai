import { auth } from '@/app/auth';
import OrderDetailsClientPage from '@/app/components/orders/OrderDetailsClientPage';
import RouteProtection from '@/components/server/RouteProtection';
import PageContainer from '@/components/shared/Containers/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import { OrderService } from '@/services/OrderService';
import { getTranslations } from 'next-intl/server';

interface ProductInOrder {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
}

interface OrderDetails {
  id: number;
  totalPrice: number;
  status: string;
  deliveryMethod: string;
  createdAt: Date;
  products: ProductInOrder[];
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const t = await getTranslations('Pages.OrderDetails');
  const orderId = params.id;

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <>
        <title>{t('Title')}</title>
        <RouteProtection />
        <PageContainer>
          <PageHeader />
          <OrderDetailsClientPage
            initialOrderDetails={null}
            initialLoading={false}
            initialError="Usuário não autenticado."
            orderId={orderId}
          />
        </PageContainer>
      </>
    );
  }

  let initialOrderDetails: OrderDetails | null = null;
  let initialLoading = true;
  let initialError: string | null = null;

  if (!orderId) {
    initialLoading = false;
    initialError = "ID do pedido não fornecido.";
  } else {
    try {
      const order = await OrderService.getOrderDetails(Number(orderId), userId);
      initialOrderDetails = order;
    } catch (err: unknown) {
      console.error("Error fetching order details:", err);
      initialError = err instanceof Error ? err.message : "Não foi possível carregar os detalhes do pedido.";
    } finally {
      initialLoading = false;
    }
  }

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection />
      <PageContainer>
        <PageHeader />
        <OrderDetailsClientPage
          initialOrderDetails={initialOrderDetails}
          initialLoading={initialLoading}
          initialError={initialError}
          orderId={orderId}
        />
      </PageContainer>
    </>
  );
}