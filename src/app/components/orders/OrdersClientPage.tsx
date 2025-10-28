"use client";

import { toFormattedPrice } from '@/lib/toFormattedPrice';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from '../../orders/page.module.scss';

interface OrderSummary {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: Date;
}

interface OrdersClientPageProps {
  initialOrders: OrderSummary[];
  initialLoading: boolean;
  initialError: string | null;
}

export default function OrdersClientPage({ initialOrders, initialLoading, initialError }: OrdersClientPageProps) {
  const t = useTranslations('Pages.Orders');
  const orders = initialOrders;
  const loading = initialLoading;
  const error = initialError;

  if (loading) {
    return (
      <div className={styles.orders_container}>
        <h2 className={styles.orders_title}>{t('Title')}</h2>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.orders_container}>
        <h2 className={styles.orders_title}>{t('Title')}</h2>
        <p className={styles.error_message}>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.orders_container}>
        <h2 className={styles.orders_title}>{t('Title')}</h2>
        <p>{t('NoOrders')}</p>
      </div>
    );
  }

  return (
    <div className={styles.orders_container}>
      <h2 className={styles.orders_title}>{t('Title')}</h2>
      <ul className={styles.order_list}>
        {orders.map((order) => (
          <li key={order.id} className={styles.order_list_item}>
            <Link href={`/orders/${order.id}`} className={styles.order_link}>
              <div className={styles.order_summary}>
                <span>
                  {t('OrderNumber')}: {order.id}
                </span>
                <span>
                  {t('TotalPrice')}: {toFormattedPrice(order.totalPrice.toString())}
                </span>
                <span>
                  {t('Status')}: {order.status}
                </span>
                <span>
                  {t('OrderDate')}: {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
