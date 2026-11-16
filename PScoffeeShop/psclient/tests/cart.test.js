const cart = require('../js/cart.js');

beforeEach(() => {
  cart.clearCart();
});


test('subtotal is correct with two different items in the cart', () => {
  cart.setQuantity('DVG-FRENCH-VANILLA', 1);
  cart.setQuantity('DVG-RASPBERRY', 1);

  expect(cart.getSubtotalCents()).toBe(1397);
  expect(cart.taxCents()).toBe(98);
  expect(cart.shippingCents()).toBe(1500);
  expect(cart.grandTotalCents()).toBe(2995);
  expect(cart.formatCents(cart.grandTotalCents())).toBe('29.95');
});


test('changing a quantity replaces the old line total instead of adding to it', () => {
  cart.setQuantity('DVG-FRENCH-VANILLA', 2);
  cart.setQuantity('DVG-FRENCH-VANILLA', 1);

  expect(cart.getSubtotalCents()).toBe(765);
});


test('setting a quantity to 0 removes the item from the cart', () => {
  cart.setQuantity('DVG-FRENCH-VANILLA', 2);
  cart.setQuantity('DVG-FRENCH-VANILLA', 0);

  expect(cart.getQuantity('DVG-FRENCH-VANILLA')).toBe(0);
  expect(cart.getSubtotalCents()).toBe(0);
});


test('an empty cart has no shipping charge', () => {
  expect(cart.shippingCents()).toBe(0);
  expect(cart.grandTotalCents()).toBe(0);
});


test('invalid quantities are treated as zero', () => {
  cart.setQuantity('DVG-FRENCH-VANILLA', 'abc');
  expect(cart.getQuantity('DVG-FRENCH-VANILLA')).toBe(0);
  expect(cart.getSubtotalCents()).toBe(0);

  cart.setQuantity('DVG-FRENCH-VANILLA', -5);
  expect(cart.getQuantity('DVG-FRENCH-VANILLA')).toBe(0);
  expect(cart.getSubtotalCents()).toBe(0);
});


test('quantity is capped at the maximum', () => {
  cart.setQuantity('DVG-FRENCH-VANILLA', 999);

  expect(cart.getQuantity('DVG-FRENCH-VANILLA')).toBe(10);
  expect(cart.getSubtotalCents()).toBe(7650);
});


test('setting the same quantity twice does not change the subtotal', () => {
  cart.setQuantity('DVG-FRENCH-VANILLA', 2);
  cart.setQuantity('DVG-FRENCH-VANILLA', 2);

  expect(cart.getSubtotalCents()).toBe(1530);
});