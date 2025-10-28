"use client";

import { useCart } from '@/context/CartContext';
import { toFormattedPrice } from '@/lib/toFormattedPrice';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './index.module.scss';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className={styles.cart_container}>
        <h2 className={styles.cart_title}>Seu carrinho está vazio</h2>
      </div>
    );
  }

  return (
    <div className={styles.cart_container}>
      <h2 className={styles.cart_title}>Seu Carrinho</h2>
      <div className={styles.cart_items}>
        {cart.map((item) => (
          <div key={item.id} className={styles.cart_item}>
            <Image
              src={item.image ?? '/images/food.png'}
              alt={item.name}
              width={80}
              height={80}
              className={styles.cart_item_image}
            />
            <div className={styles.cart_item_details}>
              <h3 className={styles.cart_item_name}>{item.name}</h3>
              <p className={styles.cart_item_price}>
                {toFormattedPrice(item.price.toString())} x {item.quantity} = {toFormattedPrice((item.price * item.quantity).toString())}
              </p>
              <div className={styles.cart_item_actions}>
                <button
                  className={styles.quantity_btn}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, parseInt(e.target.value))
                  }
                  className={styles.quantity_input}
                />
                <button
                  className={styles.quantity_btn}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  className={styles.remove_btn}
                  onClick={() => removeFromCart(item.id)}
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.cart_summary}>
        <h3 className={styles.cart_total}>Total: {toFormattedPrice(getCartTotal().toString())}</h3>
        <button className={styles.clear_cart_btn} onClick={clearCart}>
          Limpar Carrinho
        </button>
        <button className={styles.checkout_btn} onClick={handleCheckout}>
          Finalizar Compra
        </button>
      </div>
    </div>
  );
}