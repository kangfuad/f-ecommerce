import { generateOrderId } from './order-id.util';

describe('generateOrderId', () => {
  it('should generate order ID matching EPS-YYYYMMDD-XXXX format', () => {
    const orderId = generateOrderId();
    expect(orderId).toMatch(/^EPS-\d{8}-\d{4}$/);
  });
});
