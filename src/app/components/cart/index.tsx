'use client';

import { useCart } from '@/context/CartContext';
import { toFormattedPrice } from '@/lib/toFormattedPrice';
import { CartItem } from '@/types';
import { ProductType } from '@/types/products';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import styles from './index.module.scss';

interface CartProps {
  initialProducts: ProductType[];
}

export default function Cart({ initialProducts }: CartProps) {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    updateCartItemStock,
    isCartValid,
    getInvalidCartItems
  } = useCart();
  const router = useRouter();

  // Effect to reconcile cart items with latest stock from initialProducts
  useEffect(() => {
    if (initialProducts && cart.length > 0) {
      cart.forEach((cartItem: CartItem) => {
        const latestProductInfo = initialProducts.find(
          p => p.id === cartItem.id
        );
        if (latestProductInfo) {
          // Update stock in cart context
          if (cartItem.stock !== latestProductInfo.stock) {
            updateCartItemStock(cartItem.id, latestProductInfo.stock);
          }

          // If cart quantity exceeds latest stock, adjust and notify
          if (cartItem.quantity > latestProductInfo.stock) {
            updateQuantity(cartItem.id, latestProductInfo.stock); // Adjust quantity down to available stock
            toast.error(
              `A quantidade de "${cartItem.name}" foi ajustada para o estoque disponível (${latestProductInfo.stock}).`
            );
          }
        } else {
          // Product no longer exists, remove from cart
          removeFromCart(cartItem.id);
          toast.error(
            `O produto "${cartItem.name}" não está mais disponível e foi removido do seu carrinho.`
          );
        }
      });
    }
  }, [
    initialProducts,
    cart,
    updateCartItemStock,
    updateQuantity,
    removeFromCart
  ]);

  const handleCheckout = () => {
    const invalidItems = getInvalidCartItems();
    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map(item => item.name).join(', ');
      toast.error(
        `Os seguintes itens excedem o estoque: ${itemNames}. Por favor, ajuste as quantidades.`
      );
      return;
    }
    if (!isCartValid()) {
      toast.error(
        'Seu carrinho contém itens com quantidade inválida ou fora de estoque. Por favor, ajuste antes de finalizar a compra.'
      );
      return;
    }
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className={styles.cart_container}>
        <h2 className={styles.cart_title}>Seu carrinho está vazio</h2>
      </div>
    );
  }

  const cartIsValid = isCartValid();

  return (
    <div className={styles.cart_container}>
      <h2 className={styles.cart_title}>Seu Carrinho</h2>
      <div className={styles.cart_items}>
        {cart.map(item => (
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
                {toFormattedPrice(item.price.toString())} x {item.quantity} ={' '}
                {toFormattedPrice((item.price * item.quantity).toString())}
              </p>
              {item.quantity > item.stock && (
                <p className={styles.stock_error}>
                  Quantidade excede o estoque disponível ({item.stock})
                </p>
              )}
              <div className={styles.cart_item_actions}>
                <button
                  className={styles.quantity_btn}
                  onClick={() => {
                    if (item.quantity - 1 < 0) {
                      toast.error('A quantidade não pode ser menor que zero.');
                      return;
                    }
                    updateQuantity(item.id, item.quantity - 1);
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={e => {
                    const newQuantity = parseInt(e.target.value);
                    if (isNaN(newQuantity) || newQuantity < 0) {
                      toast.error('Por favor, insira uma quantidade válida.');
                      return;
                    }
                    if (newQuantity > item.stock) {
                      toast.error(
                        `A quantidade máxima para "${item.name}" é ${item.stock}.`
                      );
                      updateQuantity(item.id, item.stock); // Adjust to max stock
                      return;
                    }
                    updateQuantity(item.id, newQuantity);
                  }}
                  className={styles.quantity_input}
                />
                <button
                  className={styles.quantity_btn}
                  onClick={() => {
                    if (item.quantity + 1 > item.stock) {
                      toast.error(
                        `A quantidade máxima para "${item.name}" é ${item.stock}.`
                      );
                      return;
                    }
                    updateQuantity(item.id, item.quantity + 1);
                  }}
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
        <h3 className={styles.cart_total}>
          Total: {toFormattedPrice(getCartTotal().toString())}
        </h3>
        <button className={styles.clear_cart_btn} onClick={clearCart}>
          Limpar Carrinho
        </button>
        <button
          className={styles.checkout_btn}
          onClick={handleCheckout}
          disabled={!cartIsValid} // Disable if cart is not valid
        >
          Finalizar Compra
        </button>
      </div>
    </div>
  );
}
