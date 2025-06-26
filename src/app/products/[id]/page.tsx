// src/app/products/[id]/page.tsx
import RouteProtection from '@/components/server/RouteProtection';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { signOut } from '../../auth';
import styles from './page.module.scss';
import Product_Page from './product_by_id';

// Importe o ProductsService e o tipo ProductType
import { ProductsService } from '@/services/ProductsService';
import { ProductType } from '@/types/products';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ProductById_Page({ params }: any) {
  // Desestruture o 'locale' e o 'id' dos parâmetros
  const { locale, id }: { locale: string; id: string } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Pages.Products');

  let product: ProductType | null = null; // Inicializa o produto como null

  try {
    const productId = parseInt(id, 10); // Converte o ID da URL para número

    if (isNaN(productId)) {
      // Se o ID não for um número válido, você pode:
      // 1. Redirecionar para uma página 404: notFound(); (importar de 'next/navigation')
      // 2. Retornar uma página de erro ou mensagem:
      console.error('Invalid product ID provided:', id);
      // Você pode optar por retornar um JSX diferente aqui para um ID inválido
      return (
        <div className={styles.error_container}>
          <h1>{t('Errors.invalidProductId')}</h1>
        </div>
      );
    }

    // Chama o ProductsService para buscar o produto por ID
    product = await ProductsService.getProductById(productId);

    if (!product) {
      // Se o produto não for encontrado, você pode:
      // 1. Redirecionar para uma página 404: notFound();
      // 2. Retornar uma página de erro ou mensagem:
      console.error('Product not found for ID:', productId);
      return (
        <div className={styles.error_container}>
          <h1>{t('Errors.productNotFound')}</h1>
        </div>
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching product for page:', error.message);
    // Em caso de erro na busca, defina product como null e mostre uma mensagem de erro
    product = null;
    return (
      <div className={styles.error_container}>
        <h1>{t('Errors.fetchError')}</h1>
      </div>
    );
  }

  // Se o produto não for nulo (foi encontrado e sem erros), renderize a página
  if (!product) {
    // Isso é um fallback caso o erro acima não tenha retornado um JSX
    // Em produção, `notFound()` de 'next/navigation' é geralmente preferível para 404
    return (
      <div className={styles.error_container}>
        <h1>{t('Errors.unknownError')}</h1>
      </div>
    );
  }

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
          {/* Passa o objeto `product` para o componente Product_Page */}
          <Product_Page product={product} />
        </div>
      </div>
    </>
  );
}
