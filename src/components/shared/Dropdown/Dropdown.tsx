import styles from './Dropdown.module.scss';

export default function Dropdown({ ...props }) {
  const { children } = props;

  return (
    <select
      className={`${styles.container} ${props.className ?? ''}`}
      {...props}
    >
      {children}
    </select>
  );
}
