import { Children, isValidElement, ReactElement } from 'react';
import { ColumnProps } from './Column';
import styles from './table.module.scss';

export function Table({
  children,
  data,
  striped,
  alert,
  error
}: {
  children?: Array<ReactElement<ColumnProps>> | ReactElement<ColumnProps>;
  data: Array<unknown>;
  striped?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  alert?: (data: any) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: (data: any) => boolean;
}) {
  return (
    <div className={styles.tableContent}>
      <table className={styles.table}>
        <thead>
          <tr>
            {Children.map(children, child => {
              if (isValidElement(child)) {
                return {
                  ...child
                };
              }

              return child;
            })}
          </tr>
        </thead>
        <tbody>
          {
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            data?.map((item: any, i: number) => {
              const hasError = error != undefined ? error(item) : false;
              const hasAlert = alert != undefined ? alert(item) : false;

              return (
                <tr
                  className={
                    (striped && i % 2 == 1 ? styles.striped : '') +
                    ' ' +
                    (hasError ? styles.error : hasAlert ? styles.alert : '')
                  }
                  key={i}
                >
                  {Children.map(children, child => {
                    if (isValidElement(child)) {
                      const element =
                        child as unknown as ReactElement<ColumnProps>;

                      let props = {};

                      const template = element.props.template;
                      const all = element.props.all;

                      const className = element.props.cellClassName;
                      if (className != undefined) {
                        props = { ...props, className };
                      }

                      const style = element.props.cellStyle;
                      if (style != undefined) {
                        props = { ...props, style };
                      }

                      const id = element.props.id;

                      if (all != undefined && template != undefined) {
                        return (
                          <td
                            {...props}
                            key={`${i}${id != undefined ? id : ''}`}
                          >
                            {template(item)}
                          </td>
                        );
                      } else if (id != undefined) {
                        if (template != undefined) {
                          return (
                            <td {...props} key={`${id}-${i}`}>
                              {template(item[id])}
                            </td>
                          );
                        } else {
                          return (
                            <td {...props} key={`${id}-${i}`}>
                              {item[id]}
                            </td>
                          );
                        }
                      } else {
                        return <td></td>;
                      }
                    }
                    return <td></td>;
                  })}
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
}

export { Column } from './Column';
