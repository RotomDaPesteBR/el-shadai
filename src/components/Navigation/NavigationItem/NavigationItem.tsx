'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NavigationItemProps from './NavigationItem.d';
import styles from './NavigationItem.module.scss';

export default function NavigationItem({
  href,
  children
}: NavigationItemProps) {
  const path = usePathname().toLocaleLowerCase();

  const pathRoot = path.match(/(\/?[a-z A-Z 0-9]*)/g)?.[0] ?? path;

  return (
    <Link
      href={href}
      className={
        styles.Container +
        (pathRoot == href.toLocaleLowerCase()
          ? ` ${styles.selectedNavItem}`
          : '')
      }
    >
      {children}
    </Link>
  );
}
