export function toFormattedPrice(number: string): string {
  return `R$${parseFloat(number).toFixed(2).replace('.', ',')}`;
}
