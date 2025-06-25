import { ptBR } from 'date-fns/locale';
import { default as Picker, registerLocale } from 'react-datepicker';
import styles from './DatePicker.module.scss';

registerLocale('ptBR', ptBR);

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export default function DatePicker({ children, className, ...props }: any) {
  return (
    <div className={styles.datePickerWrapper}>
      <Picker
        name="date"
        className={`date-picker${
          className != undefined ? ' ' + className : ''
        }`}
        locale="ptBR"
        dateFormat="dd/MM/yyyy"
        showIcon
        {...props}
      />
    </div>
  );
}
