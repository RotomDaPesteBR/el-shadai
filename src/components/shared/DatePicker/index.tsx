import { ptBR } from 'date-fns/locale';
import { ReactNode } from 'react';
import { default as Picker, registerLocale } from 'react-datepicker';
import styles from './DatePicker.module.scss';

registerLocale('ptBR', ptBR);

interface DatePickerProps {
  children?: ReactNode;
  className?: string;
  inputClassName?: string;
  [key: string]: unknown;
}

export default function DatePicker({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children,
  className,
  inputClassName,
  ...props
}: DatePickerProps) {
  const classes = [styles.datePickerWrapper];
  if (className) {
    classes.push(className);
  }
  const classNames = classes.join(' ');

  const inputClasses = ['date-picker'];
  if (inputClassName) {
    inputClasses.push(inputClassName);
  }
  const inputClassNames = inputClasses.join(' ');

  return (
    <div className={classNames}>
      <Picker
        name="date"
        className={inputClassNames}
        locale="ptBR"
        dateFormat="dd/MM/yyyy"
        showIcon
        {...props}
      />
    </div>
  );
}
