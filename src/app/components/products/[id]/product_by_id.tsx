'use client';

import { useCart } from '@/context/CartContext';
import { toFormattedPrice } from '@/lib/toFormattedPrice';
import { ProductType } from '@/types/products';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Textbox from '@/components/shared/Textbox/Textbox';
import styles from './page.module.scss';

export default function ProductById({ product }: { product: ProductType }) {
  const [quantity, setQuantity] = useState<number>(1);
  const { addToCart } = useCart();
  const router = useRouter();

  const handleQuantityChange = (value: number) => {
    if (isNaN(value) || value < 1) {
      setQuantity(1);
      return;
    }
    if (value > product.stock) {
      setQuantity(product.stock);
      toast.error(
        `A quantidade máxima para "${product.name}" é ${product.stock}.`
      );
    } else {
      setQuantity(value);
    }
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (quantity + 1 > product.stock) {
      toast.error(
        `A quantidade máxima para "${product.name}" é ${product.stock}.`
      );
    } else {
      setQuantity(prev => prev + 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (quantity > product.stock) {
      toast.error(
        `A quantidade solicitada (${quantity}) excede o estoque disponível (${product.stock}).`
      );
      return;
    }

    if (product.stock <= 0) {
      toast.error('Este produto está fora de estoque.');
      return;
    }

    addToCart(product, quantity);
    toast.success(`${product.name} adicionado ao carrinho!`);

    setTimeout(() => {
      router.push('/cart');
    }, 1000);
  };

  return (
    <>
      <div className={styles.product_container}>
        <div className={styles.product_name}>{product?.name}</div>
        <div className={styles.product_image}>
          <Image
            priority={true}
            src={product?.image ?? '/images/food.png'}
            height={500}
            width={500}
            alt=""
          />
        </div>
        <div className={styles.product_info}>
          <div className={styles.product_info_upper}>
            <div className={styles.product_description}>
              Descrição: {product?.description}
            </div>
            <div className={styles.product_quantity_wrapper}>
              <button
                className={`${styles.product_quantity_btn} ${styles.product_quantity_btn_increase}`}
                onClick={handleQuantityIncrease}
              >
                +
              </button>
              <Textbox
                className={`${styles.product_quantity_input}`}
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleQuantityChange(parseInt(e.target.value));
                }}
              />
              <button
                className={`${styles.product_quantity_btn} ${styles.product_quantity_btn_decrease}`}
                onClick={handleQuantityDecrease}
              >
                -
              </button>
            </div>
          </div>
          <div className={styles.product_price}>
            Preço: {toFormattedPrice(product?.price.toString() ?? 0)}
          </div>
        </div>
        <div className={styles.action_buttons}>
          {product.stock <= 0 ? (
            <button className={`${styles.add_shopping_cart_btn} ${styles.out_of_stock_btn}`} disabled>
              Fora de estoque
            </button>
          ) : (
            <button
              className={styles.add_shopping_cart_btn}
              onClick={handleAddToCart}
            >
              Adicionar ao carrinho
            </button>
          )}
          <Link className={styles.cancel_btn} href={'/products'}>
            Cancelar
          </Link>
        </div>
      </div>
    </>
  );
}
