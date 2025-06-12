import ProductCard from './ProductCard';
import styles from './Products.module.scss';

type ProductType = {
  id: number;
  name: string;
  price: string;
  image: string;
};

export default function Products({ ...props }) {
  return (
    <div
      className={`${styles.products_wrapper} ${
        !props.selected ? styles.disabled : ''
      }`}
    >
      {props.data?.map((data: ProductType, i: number) => {
        return (
          <ProductCard
            key={data.id || i}
            title={data.name}
            price={data.price}
            image={data.image}
          />
        );
      })}
    </div>
  );
}
