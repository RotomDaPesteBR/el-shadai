import styles from './Header.module.scss';

export default function TenarisHeader({ ...props }) {
  return (
    <>
      <header className={`${styles.Container} ${props.className}`} id="header">
        <div className={styles.TopBar}>
          <div className={styles.LogoContainer}>
            <img className={styles.LogoImg} src={null} alt="" />
          </div>
        </div>
      </header>
      {props.children}
    </>
  );
}
