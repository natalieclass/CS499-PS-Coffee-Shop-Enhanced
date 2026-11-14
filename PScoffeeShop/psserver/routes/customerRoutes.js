const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');
const validate = require('../middleware/validate');

const router = express.Router();

const createAccountRules = [
  body('email').isEmail().withMessage('A valid email address is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required')
];

//job is to check the input, reect it if bad, otherwise hand to the controller
router.post('/create-account', createAccountRules, validate, customerController.createAccount);

module.exports = router;