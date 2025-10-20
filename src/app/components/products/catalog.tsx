'use client';

import Products from '@/components/shared/Products';
import { CategoryType } from '@/types/categories';
import { GroupedProducts } from '@/types/products';
import { useState } from 'react';
import styles from './catalog.module.scss';

export default function CatalogClient({
  categories,
  products
}: {
  categories: Array<CategoryType>;
  products: GroupedProducts;
}) {
  const [selectedTab, setSelectedTab] = useState<number>(categories[0].id);

  return (
    <>
      <div className={styles.products_container}>
        <div className={styles.products_tabs}>
          {categories.map(category => (
            <div
              key={category.id}
              className={`${styles.products_tabs_btn} ${
                selectedTab == category.id
                  ? styles.products_tabs_btn_selected
                  : ''
              }`}
              onClick={() => setSelectedTab(category.id)}
            >
              {category.name}
            </div>
          ))}
        </div>
        <div className={styles.products_scroller}>
          {categories.map(category => (
            <Products
              key={category.id}
              data={products[category.id]}
              selected={selectedTab == category.id}
            />
          ))}
        </div>
      </div>
    </>
  );
}
