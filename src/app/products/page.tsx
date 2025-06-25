import RouteProtection from '@/components/server/RouteProtection';
import { GroupedProducts, ProductType } from '@/types/products';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { signOut } from '../auth';
import Catalog from '../components/catalog';
import styles from './page.module.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Home({ params }: any) {
  const { locale }: { locale: string } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Pages.Index');

  let products: ProductType[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = []; // Ajuste 'any[]' para o tipo correto da sua categoria

  try {
    // --- Requisição para Produtos usando fetch ---
    const productsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/products`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        next: { revalidate: 3600 }
      }
    );

    if (!productsResponse.ok) {
      console.error(
        `Failed to fetch products: ${productsResponse.status} ${productsResponse.statusText}`
      );
      // Aqui você pode lançar um erro, retornar uma página de erro, ou uma lista vazia
      throw new Error('Failed to fetch products');
    }
    products = await productsResponse.json();

    const categoriesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/categories`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        next: { revalidate: 36000 }
      }
    );

    if (!categoriesResponse.ok) {
      console.error(
        `Failed to fetch categories: ${categoriesResponse.status} ${categoriesResponse.statusText}`
      );
      throw new Error('Failed to fetch categories');
    }

    categories = await categoriesResponse.json();
  } catch (error) {
    console.error('Error fetching data for catalog:', error);
    // Aqui você pode decidir o que fazer se a busca falhar (e.g., mostrar mensagem de erro, dados vazios)
    // Para este exemplo, as listas permanecerão vazias se um erro ocorrer.
  }

  const groupedProducts: GroupedProducts = {};

  products.forEach((product: ProductType) => {
    if (!groupedProducts[product.categoryId]) {
      groupedProducts[product.categoryId] = [];
    }

    groupedProducts[product.categoryId].push(product);
  });

  return (
    <>
      <title>{t('Title')}</title>
      <RouteProtection />
      <div className={`font-[family-name:inter] ${styles.container}`}>
        <div className={`${styles.content}`}>
          <div className={styles.header}>
            <form
              action={async () => {
                'use server';
                await signOut();
                return;
              }}
            >
              <button className={styles.logout_btn}>Logout</button>
            </form>
            <div className={styles.logo}>
              <Image
                src="/images/logo.png"
                alt="El Shadai Logo"
                height={1000}
                width={1000}
                draggable={false}
              />
              <div className={styles.logo_title}>El Shadai</div>
            </div>
            <div className={styles.header_spacing} />
          </div>
          <Catalog categories={categories} products={groupedProducts} />
        </div>
      </div>
    </>
  );
}
