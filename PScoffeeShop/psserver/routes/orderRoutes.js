const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post('/api/orders',
  [
    body('userID').isInt({ min: 1 }).withMessage('A valid user is required'),
    body('items').isArray({ min: 1 }).withMessage('Cart is empty'),
    body('items.*.sku').isString().notEmpty().withMessage('Each item needs a SKU'),
    body('items.*.quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be 1 to 10')
  ],
  validate,
  orderController.createOrder
);

module.exports = router;