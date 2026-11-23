jest.mock('../repositories/productRepository');
jest.mock('../repositories/orderRepository');

const productRepository = require('../repositories/productRepository');
const orderRepository = require('../repositories/orderRepository');
const orderService = require('../services/orderService');

const FRENCH_VANILLA = { productID: 1, sku: 'DVG-FRENCH-VANILLA', unitPrice: '7.65' };
const RASPBERRY      = { productID: 2, sku: 'DVG-RASPBERRY',      unitPrice: '6.32' };

beforeEach(() => {
  jest.clearAllMocks();
  orderRepository.insertOrder.mockResolvedValue(1);
});


test('uses the price from the database, not a price sent by the client', async () => {
  productRepository.findPricedBySkus.mockResolvedValue([FRENCH_VANILLA]);

  // The client claims this product costs one cent.
  await orderService.placeOrder(1, [
    { sku: 'DVG-FRENCH-VANILLA', quantity: 1, unitPrice: 0.01 }
  ]);

  const order = orderRepository.insertOrder.mock.calls[0][0];
  const lines = orderRepository.insertOrder.mock.calls[0][1];

  expect(lines[0].unitPrice).toBe('7.65');
  expect(order.subtotal).toBe('7.65');
  expect(order.orderTotal).toBe('23.19');
});


test('computes subtotal, tax, shipping and total for multiple items', async () => {
  productRepository.findPricedBySkus.mockResolvedValue([FRENCH_VANILLA, RASPBERRY]);

  const result = await orderService.placeOrder(1, [
    { sku: 'DVG-FRENCH-VANILLA', quantity: 1 },
    { sku: 'DVG-RASPBERRY',      quantity: 1 }
  ]);

  const order = orderRepository.insertOrder.mock.calls[0][0];

  expect(order.subtotal).toBe('13.97');
  expect(order.tax).toBe('0.98');
  expect(order.shipping).toBe('15.00');
  expect(order.orderTotal).toBe('29.95');
  expect(result.totalCents).toBe(2995);
});


test('multiplies the unit price by the quantity', async () => {
  productRepository.findPricedBySkus.mockResolvedValue([FRENCH_VANILLA]);

  await orderService.placeOrder(1, [
    { sku: 'DVG-FRENCH-VANILLA', quantity: 3 }
  ]);

  const lines = orderRepository.insertOrder.mock.calls[0][1];

  expect(lines[0].quantity).toBe(3);
  expect(lines[0].lineTotal).toBe('22.95');
});


test('rejects an empty cart with a 400 and saves nothing', async () => {
  await expect(orderService.placeOrder(1, []))
    .rejects.toMatchObject({ message: 'Cart is empty', status: 400 });

  expect(orderRepository.insertOrder).not.toHaveBeenCalled();
});


test('rejects an unknown product and saves nothing', async () => {
  productRepository.findPricedBySkus.mockResolvedValue([]);

  await expect(orderService.placeOrder(1, [{ sku: 'NOT-A-REAL-SKU', quantity: 1 }]))
    .rejects.toMatchObject({ status: 400 });

  expect(orderRepository.insertOrder).not.toHaveBeenCalled();
});


test('rejects a negative quantity and saves nothing', async () => {
  productRepository.findPricedBySkus.mockResolvedValue([FRENCH_VANILLA]);

  await expect(orderService.placeOrder(1, [{ sku: 'DVG-FRENCH-VANILLA', quantity: -5 }]))
    .rejects.toMatchObject({ message: 'Invalid quantity', status: 400 });

  expect(orderRepository.insertOrder).not.toHaveBeenCalled();
});


test('propagates a repository failure to the caller', async () => {
  productRepository.findPricedBySkus.mockResolvedValue([FRENCH_VANILLA]);
  orderRepository.insertOrder.mockRejectedValue(new Error('transaction rolled back'));

  await expect(orderService.placeOrder(1, [{ sku: 'DVG-FRENCH-VANILLA', quantity: 1 }]))
    .rejects.toThrow('transaction rolled back');
});