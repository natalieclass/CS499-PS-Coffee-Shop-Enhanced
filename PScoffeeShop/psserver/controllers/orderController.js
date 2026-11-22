const orderService = require('../services/orderService');

async function createOrder(req, res, next) {
  try {
    const order = await orderService.placeOrder(req.body.userID, req.body.items);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder };