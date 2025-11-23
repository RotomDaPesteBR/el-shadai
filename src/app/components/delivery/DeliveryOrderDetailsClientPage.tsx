'use client';

import styles from '@/app/(main)/(delivery)/delivery/[id]/page.module.scss';
import { toFormattedPrice } from '@/lib/toFormattedPrice';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ProductInOrder {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
}

interface DeliveryOrderDetails {
  id: number;
  totalPrice: number;
  status: string;
  deliveryMethod: string;
  createdAt: Date;
  products: ProductInOrder[];
}

interface DeliveryOrderDetailsClientPageProps {
  initialOrderDetails: DeliveryOrderDetails | null;
  initialLoading: boolean;
  initialError: string | null;
  orderId: string;
}

export default function DeliveryOrderDetailsClientPage({
  initialOrderDetails,
  initialLoading,
  initialError,
  orderId
}: DeliveryOrderDetailsClientPageProps) {
  const t = useTranslations('Pages.DeliveryOrderDetails');

  const [orderDetails, setOrderDetails] = useState(initialOrderDetails);
  const loading = initialLoading;
  const error = initialError;

  const handleUpdateStatus = async (newStatusId: number, statusLabel: string) => {
    try {
      const response = await fetch(`/api/v1/order/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newStatusId })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      toast.success(`Status do pedido atualizado para ${statusLabel}!`);
      
      setOrderDetails(prevDetails => {
        if (!prevDetails) return null;
        return { ...prevDetails, status: statusLabel };
      });
    } catch (err: unknown) {
      console.error('Error updating order status:', err);
      toast.error(
        err instanceof Error
          ? err.message
          : 'Erro ao atualizar o status do pedido.'
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.delivery_order_details_container}>
        <h2 className={styles.delivery_order_details_title}>{t('Title')}</h2>
        <p>Carregando detalhes do pedido de entrega...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.delivery_order_details_container}>
        <h2 className={styles.delivery_order_details_title}>{t('Title')}</h2>
        <p className={styles.error_message}>{error}</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className={styles.delivery_order_details_container}>
        <h2 className={styles.delivery_order_details_title}>{t('Title')}</h2>
        <p>{t('OrderNotFound')}</p>
      </div>
    );
  }

  return (
    <div className={styles.delivery_order_details_container}>
      <h2 className={styles.delivery_order_details_title}>{t('Title')}</h2>

      <div className={styles.section}>
        <h3 className={styles.section_title}>{t('OrderSummary')}</h3>
        <p>
          <strong>{t('OrderNumber')}:</strong> {orderDetails.id}
        </p>
        <p>
          <strong>{t('TotalPrice')}:</strong>{' '}
          {toFormattedPrice(orderDetails.totalPrice.toString())}
        </p>
        <p>
          <strong>{t('Status')}:</strong> {orderDetails.status}
        </p>
        <p>
          <strong>{t('OrderDate')}:</strong>{' '}
          {new Date(orderDetails.createdAt).toLocaleDateString()}
        </p>
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

      <div className={styles.action_buttons}>
        {orderDetails.status !== 'A caminho' &&
          orderDetails.status !== 'Entregue' && (
            <button
              className={styles.status_button}
              onClick={() => handleUpdateStatus(2, 'A caminho')}
            >
              {t('SetOnTheWay')}
            </button>
          )}
        {orderDetails.status !== 'Entregue' && (
          <button
            className={`${styles.status_button} ${styles.delivered_button}`}
            onClick={() => handleUpdateStatus(3, 'Entregue')}
          >
            {t('SetDelivered')}
          </button>
        )}
      </div>
    </div>
  );
}
