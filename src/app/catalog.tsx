'use client';

import Products from '@/components/Products';
import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from './page.module.scss';

type ProductType = {
  id: number;
  name: string;
  price: string;
  image: string;
};

export default function Catalog() {
  const [rations, setRations] = useState<Array<ProductType>>([]);
  const [toys, setToys] = useState<Array<ProductType>>([]);
  const [accessories, setAccessories] = useState<Array<ProductType>>([]);

  const [selectedTab, setSelectedTab] = useState<number>(0);

  async function getProducts() {
    try {
      const res = await axios.get('/api/v1/products');

      const products = res.data;

      setRations(products['racoes']);
      setToys(products['brinquedos']);
      setAccessories(products['acessorios']);
    } catch {
      console.log('Erro');
    }
  }

  // useEffect(() => {
  //   const tempRation: Array<ProductType> = [];
  //   const tempToys: Array<ProductType> = [];
  //   const tempAccessories: Array<ProductType> = [];

  //   let i: number = 0;

  //   for (i; i <= 20; i++) {
  //     const rationExample: ProductType = {
  //       id: i,
  //       name: 'Ração ' + (i + 1),
  //       price: 'R$20,00',
  //       image: '/images/food.png'
  //     };

  //     tempRation.push(rationExample);

  //     const toyExample: ProductType = {
  //       id: i,
  //       name: 'Brinquedo ' + (i + 1),
  //       price: 'R$40,00',
  //       image: '/images/food.png'
  //     };

  //     tempToys.push(toyExample);

  //     const accessoriesExample: ProductType = {
  //       id: i,
  //       name: 'Acessório ' + (i + 1),
  //       price: 'R$30,00',
  //       image: '/images/food.png'
  //     };

  //     tempAccessories.push(accessoriesExample);
  //   }

  //   setRations(tempRation);
  //   setToys(tempToys);
  //   setAccessories(tempAccessories);
  // }, []);

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <>
      <div className={styles.products_container}>
        <div className={styles.products_tabs}>
          <div
            className={styles.products_tabs_btn}
            onClick={() => setSelectedTab(0)}
          >
            Rações
          </div>
          <div
            className={styles.products_tabs_btn}
            onClick={() => setSelectedTab(1)}
          >
            Brinquedos
          </div>
          <div
            className={styles.products_tabs_btn}
            onClick={() => setSelectedTab(2)}
          >
            Acessórios
          </div>
        </div>
        <div className={styles.products_scroller}>
          <Products data={rations} selected={selectedTab == 0} />
          <Products data={toys} selected={selectedTab == 1} />
          <Products data={accessories} selected={selectedTab == 2} />
        </div>
      </div>
    </>
  );
}
