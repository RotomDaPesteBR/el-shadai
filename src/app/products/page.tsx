import RouteProtection from '@/components/server/RouteProtection';
import { CategoriesService } from '@/services/CategoriesService';
import { ProductsService } from '@/services/ProductsService';
import { CategoryType } from '@/types/categories';
import { GroupedProducts, ProductType } from '@/types/products';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { signOut } from '../auth';
import Catalog from '../components/catalog';
import styles from './page.module.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Products({ params }: any) {
  const { locale }: { locale: string } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Pages.Products');

  let products: ProductType[] = [];
  let categories: CategoryType[] = [];

  try {
    products = await ProductsService.getAllProducts();
    categories = await CategoriesService.getAllCategories();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching data for catalog:', error.message);
    products = [];
    categories = [];
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
