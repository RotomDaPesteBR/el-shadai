'use client';

import styles from '@/app/(main)/(costumer)/orders/[id]/page.module.scss';
import { toFormattedPrice } from '@/lib/toFormattedPrice';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

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

interface OrderDetailsClientPageProps {
  initialOrderDetails: OrderDetails | null;
  initialLoading: boolean;
  initialError: string | null;
  orderId: string;
}

export default function OrderDetailsClientPage({
  initialOrderDetails,
  initialLoading,
  initialError
}: OrderDetailsClientPageProps) {
  const t = useTranslations('Pages.OrderDetails');

  const orderDetails = initialOrderDetails;
  const loading = initialLoading;
  const error = initialError;

  if (loading) {
    return (
      <div className={styles.order_details_container}>
        <h2 className={styles.order_details_title}>{t('Title')}</h2>
        <p>Carregando detalhes do pedido...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.order_details_container}>
        <h2 className={styles.order_details_title}>{t('Title')}</h2>
        <p className={styles.error_message}>{error}</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className={styles.order_details_container}>
        <h2 className={styles.order_details_title}>{t('Title')}</h2>
        <p>{t('OrderNotFound')}</p>
      </div>
    );
  }

  return (
    <div className={styles.order_details_container}>
      <h2 className={styles.order_details_title}>{t('Title')}</h2>

      <div className={styles.section}>
        <h3 className={styles.section_title}>{t('OrderSummary')}</h3>
        <p>
          <strong>{t('OrderNumber')}:</strong> {orderDetails.id}
        </p>
        <p>
          <strong>{t('Status')}:</strong> {orderDetails.status}
        </p>
        <p>
          <strong>{t('OrderDate')}:</strong>{' '}
          {orderDetails.createdAt.toLocaleDateString()}
        </p>
        <p>
          <strong>{t('DeliveryMethod')}:</strong>{' '}
          {orderDetails.deliveryMethod === 'delivery'
            ? t('HomeDelivery')
            : t('StorePickup')}
        </p>
        {/* Add payment method if available in OrderDetails */}
      </div>

      <div className={styles.section}>
        <h3 className={styles.section_title}>{t('ProductsInOrder')}</h3>
        <ul className={styles.product_list}>
          {orderDetails.products.map(product => (
            <li key={product.id} className={styles.product_list_item}>
              <Image
                src={product.image ?? '/images/food.png'}
                alt={product.name}
                width={60}
                height={60}
                className={styles.product_image}
              />
              <div className={styles.product_info}>
                <p className={styles.product_name}>{product.name}</p>
                <p className={styles.product_quantity}>x{product.quantity}</p>
                <p className={styles.product_price}>
                  {toFormattedPrice(product.price.toString())}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.total_amount}>
        <strong>{t('TotalPrice')}:</strong>{' '}
        {toFormattedPrice(orderDetails.totalPrice.toString())}
      </div>
    </div>
  );
}
