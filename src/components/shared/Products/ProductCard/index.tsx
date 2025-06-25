import { toFormattedPrice } from '@/lib/toFormattedPrice';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.scss';

export default function ProductCard({ ...props }) {
  return (
    <Link href={`/products/${props.id}`}>
      <div className={styles.product}>
        <div className={styles.product_image_container}>
          <div className={styles.product_image}>
            <Image src={props.image} width={500} height={500} alt="" />
          </div>
        </div>
        <div className={styles.product_info}>
          <span className={styles.product_title}>{props.title}</span>
          <span className={styles.product_price}>
            {toFormattedPrice(props.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
