"use client";

import { toFormattedPrice } from '@/lib/toFormattedPrice';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from '../../delivery/page.module.scss';

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

interface DeliveryOrdersClientPageProps {
  initialOrders: DeliveryOrderSummary[];
  initialLoading: boolean;
  initialError: string | null;
}

export default function DeliveryOrdersClientPage({ initialOrders, initialLoading, initialError }: DeliveryOrdersClientPageProps) {
  const t = useTranslations('Pages.DeliveryOrders');
  const orders = initialOrders;
  const loading = initialLoading;
  const error = initialError;

  if (loading) {
    return (
      <div className={styles.delivery_orders_container}>
        <h2 className={styles.delivery_orders_title}>{t('Title')}</h2>
        <p>Carregando pedidos de entrega...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.delivery_orders_container}>
        <h2 className={styles.delivery_orders_title}>{t('Title')}</h2>
        <p className={styles.error_message}>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.delivery_orders_container}>
        <h2 className={styles.delivery_orders_title}>{t('Title')}</h2>
        <p>{t('NoDeliveryOrders')}</p>
      </div>
    );
  }

  return (
    <div className={styles.delivery_orders_container}>
      <h2 className={styles.delivery_orders_title}>{t('Title')}</h2>
      <ul className={styles.order_list}>
        {orders.map((order) => (
          <li key={order.id} className={styles.order_list_item}>
            <Link href={`/delivery/${order.id}`} className={styles.order_link}>
              <div className={styles.order_summary}>
                <span>
                  {t('OrderNumber')}: {order.id}
                </span>
                <span>
                  {t('ClientName')}: {order.clientName}
                </span>
                <span>
                  {t('ClientAddress')}: {order.clientAddress}
                </span>
                <span>
                  {t('TotalPrice')}: {toFormattedPrice(order.totalPrice.toString())}
                </span>
                <span>
                  {t('Status')}: {order.status}
                </span>
                <span>
                  {t('OrderDate')}: {order.createdAt.toLocaleDateString()}
                  </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
