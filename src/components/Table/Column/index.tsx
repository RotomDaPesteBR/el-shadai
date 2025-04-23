export type ColumnProps = {
  id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Column({ id, children, ...props }: ColumnProps) {
  return (
    <th key={props?.key ?? 0} className={props?.className} style={props?.style}>
      {children}
    </th>
  );
}
