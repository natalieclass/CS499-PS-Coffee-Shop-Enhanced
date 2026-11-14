const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation failed');
    err.status = 400; //error 400 = bad req
    err.details = errors.array().map(e => e.msg);
    return next(err);
  }
  next();
}

module.exports = validate;