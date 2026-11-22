const productRepository = require('../repositories/productRepository');
const orderRepository = require('../repositories/orderRepository');

const TAX_RATE = 0.07;
const SHIPPING_CENTS = 1500;

// Cents in the application, DECIMAL(10,2) in the database.
function centsToDollars(cents) {
  return (cents / 100).toFixed(2);
}

async function placeOrder(userID, requestedItems) {
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    const err = new Error('Cart is empty');
    err.status = 400;
    throw err;
  }

  const skus = requestedItems.map(function (item) {
    return item.sku;
  });

  const products = await productRepository.findPricedBySkus(skus);

  if (products.length !== skus.length) {
    const err = new Error('One or more products are unavailable');
    err.status = 400;
    throw err;
  }

  let subtotalCents = 0;
  const lines = [];

  requestedItems.forEach(function (item) {
    const product = products.find(function (p) {
      return p.sku === item.sku;
    });

    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) {
      const err = new Error('Invalid quantity');
      err.status = 400;
      throw err;
    }

    const unitPriceCents = Math.round(Number(product.unitPrice) * 100);
    const lineTotalCents = unitPriceCents * quantity;
    subtotalCents += lineTotalCents;

    //.push() adds an item to end of array
    lines.push({
      productID: product.productID,
      quantity: quantity,
      unitPrice: centsToDollars(unitPriceCents),
      lineTotal: centsToDollars(lineTotalCents)
    });
  });

  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents + SHIPPING_CENTS;

  const orderID = await orderRepository.insertOrder(
    {
      userID: userID,
      subtotal: centsToDollars(subtotalCents),
      tax: centsToDollars(taxCents),
      shipping: centsToDollars(SHIPPING_CENTS),
      orderTotal: centsToDollars(totalCents)
    },
    lines
  );

  return { orderID: orderID, totalCents: totalCents };
}

module.exports = { placeOrder };