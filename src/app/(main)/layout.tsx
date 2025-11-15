import PageHeader from '@/components/shared/PageHeader';
import styles from '../layout.module.scss';

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader />
      <main className={styles.page_wrapper}>{children}</main>
    </>
  );
}
