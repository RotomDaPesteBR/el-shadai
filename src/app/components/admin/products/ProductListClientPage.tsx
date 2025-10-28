"use client";

import { toFormattedPrice } from '@/lib/toFormattedPrice';
import { useTranslations } from 'next-intl';
import Image from 'next/image'; // Import Next.js Image component
import Link from 'next/link';
import { useState } from 'react';
import styles from './ProductListClientPage.module.scss';

interface ProductSummary {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
  categoryId: number;
  categoryName: string;
}

interface ProductListClientPageProps {
  initialProducts: ProductSummary[];
  initialLoading: boolean;
  initialError: string | null;
}

export default function ProductListClientPage({
  initialProducts,
  initialLoading,
  initialError,
}: ProductListClientPageProps) {
  const t = useTranslations('Pages.AdminProducts');
  const products = initialProducts;
  const loading = initialLoading;
  const error = initialError;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('Title')}</h2>
        <p>Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('Title')}</h2>
        <p className={styles.error_message}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('Title')}</h2>

      <div className={styles.actions}>
        <input
          type="text"
          placeholder={t('SearchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.search_input}
        />
        <Link href="/admin/products/add" className={styles.add_button}>
          {t('AddProduct')}
        </Link>
      </div>

      {filteredProducts.length === 0 ? (
        <p>{t('NoProductsFound')}</p>
      ) : (
        <ul className={styles.product_list}>
          {filteredProducts.map((product) => (
            <li key={product.id} className={styles.product_list_item}>
              <div className={styles.product_info}>
                <Image
                  src={product.image ?? '/images/food.png'}
                  alt={product.name}
                  width={50}
                  height={50}
                  className={styles.product_image}
                />
                <div>
                  <h3>{product.name}</h3>
                  <p>{t('Category')}: {product.categoryName}</p>
                  <p>{t('Price')}: {toFormattedPrice(product.price.toString())}</p>
                  <p>{t('Stock')}: {product.stock}</p>
                </div>
              </div>
              <Link href={`/admin/products/${product.id}`} className={styles.edit_button}>
                {t('Edit')}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
