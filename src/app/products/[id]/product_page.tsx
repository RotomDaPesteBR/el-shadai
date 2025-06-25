'use client';

import Textbox from '@/components/shared/Textbox/Textbox';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './page.module.scss';

// type ProductType = {
//   id: number;
//   name: string;
//   price: string;
//   image: string;
// };

export default function Product_Page({ Id }: { Id: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(undefined);

  const [quantity, setQuantity] = useState<number>(1);

  async function getProduct() {
    try {
      const res = await axios.get(`/api/v1/products/${Id}`);

      setProduct(res.data);
    } catch (ex) {
      console.error(ex);
    }
  }

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

  useEffect(() => {
    getProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={styles.product_container}>
        <div>{product?.name}</div>
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
            R${parseFloat(product?.price ?? 0).toFixed(2)}
          </div>
        </div>
      </div>
    </>
  );
}
