
import { auth } from '@/app/auth';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import styles from './NavigationBar.module.scss';

export default async function NavigationBar() {
  const session  = await auth();
  //const router = useRouter();
  const  t = await getTranslations('Components.Layout.Navigation');

  const userRole = session?.user?.role;

  return (
    <nav className={styles.navigation_bar}>
      <div className={styles.nav_buttons_container}>
        {userRole !== 'delivery' && (
          <>
            <Link href="/products" className={styles.nav_button} title={t('Products')}>
              🛍️
            </Link>
            <Link href="/cart" className={styles.nav_button} title={t('Cart')}>
              🛒
            </Link>
            <Link href="/orders" className={styles.nav_button} title={t('Orders')}>
              📦
            </Link>
          </>
        )}
        
        {(userRole === 'delivery' || userRole === 'admin')&& (
          <Link href="/delivery" className={styles.nav_button} title={t('DeliveryOrders')}>
            🚚
          </Link>
        )}

        {userRole === 'admin' && (
          <Link href="/admin/dashboard" className={styles.nav_button} title={t('AdminDashboard')}>
            📊
          </Link>
        )}

        {userRole === 'admin' && (
          <Link href="/admin/products" className={styles.nav_button} title={t('AdminProducts')}>
            ⚙️
          </Link>
        )}
      </div>
    </nav>
  );
}
