const pool = require('../config/db');

// Insert an order and all its line items inside one transaction.
//
// Every statement must run on the SAME connection. pool.query() hands each
// call whatever connection is free, so BEGIN would land on one connection
// and the INSERTs on others — the transaction would silently do nothing.
// Checking a connection out of the pool is what makes this atomic.
async function insertOrder(order, items) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO CustomerOrder (userID, subtotal, tax, shipping, orderTotal)
       VALUES (?, ?, ?, ?, ?)`,
      [order.userID, order.subtotal, order.tax, order.shipping, order.orderTotal]
    );
    const orderID = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO OrderItem (orderID, productID, quantity, unitPrice, lineTotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderID, item.productID, item.quantity, item.unitPrice, item.lineTotal]
      );
    }

    await conn.commit();
    return orderID;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { insertOrder };