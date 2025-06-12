import Image from 'next/image';
import styles from './ProductCard.module.scss';

export default function ProductCard({ ...props }) {
  return (
    <div className={styles.product}>
      <div className={styles.product_image}>
        <Image src={props.image} width={500} height={500} alt="" />
      </div>
      <div className={styles.product_info}>
        <span className={styles.product_title}>{props.title}</span>
        <span className={styles.product_price}>
          R${parseFloat(props.price).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
