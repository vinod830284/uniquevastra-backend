export class OrderNumberUtil {
  static generateOrderNumber(sequenceNumber: number): string {
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const seq = String(sequenceNumber).padStart(4, '0');

    return `UV-${year}${month}${day}-${seq}`;
  }
}
