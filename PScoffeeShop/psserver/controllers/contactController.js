const contactService = require('../services/contactService');

async function submitFeedback(req, res, next) {
  try {
    await contactService.saveFeedback({
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,
      feedback: req.body.feedback
    });

    res.status(201).json({ message: 'Thank you for your feedback' });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitFeedback };