"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './NavigationBar.module.scss';

export default function NavigationBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('Components.Layout.Navigation');

  const userRole = session?.user?.role;

  return (
    <nav className={styles.navigation_bar}>
      <div className={styles.nav_buttons_container}>
        <Link href="/products" className={styles.nav_button} title={t('Products')}>
          🛒
        </Link>
        <Link href="/cart" className={styles.nav_button} title={t('Cart')}>
          🛍️
        </Link>
        <Link href="/orders" className={styles.nav_button} title={t('Orders')}>
          📦
        </Link>

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

        {(userRole === 'delivery' || userRole === 'admin')&& (
          <Link href="/delivery" className={styles.nav_button} title={t('DeliveryOrders')}>
            🚚
          </Link>
        )}
      </div>
    </nav>
  );
}
