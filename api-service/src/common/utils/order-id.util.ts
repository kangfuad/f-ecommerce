/**
 * Generates an Order ID in the format EPS-YYYYMMDD-XXXX
 * e.g., EPS-20260826-8901
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return `EPS-${year}${month}${day}-${randomSuffix}`;
}
