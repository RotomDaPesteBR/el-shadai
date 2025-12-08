'use client';

import { useCart } from '@/context/CartContext';
import { toFormattedPrice } from '@/lib/toFormattedPrice';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './CheckoutForm.module.scss';

export default function CheckoutForm() {
  const { cart, getCartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>(
    'cash'
  );
  const [changeNeeded, setChangeNeeded] = useState<number | ''>('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>(
    'delivery'
  );
  const [formError, setFormError] = useState<string | null>(null); // New state for persistent error

  const t = useTranslations('Pages.Checkout');

  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);

  const handleConfirmOrder = async () => {
    setFormError(null); // Clear previous errors
    if (cart.length === 0) {
      const errorMessage = t('CartEmptyMessage');
      toast.error(errorMessage, { duration: 3000 });
      setFormError(errorMessage);
      return;
    }

    if (deliveryOption === 'delivery' && !userAddress) {
      const errorMessage = t('DeliveryAddressRequired');
      toast.error(errorMessage, { duration: 3000 });
      setFormError(errorMessage);
      return;
    }

    try {
      const response = await fetch('/api/v1/order/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod,
          changeNeeded: paymentMethod === 'cash' ? changeNeeded : undefined,
          deliveryOption,
          cartItems: cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            name: item.name
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.message || t('FailedToConfirmOrder');
        if (response.status === 400 && data.errors) {
          // Stock validation failed
          const errorMessages = data.errors
            .map(
              (err: {
                productId: number;
                productName: string;
                availableStock: number;
              }) =>
                `${err.productName}: ${
                  err.availableStock > 0
                    ? t('StockProblemAvailable', { count: err.availableStock })
                    : t('StockProblemOutOfStock')
                }`
            )
            .join('\n');
          errorMessage = `${t('StockProblemTitle')}\n${errorMessages}`;
          toast.error(errorMessage, { duration: 6000 });
          setFormError(errorMessage);
        } else {
          toast.error(errorMessage, { duration: 3000 });
          setFormError(errorMessage);
        }
        return;
      }

      toast.success(t('OrderConfirmedSuccessfully'), { duration: 3000 });
      setOrderConfirmed(true);
      clearCart(); // Clear cart after order is placed
    } catch (error) {
      console.error('Error confirming order:', error);
      const errorMessage = t('UnexpectedErrorConfirmingOrder');
      toast.error(errorMessage, { duration: 3000 });
      setFormError(errorMessage);
    }
  };

  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const response = await fetch('/api/v1/user/address');
        if (!response.ok) {
          throw new Error('Failed to fetch address');
        }
        const data = await response.json();
        setUserAddress(data.address);
      } catch (error) {
        console.error('Error fetching user address:', error);
        setAddressError(t('FailedToLoadAddress'));
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchUserAddress();
  }, []);

  if (orderConfirmed) {
    return (
      <div className={styles.checkout_container}>
        <h2 className={styles.checkout_title}>{t('OrderConfirmedTitle')}</h2>
        <p className={styles.confirmation_message}>
          {t('ConfirmationMessage1')}
        </p>
        <p className={styles.confirmation_message}>
          {t('ConfirmationMessage2')}
        </p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.checkout_container}>
        <h2 className={styles.checkout_title}>{t('CartEmptyTitle')}</h2>
        <p>{t('CartEmptyMessage')}</p>
      </div>
    );
  }

  return (
    <div className={styles.checkout_container}>
      <h2 className={styles.checkout_title}>{t('Title')}</h2>
      <div className={styles.section}>
        <h3 className={styles.section_title}>{t('DeliveryOption')}</h3>
        <div className={styles.delivery_options}>
          <label className={styles.radio_label}>
            <input
              type="radio"
              value="delivery"
              checked={deliveryOption === 'delivery'}
              onChange={() => setDeliveryOption('delivery')}
            />
            {t('HomeDelivery')}
          </label>
          <label className={styles.radio_label}>
            <input
              type="radio"
              value="pickup"
              checked={deliveryOption === 'pickup'}
              onChange={() => setDeliveryOption('pickup')}
            />
            {t('StorePickup')}
          </label>
        </div>
      </div>
      {deliveryOption === 'delivery' && (
        <div className={styles.section}>
          <h3 className={styles.section_title}>{t('DeliveryAddress')}</h3>
          {loadingAddress && <p>{t('LoadingAddress')}</p>}
          {addressError && (
            <p className={styles.error_message}>{addressError}</p>
          )}
          {userAddress && <p className={styles.address_text}>{userAddress}</p>}
          {!loadingAddress && !userAddress && !addressError && (
            <p>{t('NoAddressFound')}</p>
          )}
          {/* In a real app, there would be an option to change/select address */}
        </div>
      )}
      <div className={styles.section}>
        <h3 className={styles.section_title}>{t('OrderItems')}</h3>
        <ul className={styles.item_list}>
          {cart.map(item => (
            <li key={item.id} className={styles.item_list_item}>
              <span>
                {item.name} (x{item.quantity})
              </span>
              <span>
                {toFormattedPrice((item.price * item.quantity).toString())}
              </span>
            </li>
          ))}
        </ul>
        <div className={styles.total_amount}>
          <strong>{t('Total')}</strong>{' '}
          {toFormattedPrice(getCartTotal().toString())}
        </div>
      </div>
      <div className={styles.section}>
        <h3 className={styles.section_title}>{t('PaymentMethod')}</h3>
        <div className={styles.payment_options}>
          <label className={styles.radio_label}>
            <input
              type="radio"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
            />
            {t('Cash')}
          </label>
          <label className={styles.radio_label}>
            <input
              type="radio"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
            />
            {t('CardMachine')}
          </label>
        </div>

        {paymentMethod === 'cash' && (
          <div className={styles.change_input_wrapper}>
            <label htmlFor="changeNeeded">{t('ChangeNeeded')}</label>
            <input
              type="number"
              id="changeNeeded"
              value={changeNeeded}
              onChange={e => setChangeNeeded(parseFloat(e.target.value) || '')}
              placeholder="Ex: 50.00"
              className={styles.change_input}
            />
          </div>
        )}
      </div>
      {formError && <p className={styles.error_message}>{formError}</p>}{' '}
      {/* Display persistent error */}
      <button className={styles.confirm_order_btn} onClick={handleConfirmOrder}>
        {t('ConfirmOrder')}
      </button>
    </div>
  );
}
