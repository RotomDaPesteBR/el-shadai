import Image from 'next/image';
import styles from './Header.module.scss';

export default function TenarisHeader({ ...props }) {
  return (
    <>
      <header className={`${styles.Container} ${props.className}`} id="header">
        <div className={styles.TopBar}>
          <div className={styles.LogoContainer}>
            <Image
              height={500}
              width={500}
              className={styles.LogoImg}
              src={''}
              alt=""
            />
          </div>
        </div>
      </header>
      {props.children}
    </>
  );
}
