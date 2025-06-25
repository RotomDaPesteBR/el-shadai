import styles from './Textbox.module.scss';

export default function Textbox({ ...props }) {
  return (
    <input
      className={`${styles.container} ${props.className ?? ''}`}
      {...props}
    />
  );
}
