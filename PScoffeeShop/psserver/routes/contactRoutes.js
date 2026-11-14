const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const validate = require('../middleware/validate');

const router = express.Router();

const feedbackRules = [
  body('fullName').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email address is required'),
  body('feedback').trim().notEmpty().withMessage('Feedback cannot be empty')
];

router.post('/submit-feedback', feedbackRules, validate, contactController.submitFeedback);
module.exports = router;