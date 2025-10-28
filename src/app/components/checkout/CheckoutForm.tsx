'use client';

import { useCart } from '@/context/CartContext';
import { toFormattedPrice } from '@/lib/toFormattedPrice';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './CheckoutForm.module.scss';

export default function CheckoutForm() {
  const { cart, getCartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [changeNeeded, setChangeNeeded] = useState<number | ''>('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>(
    'delivery'
  );

  const t = useTranslations('Pages.Checkout');

  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      toast.error('Seu carrinho está vazio.');
      return;
    }

    if (deliveryOption === 'delivery' && !userAddress) {
      toast.error(
        'Por favor, selecione um endereço de entrega ou escolha buscar na loja.'
      );
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
        if (response.status === 400 && data.errors) {
          // Stock validation failed
          const errorMessages = data.errors
            .map(
              (err: { productId: number; productName: string; availableStock: number }) =>
                `${err.productName}: ${
                  err.availableStock > 0
                    ? `Apenas ${err.availableStock} em estoque.`
                    : `Fora de estoque.`
                }`
            )
            .join('\n');
          toast.error(`Problema de estoque:\n${errorMessages}`, {
            duration: 6000
          });
        } else {
          toast.error(data.message || 'Erro ao confirmar o pedido.');
        }
        return;
      }

      toast.success('Pedido confirmado com sucesso!');
      setOrderConfirmed(true);
      clearCart(); // Clear cart after order is placed
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Ocorreu um erro inesperado ao confirmar o pedido.');
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
        setAddressError('Não foi possível carregar o endereço de entrega.');
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchUserAddress();
  }, []);

  if (orderConfirmed) {
    return (
      <div className={styles.checkout_container}>
        <h2 className={styles.checkout_title}>Pedido Confirmado!</h2>
        <p className={styles.confirmation_message}>
          Seu pedido foi recebido e será processado em breve.
        </p>
        <p className={styles.confirmation_message}>
          Agradecemos a sua preferência!
        </p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.checkout_container}>
        <h2 className={styles.checkout_title}>Seu carrinho está vazio.</h2>
        <p>Adicione produtos para finalizar seu pedido.</p>
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
          {loadingAddress && <p>Carregando endereço...</p>}
          {addressError && (
            <p className={styles.error_message}>{addressError}</p>
          )}
          {userAddress && <p className={styles.address_text}>{userAddress}</p>}
          {!loadingAddress && !userAddress && !addressError && (
            <p>Nenhum endereço encontrado. Por favor, atualize seu perfil.</p>
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

      <button className={styles.confirm_order_btn} onClick={handleConfirmOrder}>
        {t('ConfirmOrder')}
      </button>
    </div>
  );
}
