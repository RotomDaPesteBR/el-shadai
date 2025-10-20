import Image from 'next/image';
import styles from './Logo.module.scss';

export default function Logo() {
  return (
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
  );
}
