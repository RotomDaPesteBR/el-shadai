'use client';

import Textbox from '@/components/shared/Textbox/Textbox';
import { toFormattedPrice } from '@/lib/toFormattedPrice';
import { ProductType } from '@/types/products';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import styles from './page.module.scss';

// type ProductType = {
//   id: number;
//   name: string;
//   price: string;
//   image: string;
// };

export default function ProductById({ product }: { product: ProductType }) {
  const [quantity, setQuantity] = useState<number>(1);

  function handleQuantityChange(value: number) {
    if (value >= 1) {
      setQuantity(value);
    } else {
      setQuantity(1);
    }
  }

  function handleQuantityDecrease() {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    } else {
      setQuantity(1);
    }
  }

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
                onClick={() => setQuantity(prev => prev + 1)}
              >
                +
              </button>
              <Textbox
                className={`${styles.product_quantity_input}`}
                value={quantity}
                onChange={(e: { target: { value: number } }) => {
                  handleQuantityChange(e.target.value);
                }}
              />
              <button
                className={`${styles.product_quantity_btn} ${styles.product_quantity_btn_decrease}`}
                onClick={() => handleQuantityDecrease()}
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
          <button className={styles.add_shopping_cart_btn}>
            Adicionar ao carrinho
          </button>
          <Link className={styles.cancel_btn} href={'/products'}>
            Cancelar
          </Link>
        </div>
      </div>
    </>
  );
}
