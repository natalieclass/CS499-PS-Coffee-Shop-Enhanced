const TAX_RATE = 0.07;
const SHIPPING_CENTS = 1500;
const MAX_QTY = 10;

const CATALOG_DATA = (typeof module !== 'undefined')
  ? require('./catalog.js')
  : CATALOG;

const cart = {};          // sku -> quantity
let subtotalCents = 0;    // running total; never recomputed by looping


function getQuantity(sku) {
  return cart[sku] || 0;
  // cart = { 'DVG-FRENCH-VANILLA': 2 }  ->  2
  // sku not in cart                     ->  0
}


function lineTotalCents(sku) {
  const product = CATALOG_DATA[sku];
  if (!product) return 0;
  return product.priceCents * getQuantity(sku);
  // 'DVG-FRENCH-VANILLA' at qty 2  ->  765 * 2 = 1530
}


function getSubtotalCents() {
  return subtotalCents;
  // after French Vanilla qty 2  ->  1530
}


function taxCents() {
  return Math.round(getSubtotalCents() * TAX_RATE);
  // 1530 * 0.07 = 107.1  ->  107
}


function shippingCents() {
  return Object.keys(cart).length > 0 ? SHIPPING_CENTS : 0;
  // French Vanilla in the cart  ->  1500
  // empty cart                  ->  0
}


function grandTotalCents() {
  return getSubtotalCents() + taxCents() + shippingCents();
  // 1530 + 107 + 1500 = 3137
}


function formatCents(cents) {
  return (cents / 100).toFixed(2);
  // 3137  ->  "31.37"
}


function clearCart() {
  Object.keys(cart).forEach(sku => delete cart[sku]);
  subtotalCents = 0;
}


function setQuantity(sku, qty) {
  const product = CATALOG_DATA[sku];
  if (!product) return;

  let n = Number(qty);
  if (!Number.isFinite(n) || n < 0) n = 0;
  n = Math.min(Math.floor(n), MAX_QTY);
  // setQuantity('DVG-FRENCH-VANILLA', '2')  ->  n = 2

  const oldLineTotal = lineTotalCents(sku);     // read BEFORE writing: 0 on first call
  const newLineTotal = product.priceCents * n;  // 765 * 2 = 1530

// subtract the old line total and add the new one, so the subtotal
// stays correct without rescanning the cart
  subtotalCents = subtotalCents - oldLineTotal + newLineTotal;

  if (n === 0) {
    delete cart[sku];
  } else {
    cart[sku] = n;
  }
}


if (typeof module !== 'undefined') {
  module.exports = {
    setQuantity, getQuantity, lineTotalCents, getSubtotalCents,
    taxCents, shippingCents, grandTotalCents, formatCents, clearCart
  };
}